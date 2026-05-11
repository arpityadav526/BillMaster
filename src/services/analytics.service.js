import api from './api';

export const getOverview = async () => {
  return await api.get('/analytics/overview');
};

export const getInsights = async () => {
  return await api.get('/analytics/insights');
};

/**
 * Fetch savings prediction from ML service (proxied via Node backend).
 * Returns: { projected_spend, variance, status, advice, daily_run_rate,
 *            current_month_spend, days_remaining, savings_rate_pct,
 *            monthlySalary, targetSavingsAmount }
 */
export const getSavingsPrediction = async () => {
  return await api.get('/analytics/savings-prediction');
};

/**
 * Send a natural language question to the AI financial advisor.
 * @param {string} question - The user's question
 * @returns {{ answer: string }}
 */
export const chatWithAI = async (question) => {
  return await api.post('/analytics/chat', { question });
};
