/**
 * CategorizationService — Automatically classifies merchants into expense categories.
 *
 * Uses a merchant-keyword mapping to assign categories that match
 * the existing BillMaster CATEGORIES enum from the Expense model.
 *
 * If no match is found, defaults to 'other'.
 *
 * Categories: food, transport, shopping, bills, entertainment,
 *             health, education, travel, subscriptions, other
 */

// ========== Merchant → Category Mapping ==========
// Keys are lowercase substrings to match against the merchant name.
// Values are the BillMaster category enum values.
const MERCHANT_MAP = {
  // Food & Dining
  'swiggy': 'food',
  'zomato': 'food',
  'domino': 'food',
  'pizza': 'food',
  'mcdonald': 'food',
  'burger king': 'food',
  'kfc': 'food',
  'starbucks': 'food',
  'subway': 'food',
  'dunkin': 'food',
  'cafe': 'food',
  'restaurant': 'food',
  'food': 'food',
  'biryani': 'food',
  'kitchen': 'food',
  'dine': 'food',
  'eat': 'food',
  'bakery': 'food',
  'barbeque': 'food',
  'haldiram': 'food',
  'chai': 'food',

  // Transport
  'uber': 'transport',
  'ola': 'transport',
  'rapido': 'transport',
  'metro': 'transport',
  'irctc': 'transport',
  'railway': 'transport',
  'petrol': 'transport',
  'fuel': 'transport',
  'diesel': 'transport',
  'parking': 'transport',
  'toll': 'transport',
  'cab': 'transport',
  'taxi': 'transport',
  'auto': 'transport',
  'bluedart': 'transport',
  'delhivery': 'transport',

  // Shopping
  'amazon': 'shopping',
  'flipkart': 'shopping',
  'myntra': 'shopping',
  'ajio': 'shopping',
  'meesho': 'shopping',
  'nykaa': 'shopping',
  'shoppers stop': 'shopping',
  'lifestyle': 'shopping',
  'reliance': 'shopping',
  'dmart': 'shopping',
  'big bazaar': 'shopping',
  'mall': 'shopping',
  'mart': 'shopping',
  'store': 'shopping',
  'croma': 'shopping',
  'vijay sales': 'shopping',

  // Bills & Utilities
  'electricity': 'bills',
  'bescom': 'bills',
  'water': 'bills',
  'gas': 'bills',
  'broadband': 'bills',
  'airtel': 'bills',
  'jio': 'bills',
  'vi ': 'bills',
  'vodafone': 'bills',
  'bsnl': 'bills',
  'recharge': 'bills',
  'postpaid': 'bills',
  'prepaid': 'bills',
  'bill payment': 'bills',
  'utility': 'bills',
  'insurance': 'bills',
  'lic': 'bills',
  'rent': 'bills',
  'maintenance': 'bills',
  'society': 'bills',
  'municipal': 'bills',

  // Entertainment
  'netflix': 'entertainment',
  'spotify': 'entertainment',
  'hotstar': 'entertainment',
  'disney': 'entertainment',
  'prime video': 'entertainment',
  'youtube': 'entertainment',
  'apple music': 'entertainment',
  'gaana': 'entertainment',
  'jio cinema': 'entertainment',
  'sony liv': 'entertainment',
  'zee5': 'entertainment',
  'pvr': 'entertainment',
  'inox': 'entertainment',
  'cinema': 'entertainment',
  'movie': 'entertainment',
  'game': 'entertainment',
  'play store': 'entertainment',
  'steam': 'entertainment',

  // Health
  'pharmacy': 'health',
  'apollo': 'health',
  'medplus': 'health',
  'hospital': 'health',
  'doctor': 'health',
  'clinic': 'health',
  'medical': 'health',
  'pharma': 'health',
  'netmeds': 'health',
  'practo': 'health',
  '1mg': 'health',
  'gym': 'health',
  'fitness': 'health',
  'yoga': 'health',
  'cult.fit': 'health',
  'lab': 'health',
  'diagnostic': 'health',

  // Education
  'udemy': 'education',
  'coursera': 'education',
  'school': 'education',
  'college': 'education',
  'university': 'education',
  'tuition': 'education',
  'coaching': 'education',
  'unacademy': 'education',
  'byju': 'education',
  'book': 'education',
  'kindle': 'education',
  'exam': 'education',
  'course': 'education',
  'training': 'education',

  // Travel
  'makemytrip': 'travel',
  'goibibo': 'travel',
  'cleartrip': 'travel',
  'yatra': 'travel',
  'oyo': 'travel',
  'airbnb': 'travel',
  'hotel': 'travel',
  'flight': 'travel',
  'booking.com': 'travel',
  'indigo': 'travel',
  'spicejet': 'travel',
  'vistara': 'travel',
  'air india': 'travel',

  // Subscriptions
  'subscription': 'subscriptions',
  'plan renewal': 'subscriptions',
  'monthly plan': 'subscriptions',
  'annual plan': 'subscriptions',
  'membership': 'subscriptions',
  'premium': 'subscriptions',
  'icloud': 'subscriptions',
  'google one': 'subscriptions',
  'dropbox': 'subscriptions',
  'notion': 'subscriptions',
};

/**
 * Categorize a merchant name by matching against the known map.
 * @param {string} merchantName - The extracted merchant name.
 * @returns {string} BillMaster category string.
 */
export function categorize(merchantName) {
  if (!merchantName) return 'other';

  const lowerMerchant = merchantName.toLowerCase().trim();

  // Direct lookup — iterate through map entries
  for (const [keyword, category] of Object.entries(MERCHANT_MAP)) {
    if (lowerMerchant.includes(keyword)) {
      return category;
    }
  }

  return 'other';
}

/**
 * Get the display-friendly category label.
 * @param {string} categoryKey - The BillMaster category key (e.g., 'food').
 * @returns {string} Display label (e.g., 'Food & Dining').
 */
export function getCategoryLabel(categoryKey) {
  const labels = {
    food: 'Food & Dining',
    transport: 'Transport',
    shopping: 'Shopping',
    bills: 'Bills & Utilities',
    entertainment: 'Entertainment',
    health: 'Health',
    education: 'Education',
    travel: 'Travel',
    subscriptions: 'Subscriptions',
    other: 'Other',
  };
  return labels[categoryKey] || 'Other';
}

/**
 * Get the full merchant map (for debugging/admin).
 * @returns {object}
 */
export function getMerchantMap() {
  return { ...MERCHANT_MAP };
}
