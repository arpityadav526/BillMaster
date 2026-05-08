import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as connectedAccountService from '../services/connectedAccountService.js';

export const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await connectedAccountService.getConnectedAccounts(req.user._id);
  sendSuccess(res, accounts);
});

export const connectAccount = asyncHandler(async (req, res) => {
  const account = await connectedAccountService.connectAccount(req.user._id, req.body);
  sendSuccess(res, account, 201, 'Account connected successfully');
});

export const disconnectAccount = asyncHandler(async (req, res) => {
  const account = await connectedAccountService.disconnectAccount(req.user._id, req.params.id);
  sendSuccess(res, account, 200, 'Account disconnected successfully');
});

export const importTransactions = asyncHandler(async (req, res) => {
  const result = await connectedAccountService.importTransactions(req.user._id, req.params.id, req.body.transactions);
  sendSuccess(res, result, 200, `Successfully imported ${result.importedCount} transactions`);
});
