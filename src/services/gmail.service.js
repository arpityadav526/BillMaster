/**
 * Gmail Service — Frontend API calls for Gmail OAuth integration.
 */
import api from './api';

/** Get the OAuth authorization URL to redirect the user */
export const getAuthUrl = () => api.get('/gmail/auth');

/** Check the current Gmail connection status */
export const getStatus = () => api.get('/gmail/status');

/** Manually trigger an email sync */
export const triggerSync = () => api.post('/gmail/sync');

/** Disconnect Gmail and revoke tokens */
export const disconnect = () => api.post('/gmail/disconnect');
