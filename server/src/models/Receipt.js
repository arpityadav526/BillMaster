import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    // OCR-extracted data
    extractedData: {
      vendor: { type: String, default: null },
      amount: { type: Number, default: null },
      date: { type: Date, default: null },
      category: { type: String, default: null },
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

receiptSchema.index({ user: 1, createdAt: -1 });

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
