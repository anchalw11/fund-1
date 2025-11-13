import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent directory of backend)
dotenv.config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER || 'fund8r.forex@gmail.com',
      pass: process.env.SMTP_PASSWORD || '',
    },
  },
  from: {
    name: process.env.COMPANY_NAME || 'Fund8r Forex',
    email: process.env.SMTP_USER || 'fund8r.forex@gmail.com',
  },
  colors: {
    purple: '#7C3AED',
    darkBlue: '#1E3A8A',
    blue: '#3B82F6',
    white: '#FFFFFF',
    gold: '#FFD700',
  },
};

if (isProduction) {
  // In production, require SMTP credentials to be set
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️  Production environment detected, but SMTP credentials are not fully set.');
    console.warn('   Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
  }
} else {
  // In development, you can use a service like Ethereal or a local SMTP server
  // For this example, we'll stick with the environment variables or the defaults
  if (!process.env.SMTP_PASSWORD) {
    console.warn('⚠️  Development: SMTP_PASSWORD is not set. Email sending might fail.');
  }
}

export default emailConfig;
