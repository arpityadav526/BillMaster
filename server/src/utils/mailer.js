import nodemailer from 'nodemailer';
import config from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  if (config.env === 'test') return; // Don't send emails in test environment
  
  try {
    const info = await transporter.sendMail({
      from: `"BillMaster" <${process.env.SMTP_FROM || 'noreply@billmaster.com'}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendNewLoginAlert = async (userEmail, userName, ipAddress) => {
  const subject = 'New Login to your BillMaster Account';
  const html = `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #10b981;">Hello ${userName},</h2>
      <p>We noticed a new login to your BillMaster account from IP: <strong>${ipAddress}</strong>.</p>
      <p>If this was you, you can safely ignore this email.</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">If you don't recognize this activity, please reset your password immediately to secure your account.</p>
      </div>
      <p>Stay secure,<br>The BillMaster Team</p>
    </div>
  `;
  return sendEmail(userEmail, subject, 'New login detected.', html);
};

export const sendBudgetExceededAlert = async (userEmail, userName, category, spent, limit) => {
  const subject = `🚨 Budget Alert: ${category} limit exceeded`;
  const html = `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #f43f5e;">Budget Alert, ${userName}!</h2>
      <p>You have exceeded your set budget for the <strong>${category}</strong> category.</p>
      <div style="background: #fff1f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f43f5e;">
        <p style="margin: 0; font-size: 16px;">Spent: <strong>${spent}</strong> / Limit: <strong>${limit}</strong></p>
      </div>
      <p>Log in to BillMaster to review your expenses and adjust your budget if needed.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Dashboard</a>
    </div>
  `;
  return sendEmail(userEmail, subject, `Budget exceeded for ${category}.`, html);
};

export const sendMonthlyReport = async (userEmail, userName, reportData) => {
  const subject = `📈 Your Monthly Financial Report - ${reportData.month}`;
  const html = `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981;">Monthly Summary: ${reportData.month}</h2>
      <p>Hello ${userName}, here is your financial snapshot for the past month:</p>
      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 10px; margin: 20px 0;">
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">Total Income</p>
          <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #10b981;">${reportData.totalIncome}</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">Total Expenses</p>
          <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #f43f5e;">${reportData.totalExpenses}</p>
        </div>
      </div>
      <p><strong>Top Category:</strong> ${reportData.topCategory}</p>
      <p><strong>Savings Rate:</strong> ${reportData.savingsRate}%</p>
      <p>Keep up the great work with your financial goals!</p>
    </div>
  `;
  return sendEmail(userEmail, subject, 'Your monthly report is ready.', html);
};

export const sendSalaryConfirmation = async (userEmail, userName, amount, source) => {
  const subject = `💰 Salary Received: ${amount}`;
  const html = `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981;">Income Added!</h2>
      <p>Hello ${userName}, your salary of <strong>${amount}</strong> from <strong>${source}</strong> has been successfully added to your BillMaster records.</p>
      <p>Your dashboard stats have been updated.</p>
    </div>
  `;
  return sendEmail(userEmail, subject, 'Income confirmation.', html);
};

export const sendImportConfirmation = async (userEmail, userName, count, provider) => {
  const subject = `📥 Import Successful: ${count} transactions`;
  const html = `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981;">Sync Complete</h2>
      <p>Hello ${userName}, we successfully imported <strong>${count}</strong> transactions from <strong>${provider}</strong>.</p>
      <p>You can now categorize them in your Expenses page.</p>
    </div>
  `;
  return sendEmail(userEmail, subject, 'Import successful.', html);
};
export const sendWeeklyInsightReport = async (userEmail, userName, data) => {
  const subject = '📊 Your Weekly BillMaster Insight Report';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; }
        .card { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { color: #10b981; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .stat-box { background: #f1f5f9; padding: 20px; border-radius: 16px; text-align: center; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .stat-value { font-size: 20px; font-weight: bold; color: #0f172a; }
        .advice-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; border-radius: 20px; margin-bottom: 32px; }
        .advice-title { font-weight: bold; margin-bottom: 8px; font-size: 16px; display: flex; items-center: center; gap: 8px; }
        .advice-text { font-size: 14px; line-height: 1.6; opacity: 0.9; }
        .category-list { margin-bottom: 32px; }
        .category-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; }
        .btn { display: inline-block; background: #0f172a; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">BillMaster</div>
          <p style="color: #64748b; margin: 0;">Weekly Financial Insights for ${userName}</p>
        </div>
        
        <div class="card">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Spent (7d)</div>
              <div class="stat-value">$${data.totalSpent.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Projected EOM</div>
              <div class="stat-value">$${data.projectedSpend.toLocaleString()}</div>
            </div>
          </div>

          <div class="advice-card">
            <div class="advice-title">💡 ML Insight: ${data.status === 'on_track' ? 'On Track' : 'Action Required'}</div>
            <div class="advice-text">${data.advice}</div>
          </div>

          <div class="category-list">
            <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 16px;">Top Spending Categories</h3>
            ${data.categories.map(cat => `
              <div class="category-item">
                <span style="color: #64748b;">${cat.name}</span>
                <span style="font-weight: 600;">$${cat.value.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">View Full Dashboard</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You received this email because you have weekly notifications enabled.</p>
          <p>&copy; 2026 BillMaster Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(userEmail, subject, `Your weekly insights are ready! ${data.advice}`, html);
};
