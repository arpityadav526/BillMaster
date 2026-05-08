import dotenv from 'dotenv';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// Import after config
const { sendEmail } = await import('../server/src/utils/mailer.js');

async function testMail() {
  console.log('Starting email test...');
  console.log('Using SMTP_USER:', process.env.SMTP_USER);
  
  try {
    const result = await sendEmail(
      process.env.SMTP_USER,
      '🚀 BillMaster SMTP Test',
      'If you see this, your BillMaster email system is working perfectly!',
      `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #10b981;">SMTP Test Successful!</h2>
        <p>Hello Arpit,</p>
        <p>This is a test email from your **BillMaster** application. Your Gmail SMTP configuration is correct.</p>
        <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0;"><strong>Status:</strong> Active</p>
          <p style="margin: 0;"><strong>Host:</strong> ${process.env.SMTP_HOST}</p>
        </div>
        <p>You can now receive budget alerts and smart financial insights directly in your inbox.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8;">Sent via BillMaster Core Notification Engine</p>
      </div>
      `
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Email failed to send (result was null). Check your SMTP_PASS/app password.');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testMail();
