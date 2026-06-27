import mongoose from 'mongoose';

const connectedAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['google_pay', 'phonepe', 'paytm', 'bank', 'gmail'],
    },
    accountName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'connected',
    },
    lastSynced: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

connectedAccountSchema.index({ user: 1, provider: 1 }, { unique: true });

const ConnectedAccount = mongoose.model('ConnectedAccount', connectedAccountSchema);
export default ConnectedAccount;
