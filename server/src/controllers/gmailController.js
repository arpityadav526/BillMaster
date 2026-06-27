/**
 * gmailController — API endpoints for Gmail OAuth and sync management.
 *
 * Endpoints:
 * - GET  /api/gmail/auth         → Generate OAuth URL and redirect user
 * - GET  /api/gmail/callback     → Handle Google OAuth callback
 * - GET  /api/gmail/status       → Check connection status
 * - POST /api/gmail/sync         → Manually trigger email sync
 * - POST /api/gmail/disconnect   → Disconnect Gmail and revoke tokens
 */
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import * as GmailService from '../services/gmail/GmailService.js';
import { syncSingleUser } from '../services/gmail/EmailSyncJob.js';

/**
 * GET /api/gmail/auth
 * Generates the Google OAuth consent URL and returns it.
 * The frontend will redirect the user to this URL.
 */
export const getAuthUrl = asyncHandler(async (req, res) => {
  const authUrl = GmailService.getAuthUrl(req.user._id.toString());
  sendSuccess(res, { authUrl }, 200, 'OAuth URL generated');
});

/**
 * GET /api/gmail/callback
 * Called by Google after the user grants (or denies) consent.
 * Exchanges the authorization code for tokens and stores them.
 * Redirects back to the frontend Settings page.
 */
export const handleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  // Google sends error param if user denied consent
  if (error) {
    console.warn('[Gmail OAuth] User denied consent:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/settings?gmail_error=denied`);
  }

  if (!code || !state) {
    throw new AppError('Missing authorization code or state parameter.', 400);
  }

  // `state` contains the userId (set during getAuthUrl)
  const userId = state;

  await GmailService.handleCallback(code, userId);

  // Redirect back to frontend Settings page with success indicator
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/settings?gmail_connected=true`);
});

/**
 * GET /api/gmail/status
 * Returns the current Gmail connection status for the authenticated user.
 */
export const getStatus = asyncHandler(async (req, res) => {
  const status = await GmailService.getStatus(req.user._id.toString());
  sendSuccess(res, status, 200, 'Gmail status retrieved');
});

/**
 * POST /api/gmail/sync
 * Manually trigger an email sync for the authenticated user.
 * Useful for "Sync Now" button in the UI.
 */
export const triggerSync = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const result = await syncSingleUser(req.user._id.toString(), io);
  sendSuccess(res, result, 200, 'Email sync triggered');
});

/**
 * POST /api/gmail/disconnect
 * Disconnect Gmail — revokes tokens and removes the connected account.
 */
export const disconnect = asyncHandler(async (req, res) => {
  const result = await GmailService.disconnectGmail(req.user._id.toString());
  sendSuccess(res, result, 200, 'Gmail disconnected successfully');
});
