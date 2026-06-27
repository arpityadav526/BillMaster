/**
 * PaytmParser — Parses Paytm transaction notification emails.
 *
 * Typical Paytm email patterns:
 * - "You have paid ₹500 to Merchant Name"
 * - "Payment Successful! ₹200 paid to Merchant"
 * - "Money received ₹300 from Sender"
 * - Subject: "Payment Confirmation - ₹1,000"
 * - From: noreply@paytm.com, alerts@paytm.com, transactions@paytm.com
 */
import BaseParser from './BaseParser.js';

export default class PaytmParser extends BaseParser {
  get name() {
    return 'PaytmParser';
  }

  canParse(emailContent) {
    const { from, subject, body } = emailContent;
    const combinedText = `${from} ${subject} ${body}`.toLowerCase();

    const isFromPaytm = /paytm\.com/i.test(from) || /paytm/i.test(subject);
    const hasTransactionKeywords = /\b(payment|transaction|paid|received|wallet|cashback)\b/i.test(combinedText);

    return isFromPaytm && hasTransactionKeywords;
  }

  parse(emailContent) {
    const { subject, body, date, messageId } = emailContent;
    const combinedText = `${subject} ${body}`;

    // Skip failed transactions
    const status = this.detectStatus(combinedText);
    if (status === 'failed') return null;

    // Extract amount
    const amount = this.extractAmount(combinedText);
    if (!amount) return null;

    // Detect type — Paytm has unique cashback pattern
    let type = this.detectTransactionType(combinedText);
    const isCashback = /cashback/i.test(combinedText);
    if (isCashback) type = 'income';

    // Detect payment method — Paytm supports wallet payments
    let paymentMethod = 'upi';
    if (/wallet/i.test(combinedText)) paymentMethod = 'wallet';
    if (/bank\s*(?:account|transfer)/i.test(combinedText)) paymentMethod = 'bank_transfer';

    // Extract merchant name
    let merchant = 'Unknown';
    const merchantPatterns = [
      /(?:paid|payment\s*(?:of|to)?)\s*(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{2})?\s*(?:to)\s+(.+?)(?:\s+on|\s+via|\s+using|\.|!|$)/i,
      /(?:to)\s+(.+?)(?:\s+successful|\s+completed|\s+on|\.|!|$)/i,
      /(?:received)\s*(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{2})?\s*(?:from)\s+(.+?)(?:\s+on|\s+via|\.|!|$)/i,
      /(?:cashback)\s*(?:from|by|of)?\s*(.+?)(?:\s+on|\.|!|$)/i,
    ];

    for (const pattern of merchantPatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        merchant = match[1];
        break;
      }
    }

    if (isCashback && merchant === 'Unknown') {
      merchant = 'Paytm Cashback';
    }

    merchant = this.cleanMerchantName(merchant);

    // Extract UPI reference & Paytm Order ID
    const upiRef = this.extractUpiRef(combinedText);
    let transactionId = null;
    const orderIdMatch = combinedText.match(/(?:order\s*(?:ID|id)?|transaction\s*(?:ID|id)?)[:\s]*([A-Z0-9]+)/i);
    if (orderIdMatch) {
      transactionId = orderIdMatch[1];
    }

    const transactionDate = this.extractDate(body, date);

    return {
      amount,
      merchant,
      type,
      paymentMethod,
      date: transactionDate,
      upiReferenceNumber: upiRef,
      transactionId: transactionId || upiRef,
      emailProvider: 'paytm',
      rawEmailId: messageId,
      description: `Paytm ${isCashback ? 'cashback' : type === 'expense' ? 'payment to' : 'received from'} ${merchant}`,
      status,
    };
  }
}
