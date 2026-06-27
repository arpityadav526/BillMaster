import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['salary', 'freelance', 'investment', 'rental', 'side-hustle', 'other'],
      default: 'salary',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'yearly', 'none'],
      default: 'none',
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
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
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ user: 1, date: -1 });
// Sparse unique index — ensures no duplicate email imports
incomeSchema.index({ rawEmailId: 1 }, { unique: true, sparse: true });

const Income = mongoose.model('Income', incomeSchema);
export default Income;
