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
      from: `"FinanceOS" <${process.env.SMTP_FROM || 'noreply@financeos.com'}>`,
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
  const subject = 'New Login to your FinanceOS Account';
  const html = `
    <h2>Hello ${userName},</h2>
    <p>We noticed a new login to your FinanceOS account from IP: <strong>${ipAddress}</strong>.</p>
    <p>If this was you, you can safely ignore this email.</p>
    <p>If you don't recognize this activity, please reset your password immediately.</p>
    <br>
    <p>Stay secure,</p>
    <p>The FinanceOS Team</p>
  `;
  return sendEmail(userEmail, subject, 'New login detected.', html);
};

export const sendBudgetExceededAlert = async (userEmail, userName, category) => {
  const subject = `Budget Alert: ${category} Exceeded`;
  const html = `
    <h2>Alert, ${userName}!</h2>
    <p>You have exceeded your set budget for the <strong>${category}</strong> category.</p>
    <p>Log in to FinanceOS to review your expenses.</p>
  `;
  return sendEmail(userEmail, subject, `Budget exceeded for ${category}.`, html);
};
