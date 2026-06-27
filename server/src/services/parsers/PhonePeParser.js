/**
 * PhonePeParser — Parses PhonePe transaction notification emails.
 *
 * Typical PhonePe email patterns:
 * - "Payment of ₹500 to Merchant was successful"
 * - "You received ₹200 from Sender via PhonePe"
 * - Subject: "Transaction Successful - ₹1,000 paid to ..."
 * - From: noreply@phonepe.com or alerts@phonepe.com
 */
import BaseParser from './BaseParser.js';

export default class PhonePeParser extends BaseParser {
  get name() {
    return 'PhonePeParser';
  }

  canParse(emailContent) {
    const { from, subject, body } = emailContent;
    const combinedText = `${from} ${subject} ${body}`.toLowerCase();

    const isFromPhonePe = /phonepe\.com/i.test(from) || /phonepe/i.test(subject);
    const hasTransactionKeywords = /\b(payment|transaction|paid|received|debited|credited)\b/i.test(combinedText);

    return isFromPhonePe && hasTransactionKeywords;
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

    // Detect type
    const type = this.detectTransactionType(combinedText);

    // Extract merchant name from PhonePe-specific patterns
    let merchant = 'Unknown';
    const paidPatterns = [
      /(?:paid|payment\s*(?:of)?)\s*(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{2})?\s*(?:to)\s+(.+?)(?:\s+was|\s+on|\s+via|\.|$)/i,
      /(?:to)\s+(.+?)(?:\s+was\s+successful|\s+completed)/i,
    ];
    const receivedPatterns = [
      /(?:received)\s*(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{2})?\s*(?:from)\s+(.+?)(?:\s+via|\s+on|\.|$)/i,
    ];

    const patterns = type === 'expense' ? paidPatterns : receivedPatterns;
    for (const pattern of patterns) {
      const match = combinedText.match(pattern);
      if (match) {
        merchant = match[1];
        break;
      }
    }

    merchant = this.cleanMerchantName(merchant);

    // Extract UPI reference
    const upiRef = this.extractUpiRef(combinedText);

    // Extract transaction ID (PhonePe-specific)
    let transactionId = null;
    const txnIdMatch = combinedText.match(/(?:transaction\s*(?:ID|id|Id)?)[:\s]*([A-Z0-9]+)/i);
    if (txnIdMatch) {
      transactionId = txnIdMatch[1];
    }

    const transactionDate = this.extractDate(body, date);

    return {
      amount,
      merchant,
      type,
      paymentMethod: 'upi',
      date: transactionDate,
      upiReferenceNumber: upiRef,
      transactionId: transactionId || upiRef,
      emailProvider: 'phonepe',
      rawEmailId: messageId,
      description: `PhonePe ${type === 'expense' ? 'payment to' : 'received from'} ${merchant}`,
      status,
    };
  }
}
