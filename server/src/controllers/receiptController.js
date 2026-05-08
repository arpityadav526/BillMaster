import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import Receipt from '../models/Receipt.js';
import { v2 as cloudinary } from 'cloudinary';

export const uploadReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const receipt = await Receipt.create({
    user: req.user._id,
    originalName: req.file.originalname,
    fileUrl: req.file.path,
    publicId: req.file.filename, // multer-storage-cloudinary stores the public_id in req.file.filename
    mimetype: req.file.mimetype,
    size: req.file.size,
    status: 'uploaded',
  });

  // In production, trigger OCR processing job here
  // For now, simulate status change
  setTimeout(async () => {
    try {
      await Receipt.findByIdAndUpdate(receipt._id, { status: 'processing' });
      setTimeout(async () => {
        try {
          await Receipt.findByIdAndUpdate(receipt._id, {
            status: 'processed',
            extractedData: {
              vendor: 'Sample Vendor',
              amount: Math.round(Math.random() * 200 * 100) / 100,
              date: new Date(),
              category: 'other',
            },
          });
        } catch { /* ignore simulation errors */ }
      }, 3000);
    } catch { /* ignore simulation errors */ }
  }, 2000);

  sendCreated(res, receipt, 'Receipt uploaded successfully');
});

export const getReceipts = asyncHandler(async (req, res) => {
  const receipts = await Receipt.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, receipts);
});

export const deleteReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  // Delete from Cloudinary
  try {
    if (receipt.publicId) {
      await cloudinary.uploader.destroy(receipt.publicId);
    }
  } catch (err) {
    console.error('Failed to delete receipt from Cloudinary:', err);
  }

  sendSuccess(res, null, 200, 'Receipt deleted successfully');
});
