/**
 * ParserFactory — Central registry for all email parsers.
 *
 * Given an email, it finds the correct parser and returns the parsed transaction.
 * New parsers can be added simply by importing and pushing them to the `parsers` array.
 *
 * Architecture:
 * - Iterates through registered parsers in priority order
 * - First parser where canParse() returns true is used
 * - Returns null if no parser matches (unsupported provider)
 */
import GooglePayParser from './GooglePayParser.js';
import PhonePeParser from './PhonePeParser.js';
import PaytmParser from './PaytmParser.js';

class ParserFactory {
  constructor() {
    // Registered parsers — order matters (first match wins)
    // Add new parsers here as they are developed.
    this.parsers = [
      new GooglePayParser(),
      new PhonePeParser(),
      new PaytmParser(),
      // Future parsers:
      // new SBIParser(),
      // new HDFCParser(),
      // new ICICIParser(),
      // new AxisParser(),
      // new AmazonPayParser(),
    ];
  }

  /**
   * Find a matching parser for the given email content.
   * @param {{ subject: string, from: string, body: string, date: string, messageId: string }} emailContent
   * @returns {import('./BaseParser.js').default|null} The matching parser, or null.
   */
  findParser(emailContent) {
    for (const parser of this.parsers) {
      try {
        if (parser.canParse(emailContent)) {
          return parser;
        }
      } catch (err) {
        console.error(`[ParserFactory] Error in ${parser.name}.canParse():`, err.message);
      }
    }
    return null;
  }

  /**
   * Parse an email using the first matching parser.
   * @param {{ subject: string, from: string, body: string, date: string, messageId: string }} emailContent
   * @returns {{ parser: string, transaction: object }|null} The parsed result, or null.
   */
  parseEmail(emailContent) {
    const parser = this.findParser(emailContent);
    if (!parser) {
      console.log(`[ParserFactory] No parser matched for email: "${emailContent.subject}" from ${emailContent.from}`);
      return null;
    }

    try {
      const transaction = parser.parse(emailContent);
      if (!transaction) {
        console.log(`[ParserFactory] ${parser.name} matched but returned null (likely failed/unparseable transaction).`);
        return null;
      }

      return {
        parser: parser.name,
        transaction,
      };
    } catch (err) {
      console.error(`[ParserFactory] ${parser.name}.parse() threw error:`, err.message);
      return null;
    }
  }

  /**
   * Get the list of registered parser names (for status/debugging).
   * @returns {string[]}
   */
  getRegisteredParsers() {
    return this.parsers.map(p => p.name);
  }
}

// Export a singleton instance
export default new ParserFactory();
