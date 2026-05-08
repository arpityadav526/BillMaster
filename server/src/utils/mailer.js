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
