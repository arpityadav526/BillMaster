import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as userService from '../services/userService.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendSuccess(res, user, 200, 'Profile updated successfully');
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  let avatarPath = req.file.path;
  // If local storage, convert to full absolute URL
  if (req.file.filename) {
    const protocol = req.protocol;
    const host = req.get('host');
    avatarPath = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;
  }

  const user = await userService.updateProfile(req.user._id, { avatar: avatarPath });
  sendSuccess(res, user, 200, 'Avatar updated successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await userService.updatePassword(req.user._id, oldPassword, newPassword);
  sendSuccess(res, null, 200, 'Password changed successfully');
});
