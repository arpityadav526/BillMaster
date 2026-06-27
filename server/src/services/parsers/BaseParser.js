/**
 * BaseParser — Abstract base class for all email transaction parsers.
 *
 * Each parser must implement:
 * - canParse(emailContent) → boolean
 * - parse(emailContent)    → StandardizedTransaction
 *
 * The StandardizedTransaction shape:
 * {
 *   amount: number,
 *   merchant: string,
 *   type: 'expense' | 'income',
 *   category: string,
 *   paymentMethod: 'upi' | 'card' | 'bank_transfer' | 'wallet',
 *   date: Date,
 *   upiReferenceNumber: string | null,
 *   transactionId: string | null,
 *   emailProvider: string,
 *   rawEmailId: string,
 *   description: string,
 *   status: 'completed' | 'pending' | 'failed',
 * }
 */
export default class BaseParser {
  /**
   * Name of the parser (for logging and identification).
   */
  get name() {
    return 'BaseParser';
  }

  /**
   * Determine if this parser can handle the given email.
   * @param {{ subject: string, from: string, body: string, date: string, messageId: string }} emailContent
   * @returns {boolean}
   */
  canParse(_emailContent) {
    throw new Error(`${this.name}.canParse() must be implemented by subclass.`);
  }

  /**
   * Parse the email content and extract a standardized transaction.
   * @param {{ subject: string, from: string, body: string, date: string, messageId: string }} emailContent
   * @returns {object|null} Standardized transaction object, or null if parsing fails.
   */
  parse(_emailContent) {
    throw new Error(`${this.name}.parse() must be implemented by subclass.`);
  }

  // ========== Shared Helper Methods ==========

  /**
   * Extract a monetary amount from text using common Indian Rupee patterns.
   * Handles: ₹1,234.56, Rs. 1234, INR 1,234.00, Rs 500
   * @param {string} text
   * @returns {number|null}
   */
  extractAmount(text) {
    // Match ₹, Rs., Rs, INR followed by optional space and digits with commas/decimals
    const patterns = [
      /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i,
      /(?:amount|paid|received|debited|credited)[:\s]*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    return null;
  }

  /**
   * Extract a UPI reference number from text.
   * Typical format: 12-digit numeric string.
   * @param {string} text
   * @returns {string|null}
   */
  extractUpiRef(text) {
    const patterns = [
      /(?:UPI\s*(?:Ref(?:erence)?\.?\s*(?:No\.?|Number|ID)?|transaction\s*ID)[:\s]*)([\d]{8,14})/i,
      /(?:Ref(?:erence)?\.?\s*(?:No\.?|Number|ID)?)[:\s]*([\d]{8,14})/i,
      /\b(\d{12})\b/,  // Fallback: any standalone 12-digit number
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Extract a transaction date from email body text.
   * Falls back to the email's own Date header.
   * @param {string} bodyText
   * @param {string} emailDateHeader
   * @returns {Date}
   */
  extractDate(bodyText, emailDateHeader) {
    // Try common date formats in body: "26 Jun 2025", "2025-06-26", "06/26/2025"
    const datePatterns = [
      /(\d{1,2}[\s/-]\w{3,9}[\s/-]\d{2,4})/,    // 26 Jun 2025, 26-Jun-2025
      /(\d{4}-\d{2}-\d{2})/,                       // 2025-06-26
      /(\d{2}\/\d{2}\/\d{4})/,                     // 06/26/2025
    ];

    for (const pattern of datePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    // Fallback to email header date
    return new Date(emailDateHeader);
  }

  /**
   * Determine if the transaction is an expense or income from keywords.
   * @param {string} text
   * @returns {'expense'|'income'}
   */
  detectTransactionType(text) {
    const incomeKeywords = /\b(received|credited|credit|refund|cashback|money\s*received)\b/i;
    const expenseKeywords = /\b(paid|debited|debit|sent|payment|purchased|charged)\b/i;

    if (incomeKeywords.test(text)) return 'income';
    if (expenseKeywords.test(text)) return 'expense';
    return 'expense'; // Default to expense
  }

  /**
   * Check if the transaction was successful.
   * @param {string} text
   * @returns {'completed'|'pending'|'failed'}
   */
  detectStatus(text) {
    if (/\b(failed|failure|unsuccessful|declined|rejected)\b/i.test(text)) return 'failed';
    if (/\b(pending|processing|initiated)\b/i.test(text)) return 'pending';
    return 'completed';
  }

  /**
   * Clean and normalize merchant name.
   * @param {string} raw
   * @returns {string}
   */
  cleanMerchantName(raw) {
    if (!raw) return 'Unknown Merchant';
    return raw
      .replace(/[@\d]+/g, '')          // Remove @ symbols and numbers
      .replace(/[_\-]+/g, ' ')         // Replace underscores/dashes with spaces
      .replace(/\s+/g, ' ')            // Collapse whitespace
      .trim()
      || 'Unknown Merchant';
  }
}
