import mongoose from 'mongoose';

const CATEGORIES = [
  'food', 'transport', 'shopping', 'bills', 'entertainment',
  'health', 'education', 'travel', 'subscriptions', 'other',
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled'],
      default: 'completed',
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'other'],
      default: 'other',
    },
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt',
      default: null,
    },
    // ========== Gmail Auto-Import Fields ==========
    isAutomated: {
      type: Boolean,
      default: false,
    },
    rawEmailId: {
      type: String,
      default: null,
    },
    upiReferenceNumber: {
      type: String,
      default: null,
    },
    emailProvider: {
      type: String,
      enum: ['google_pay', 'phonepe', 'paytm', 'sbi', 'hdfc', 'icici', 'axis', 'amazon_pay', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, createdAt: -1 });
// Sparse unique index — ensures no duplicate email imports
expenseSchema.index({ rawEmailId: 1 }, { unique: true, sparse: true });

export { CATEGORIES };
const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
