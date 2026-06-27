/**
 * GooglePayParser — Parses Google Pay (GPay) transaction notification emails.
 *
 * Typical GPay email patterns:
 * - "You paid ₹500 to Merchant Name"
 * - "₹200 received from Sender Name"
 * - Subject: "You sent ₹1,000 to ..."
 * - From: noreply@google.com
 */
import BaseParser from './BaseParser.js';

export default class GooglePayParser extends BaseParser {
  get name() {
    return 'GooglePayParser';
  }

  canParse(emailContent) {
    const { from, subject, body } = emailContent;
    const combinedText = `${from} ${subject} ${body}`.toLowerCase();

    // Must be from Google AND contain transaction-related keywords
    const isFromGoogle = /noreply@google\.com/i.test(from) || /google\s*pay/i.test(from);
    const hasTransactionKeywords = /\b(paid|sent|received|payment|google\s*pay|gpay)\b/i.test(combinedText);

    return isFromGoogle && hasTransactionKeywords;
  }

  parse(emailContent) {
    const { subject, body, date, messageId } = emailContent;
    const combinedText = `${subject} ${body}`;

    // Detect if this transaction failed
    const status = this.detectStatus(combinedText);
    if (status === 'failed') return null; // Skip failed transactions

    // Extract amount
    const amount = this.extractAmount(combinedText);
    if (!amount) return null; // Cannot parse without amount

    // Detect type (expense or income)
    const type = this.detectTransactionType(combinedText);

    // Extract merchant/receiver name
    let merchant = 'Unknown';
    const paidToMatch = combinedText.match(/(?:paid|sent)\s+(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{2})?\s+(?:to|for)\s+(.+?)(?:\s+on|\s+via|\s+using|\.|$)/i);
    const receivedFromMatch = combinedText.match(/(?:received|credited)\s+(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{2})?\s+(?:from)\s+(.+?)(?:\s+on|\s+via|\s+using|\.|$)/i);
    const subjectMerchant = subject.match(/(?:to|from)\s+(.+?)(?:\s+on|\s*$)/i);

    if (type === 'expense' && paidToMatch) {
      merchant = paidToMatch[1];
    } else if (type === 'income' && receivedFromMatch) {
      merchant = receivedFromMatch[1];
    } else if (subjectMerchant) {
      merchant = subjectMerchant[1];
    }

    merchant = this.cleanMerchantName(merchant);

    // Extract UPI reference number
    const upiRef = this.extractUpiRef(combinedText);

    // Extract date
    const transactionDate = this.extractDate(body, date);

    return {
      amount,
      merchant,
      type,
      paymentMethod: 'upi',
      date: transactionDate,
      upiReferenceNumber: upiRef,
      transactionId: upiRef, // GPay uses UPI ref as transaction ID
      emailProvider: 'google_pay',
      rawEmailId: messageId,
      description: `Google Pay ${type === 'expense' ? 'payment to' : 'received from'} ${merchant}`,
      status,
    };
  }
}
