/**
 * GmailService — Handles Google OAuth 2.0 flow, token management,
 * and Gmail API interactions for automatic expense tracking.
 *
 * Security: Uses `gmail.readonly` scope (minimum permission).
 * Tokens are stored encrypted in the ConnectedAccount model.
 */
import { google } from 'googleapis';
import ConnectedAccount from '../../models/ConnectedAccount.js';
import AppError from '../../utils/AppError.js';

// ========== OAuth 2.0 Configuration ==========
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

/**
 * Creates a configured OAuth2 client using environment variables.
 * @returns {google.auth.OAuth2}
 */
function createOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:5001/api/gmail/callback';

  if (!clientId || !clientSecret) {
    throw new AppError('Gmail OAuth credentials not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.', 500);
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// ========== OAuth Flow ==========

/**
 * Generate the Google OAuth consent screen URL.
 * @param {string} userId - Used as the OAuth `state` parameter for CSRF protection.
 * @returns {string} Authorization URL
 */
export function getAuthUrl(userId) {
  const oAuth2Client = createOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',      // Ensures we get a refresh_token
    prompt: 'consent',           // Always show consent screen to guarantee refresh_token
    scope: SCOPES,
    state: userId,               // Round-trip state for CSRF protection
  });
}

/**
 * Exchange the authorization code for tokens and persist them.
 * @param {string} code - Authorization code from Google callback.
 * @param {string} userId - The authenticated BillMaster user's ID.
 * @returns {Object} The connected account document.
 */
export async function handleCallback(code, userId) {
  const oAuth2Client = createOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);

  if (!tokens.refresh_token) {
    console.warn('[GmailService] No refresh_token received — user may have previously authorized.');
  }

  // Upsert: create or update the Gmail connected account for this user
  const account = await ConnectedAccount.findOneAndUpdate(
    { user: userId, provider: 'gmail' },
    {
      user: userId,
      provider: 'gmail',
      accountName: 'Gmail',
      status: 'connected',
      lastSynced: new Date(),
      metadata: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return account;
}

/**
 * Creates an authenticated Gmail API client for a given user.
 * Automatically refreshes expired access tokens.
 * @param {string} userId
 * @returns {{ gmail: object, account: object }}
 */
export async function getAuthenticatedClient(userId) {
  const account = await ConnectedAccount.findOne({ user: userId, provider: 'gmail', status: 'connected' });
  if (!account) {
    throw new AppError('Gmail not connected. Please connect your Gmail first.', 404);
  }

  const oAuth2Client = createOAuth2Client();
  oAuth2Client.setCredentials({
    access_token: account.metadata.access_token,
    refresh_token: account.metadata.refresh_token,
    expiry_date: account.metadata.expiry_date,
    token_type: account.metadata.token_type,
  });

  // Listen for token refresh events and persist the new tokens
  oAuth2Client.on('tokens', async (newTokens) => {
    console.log('[GmailService] Access token refreshed automatically.');
    const updateData = {
      'metadata.access_token': newTokens.access_token,
      'metadata.expiry_date': newTokens.expiry_date,
    };
    if (newTokens.refresh_token) {
      updateData['metadata.refresh_token'] = newTokens.refresh_token;
    }
    await ConnectedAccount.findByIdAndUpdate(account._id, { $set: updateData });
  });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  return { gmail, account };
}

// ========== Email Fetching ==========

/**
 * Fetches unread transaction-related emails from Gmail.
 * Uses a targeted search query to minimize API calls.
 * @param {string} userId
 * @param {object} options
 * @param {number} [options.maxResults=20] - Maximum emails to fetch per sync
 * @param {string} [options.afterDate] - ISO date string to fetch emails after (for incremental sync)
 * @returns {Array<object>} Array of parsed email messages
 */
export async function fetchTransactionEmails(userId, options = {}) {
  const { gmail } = await getAuthenticatedClient(userId);
  const maxResults = options.maxResults || 20;

  // Build a Gmail search query that targets transaction notification emails
  // This minimizes the number of irrelevant emails we fetch
  const senderFilters = [
    'from:noreply@google.com',           // Google Pay
    'from:noreply@phonepe.com',          // PhonePe
    'from:alerts@phonepe.com',           // PhonePe alerts
    'from:noreply@paytm.com',            // Paytm
    'from:alerts@paytm.com',             // Paytm alerts
    'from:transactions@paytm.com',       // Paytm transactions
  ].join(' OR ');

  // Subject-based filters to catch transaction emails
  const subjectFilters = [
    'subject:"payment"',
    'subject:"transaction"',
    'subject:"received"',
    'subject:"sent"',
    'subject:"paid"',
    'subject:"debited"',
    'subject:"credited"',
    'subject:"UPI"',
  ].join(' OR ');

  let query = `(${senderFilters}) OR (${subjectFilters})`;

  // If we have a lastSynced date, only fetch newer emails for efficiency
  if (options.afterDate) {
    const afterEpoch = Math.floor(new Date(options.afterDate).getTime() / 1000);
    query += ` after:${afterEpoch}`;
  }

  try {
    // List matching message IDs
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messages = listResponse.data.messages || [];
    if (messages.length === 0) {
      return [];
    }

    // Fetch full message content for each matched email
    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full',
          });
          return detail.data;
        } catch (err) {
          console.error(`[GmailService] Failed to fetch message ${msg.id}:`, err.message);
          return null;
        }
      })
    );

    return fullMessages.filter(Boolean);
  } catch (err) {
    // Handle specific Gmail API errors
    if (err.code === 401 || err.code === 403) {
      // Token is invalid or revoked — mark account as disconnected
      await ConnectedAccount.findOneAndUpdate(
        { user: userId, provider: 'gmail' },
        { status: 'disconnected' }
      );
      throw new AppError('Gmail authorization expired. Please reconnect your Gmail.', 401);
    }
    if (err.code === 429) {
      throw new AppError('Gmail API rate limit exceeded. Please try again later.', 429);
    }
    throw new AppError(`Failed to fetch Gmail messages: ${err.message}`, 500);
  }
}

// ========== Email Content Extraction ==========

/**
 * Extracts the human-readable body from a Gmail message payload.
 * Handles multipart messages and base64 decoding.
 * @param {object} message - Gmail API message object
 * @returns {{ subject: string, from: string, body: string, date: string, messageId: string }}
 */
export function extractEmailContent(message) {
  const headers = message.payload?.headers || [];

  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('Subject');
  const from = getHeader('From');
  const date = getHeader('Date');
  const messageId = message.id;

  // Recursively extract body text from message parts
  let body = '';

  function extractBodyFromParts(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
        // Fallback to HTML if no plain text, strip tags for parsing
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        body += html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else if (part.parts) {
        extractBodyFromParts(part.parts);
      }
    }
  }

  // Single-part message
  if (message.payload?.body?.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }

  // Multipart message
  if (message.payload?.parts) {
    extractBodyFromParts(message.payload.parts);
  }

  return { subject, from, body, date, messageId };
}

// ========== Disconnect ==========

/**
 * Disconnect Gmail by removing stored tokens and marking account as disconnected.
 * @param {string} userId
 */
export async function disconnectGmail(userId) {
  const account = await ConnectedAccount.findOne({ user: userId, provider: 'gmail' });
  if (!account) {
    throw new AppError('No Gmail account connected.', 404);
  }

  // Attempt to revoke the token with Google
  try {
    const oAuth2Client = createOAuth2Client();
    if (account.metadata?.access_token) {
      await oAuth2Client.revokeToken(account.metadata.access_token);
    }
  } catch (err) {
    // Token revocation failure is non-critical — continue with local cleanup
    console.warn('[GmailService] Token revocation failed (non-critical):', err.message);
  }

  // Remove the connected account entirely
  await ConnectedAccount.findByIdAndDelete(account._id);
  return { message: 'Gmail disconnected successfully.' };
}

/**
 * Get the current Gmail connection status for a user.
 * @param {string} userId
 * @returns {object|null}
 */
export async function getStatus(userId) {
  const account = await ConnectedAccount.findOne({ user: userId, provider: 'gmail' });
  if (!account) {
    return { connected: false };
  }
  return {
    connected: account.status === 'connected',
    status: account.status,
    lastSynced: account.lastSynced,
    accountName: account.accountName,
  };
}
