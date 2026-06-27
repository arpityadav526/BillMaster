/**
 * Unit Tests — Email Parsers & CategorizationService
 *
 * Tests GooglePayParser, PhonePeParser, PaytmParser, and the
 * CategorizationService against sample transaction email content.
 */
import GooglePayParser from '../src/services/parsers/GooglePayParser.js';
import PhonePeParser from '../src/services/parsers/PhonePeParser.js';
import PaytmParser from '../src/services/parsers/PaytmParser.js';
import ParserFactory from '../src/services/parsers/ParserFactory.js';
import { categorize, getCategoryLabel } from '../src/services/CategorizationService.js';

// ========== Sample Email Content ==========

const sampleGPayExpense = {
  subject: 'You sent ₹500.00 to Dominos Pizza',
  from: 'noreply@google.com',
  body: 'You paid ₹500.00 to Dominos Pizza on 26 Jun 2025 via Google Pay. UPI Ref No: 123456789012. Payment successful.',
  date: 'Thu, 26 Jun 2025 14:30:00 +0530',
  messageId: 'gpay_msg_001',
};

const sampleGPayIncome = {
  subject: '₹1,200 received from Rahul Sharma',
  from: 'noreply@google.com',
  body: '₹1,200.00 received from Rahul Sharma on 26 Jun 2025 via Google Pay. UPI Ref No: 987654321098.',
  date: 'Thu, 26 Jun 2025 10:00:00 +0530',
  messageId: 'gpay_msg_002',
};

const sampleGPayFailed = {
  subject: 'Payment to Merchant failed',
  from: 'noreply@google.com',
  body: 'Your payment of ₹300 to Merchant has failed. Please try again. Google Pay.',
  date: 'Thu, 26 Jun 2025 11:00:00 +0530',
  messageId: 'gpay_msg_003',
};

const samplePhonePeExpense = {
  subject: 'Transaction Successful - ₹750 paid to Swiggy',
  from: 'noreply@phonepe.com',
  body: 'Payment of ₹750.00 to Swiggy was successful on 25 Jun 2025. Transaction ID: TXN789456. UPI Ref No: 456789012345.',
  date: 'Wed, 25 Jun 2025 19:45:00 +0530',
  messageId: 'phonepe_msg_001',
};

const samplePhonePeIncome = {
  subject: 'You received ₹5,000 via PhonePe',
  from: 'alerts@phonepe.com',
  body: 'You received ₹5,000.00 from Employer Corp via PhonePe on 25 Jun 2025. UPI Ref No: 111222333444.',
  date: 'Wed, 25 Jun 2025 09:00:00 +0530',
  messageId: 'phonepe_msg_002',
};

const samplePaytmExpense = {
  subject: 'Payment Confirmation - ₹1,499',
  from: 'noreply@paytm.com',
  body: 'You have paid ₹1,499.00 to Netflix using your Paytm wallet on 24 Jun 2025. Order ID: ORD12345.',
  date: 'Tue, 24 Jun 2025 20:00:00 +0530',
  messageId: 'paytm_msg_001',
};

const samplePaytmCashback = {
  subject: 'Cashback received!',
  from: 'alerts@paytm.com',
  body: 'Congratulations! You have received ₹50.00 cashback from Paytm on 24 Jun 2025.',
  date: 'Tue, 24 Jun 2025 21:00:00 +0530',
  messageId: 'paytm_msg_002',
};

const unrelatedEmail = {
  subject: 'Your weekly newsletter',
  from: 'newsletter@medium.com',
  body: 'Here are the top stories this week...',
  date: 'Mon, 23 Jun 2025 08:00:00 +0530',
  messageId: 'unrelated_001',
};

// ========== GooglePayParser Tests ==========

describe('GooglePayParser', () => {
  const parser = new GooglePayParser();

  test('should identify GPay expense email', () => {
    expect(parser.canParse(sampleGPayExpense)).toBe(true);
  });

  test('should identify GPay income email', () => {
    expect(parser.canParse(sampleGPayIncome)).toBe(true);
  });

  test('should NOT match unrelated emails', () => {
    expect(parser.canParse(unrelatedEmail)).toBe(false);
  });

  test('should parse expense correctly', () => {
    const result = parser.parse(sampleGPayExpense);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(500);
    expect(result.type).toBe('expense');
    expect(result.emailProvider).toBe('google_pay');
    expect(result.rawEmailId).toBe('gpay_msg_001');
    expect(result.paymentMethod).toBe('upi');
    expect(result.upiReferenceNumber).toBe('123456789012');
  });

  test('should parse income correctly', () => {
    const result = parser.parse(sampleGPayIncome);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(1200);
    expect(result.type).toBe('income');
    expect(result.upiReferenceNumber).toBe('987654321098');
  });

  test('should return null for failed transactions', () => {
    const result = parser.parse(sampleGPayFailed);
    expect(result).toBeNull();
  });
});

// ========== PhonePeParser Tests ==========

describe('PhonePeParser', () => {
  const parser = new PhonePeParser();

  test('should identify PhonePe expense email', () => {
    expect(parser.canParse(samplePhonePeExpense)).toBe(true);
  });

  test('should identify PhonePe income email', () => {
    expect(parser.canParse(samplePhonePeIncome)).toBe(true);
  });

  test('should NOT match unrelated emails', () => {
    expect(parser.canParse(unrelatedEmail)).toBe(false);
  });

  test('should parse expense correctly', () => {
    const result = parser.parse(samplePhonePeExpense);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(750);
    expect(result.type).toBe('expense');
    expect(result.emailProvider).toBe('phonepe');
    expect(result.rawEmailId).toBe('phonepe_msg_001');
  });

  test('should parse income correctly', () => {
    const result = parser.parse(samplePhonePeIncome);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(5000);
    expect(result.type).toBe('income');
  });
});

// ========== PaytmParser Tests ==========

describe('PaytmParser', () => {
  const parser = new PaytmParser();

  test('should identify Paytm expense email', () => {
    expect(parser.canParse(samplePaytmExpense)).toBe(true);
  });

  test('should identify Paytm cashback email', () => {
    expect(parser.canParse(samplePaytmCashback)).toBe(true);
  });

  test('should NOT match unrelated emails', () => {
    expect(parser.canParse(unrelatedEmail)).toBe(false);
  });

  test('should parse expense correctly', () => {
    const result = parser.parse(samplePaytmExpense);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(1499);
    expect(result.type).toBe('expense');
    expect(result.emailProvider).toBe('paytm');
    expect(result.paymentMethod).toBe('wallet');
  });

  test('should parse cashback as income', () => {
    const result = parser.parse(samplePaytmCashback);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(50);
    expect(result.type).toBe('income');
  });
});

// ========== ParserFactory Tests ==========

describe('ParserFactory', () => {
  test('should find GooglePayParser for GPay email', () => {
    const result = ParserFactory.parseEmail(sampleGPayExpense);
    expect(result).not.toBeNull();
    expect(result.parser).toBe('GooglePayParser');
    expect(result.transaction.amount).toBe(500);
  });

  test('should find PhonePeParser for PhonePe email', () => {
    const result = ParserFactory.parseEmail(samplePhonePeExpense);
    expect(result).not.toBeNull();
    expect(result.parser).toBe('PhonePeParser');
  });

  test('should find PaytmParser for Paytm email', () => {
    const result = ParserFactory.parseEmail(samplePaytmExpense);
    expect(result).not.toBeNull();
    expect(result.parser).toBe('PaytmParser');
  });

  test('should return null for unmatched email', () => {
    const result = ParserFactory.parseEmail(unrelatedEmail);
    expect(result).toBeNull();
  });

  test('should list registered parsers', () => {
    const parsers = ParserFactory.getRegisteredParsers();
    expect(parsers).toContain('GooglePayParser');
    expect(parsers).toContain('PhonePeParser');
    expect(parsers).toContain('PaytmParser');
  });
});

// ========== CategorizationService Tests ==========

describe('CategorizationService', () => {
  test('should categorize food merchants correctly', () => {
    expect(categorize('Swiggy')).toBe('food');
    expect(categorize('Zomato')).toBe('food');
    expect(categorize('Dominos Pizza')).toBe('food');
    expect(categorize("McDonald's")).toBe('food');
  });

  test('should categorize transport merchants correctly', () => {
    expect(categorize('Uber')).toBe('transport');
    expect(categorize('Ola Cabs')).toBe('transport');
    expect(categorize('Rapido')).toBe('transport');
  });

  test('should categorize shopping merchants correctly', () => {
    expect(categorize('Amazon')).toBe('shopping');
    expect(categorize('Flipkart')).toBe('shopping');
    expect(categorize('Myntra Fashion')).toBe('shopping');
  });

  test('should categorize entertainment merchants correctly', () => {
    expect(categorize('Netflix')).toBe('entertainment');
    expect(categorize('Spotify')).toBe('entertainment');
    expect(categorize('PVR Cinemas')).toBe('entertainment');
  });

  test('should categorize bills correctly', () => {
    expect(categorize('Airtel Broadband')).toBe('bills');
    expect(categorize('Jio Recharge')).toBe('bills');
    expect(categorize('Electricity Board')).toBe('bills');
  });

  test('should categorize health merchants correctly', () => {
    expect(categorize('Apollo Pharmacy')).toBe('health');
    expect(categorize('Practo Clinic')).toBe('health');
  });

  test('should return "other" for unknown merchants', () => {
    expect(categorize('Random Unknown Shop')).toBe('other');
    expect(categorize('')).toBe('other');
    expect(categorize(null)).toBe('other');
  });

  test('should be case-insensitive', () => {
    expect(categorize('SWIGGY')).toBe('food');
    expect(categorize('netflix')).toBe('entertainment');
    expect(categorize('UBER')).toBe('transport');
  });

  test('getCategoryLabel should return display labels', () => {
    expect(getCategoryLabel('food')).toBe('Food & Dining');
    expect(getCategoryLabel('transport')).toBe('Transport');
    expect(getCategoryLabel('unknown')).toBe('Other');
  });
});
