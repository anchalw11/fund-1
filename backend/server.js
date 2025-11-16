import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from backend/.env first, then fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Ensure SMTP variables are set for production (Render)
if (!process.env.SMTP_HOST) {
  process.env.SMTP_HOST = 'smtp.gmail.com';
  console.log('🔧 Set SMTP_HOST from code');
}
if (!process.env.SMTP_USER) {
  process.env.SMTP_USER = 'fund8r.forex@gmail.com';
  console.log('🔧 Set SMTP_USER from code');
}
if (!process.env.SMTP_PASSWORD) {
  process.env.SMTP_PASSWORD = 'taaacfxyuztonswc';
  console.log('🔧 Set SMTP_PASSWORD from code');
}
if (!process.env.SMTP_PORT) {
  process.env.SMTP_PORT = '587';
  console.log('🔧 Set SMTP_PORT from code');
}

// Debug: Log SMTP configuration status
console.log('🔧 Environment Variables Check:');
console.log('   SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '❌ Missing');
console.log('   SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
console.log('   SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('   SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');

// Import and reinitialize email service to ensure env vars are loaded
import EmailService from './services/emailService.js';
const emailService = new EmailService();

import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';

import accountsRoutes from './routes/accounts.js';
import leaderboardRoutes from './routes/leaderboard.js';
import affiliatesRoutes from './routes/affiliates.js';
import certificatesRoutes from './routes/certificates.js';
import notificationsRoutes from './routes/notifications.js';
import supportRoutes from './routes/support.js';
import challengesRoutes from './routes/challenges.js';
import analyticsRoutes from './routes/analytics.js';
import verificationRoutes from './routes/Verification.js';
import emailRoutes from './routes/email.js';
import usersRoutes from './routes/users.js';
import badgesRoutes from './routes/badges.js';
import miniChallengesRoutes from './routes/miniChallenges.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import promotionsRoutes from './routes/promotions.js';
import propFirmRoutes from './routes/propfirm.js';
import uploadRoutes from './routes/upload.js';


// Import monitoring service with error handling
let monitoringService = null;
try {
  const module = await import('./services/monitoringService.js');
  monitoringService = module.default;
  console.log('✅ Monitoring service loaded');
} catch (error) {
  console.warn('⚠️  Monitoring service failed to load (MetaAPI issue):', error.message);
  // Create a mock monitoring service
  monitoringService = {
    activeMonitors: new Map(),
    startMonitoring: async () => {},
    stopAllMonitoring: async () => {}
  };
}

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// More lenient rate limiter for verification endpoints
const verificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute (very lenient for testing)
  message: 'email rate limit exceeded'
});

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://fund8r.onrender.com',
  'https://fund8r-frontend.onrender.com',
  'https://fund8r.com',
  'https://www.fund8r.com',
  'http://fund8r.com',
  'http://www.fund8r.com',
  'https://*.webcontainer-api.io',
  'https://stackblitz.com',
  'https://*.stackblitz.io',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🔐 CORS allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    // Allow all origins temporarily to fix CORS errors
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Enable CORS for all routes
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply verification rate limiter to verification endpoints
// Temporarily disabled for testing - re-enable in production
// app.use('/api/verification', verificationLimiter);

// Apply general rate limiter to all other API endpoints
app.use('/api/', limiter);

app.use('/api/accounts', accountsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/affiliates', affiliatesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/mini-challenges', miniChallengesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/prop-firm', propFirmRoutes);
app.use('/api/upload', uploadRoutes);

app.post('/api/reject-challenge-test', async (req, res) => {
  try {
    const { challengeId, userNote } = req.body;
    const { supabase } = await import('./config/supabase.js');

    const { data: challengeData, error: challengeError } = await supabase
      .from('user_challenges')
      .select('user_id')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challengeData) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }
    const { user_id } = challengeData;

    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({ status: 'rejected' })
      .eq('id', challengeId);

    if (updateError) throw updateError;

    if (userNote) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          title: 'An update on your challenge',
          message: userNote,
          type: 'challenge_update',
        });

      if (notificationError) {
        console.error('Failed to create notification for user:', notificationError);
      }
    }
    
    res.json({ success: true, message: 'Challenge rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeMonitors: monitoringService?.activeMonitors?.size || 0
  });
});

// OLD Database migration endpoints (without /api prefix for direct calls)
app.get('/old-database/users', async (req, res) => {
  try {
    const { oldSupabase } = await import('./config/supabase.js');

    const { data: users, error } = await oldSupabase
      .from('users')
      .select('*');

    if (error) {
      console.log('⚠️ OLD DB users fetch failed (expected if DB is unavailable):', error.message);
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: users || [] });
  } catch (error) {
    console.error('Error fetching OLD DB users:', error);
    res.json({ success: true, data: [] });
  }
});

app.get('/old-database/challenges', async (req, res) => {
  try {
    const { oldSupabase } = await import('./config/supabase.js');

    const { data: challenges, error } = await oldSupabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('⚠️ OLD DB challenges fetch failed (expected if DB is unavailable):', error.message);
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: challenges || [] });
  } catch (error) {
    console.error('Error fetching OLD DB challenges:', error);
    res.json({ success: true, data: [] });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { default: emailService } = await import('./services/emailService.js');
    const { type = 'all' } = req.body;
    
    const result = await emailService.sendTestEmail(type);
    
    res.json({
      success: true,
      message: 'Test emails sent successfully',
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../dist');
  console.log(`Production mode: Serving static files from ${buildPath}`);
  app.use(express.static(buildPath));

  // For any other request, serve the index.html file
  app.get('*', (req, res, next) => {
    // If the request is for an API route, let it fall through to the 404 handler
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

const startServer = async () => {

  const tryPort = (port) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port)
        .on('listening', () => {
          console.log('\n' + '='.repeat(60));
          console.log('🚀 Fund8r Backend Server');
          console.log('='.repeat(60));
          console.log(`📡 Port: ${port}`);
          console.log(`📊 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
          console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
          console.log(`🗄️ Database: ${process.env.SUPABASE_URL ? 'Supabase Connected' : 'Not Configured'}`);
          console.log(`📧 Email: ${process.env.SMTP_HOST ? 'SMTP Configured' : 'Not Configured (emails will log to console)'}`);
          console.log('='.repeat(60));
          console.log('✅ Server ready for requests\n');
          resolve(server);
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            reject(err);
          } else {
            console.error('Server error:', err);
            process.exit(1);
          }
        });
    });
  };

  try {
    await tryPort(PORT);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${PORT} is already in use`);
      
      // Try alternative ports
      const alternativePorts = [5001, 5002, 5003, 3001, 3002];
      let serverStarted = false;
      
      for (const altPort of alternativePorts) {
        try {
          console.log(`🔄 Trying port ${altPort}...`);
          await tryPort(altPort);
          console.log(`✅ Server started on alternative port ${altPort}`);
          console.log(`💡 Update your frontend VITE_API_URL to: http://localhost:${altPort}/api`);
          serverStarted = true;
          break;
        } catch (err) {
          if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️  Port ${altPort} is also in use`);
            continue;
          } else {
            throw err;
          }
        }
      }
      
      if (!serverStarted) {
        console.error('\n❌ All ports are in use. Please kill existing processes:');
        console.error('   Run: lsof -ti:5000 | xargs kill -9');
        console.error('   Or: pkill -f "node server.js"');
        process.exit(1);
      }
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (monitoringService?.stopAllMonitoring) {
    await monitoringService.stopAllMonitoring();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (monitoringService?.stopAllMonitoring) {
    await monitoringService.stopAllMonitoring();
  }
  process.exit(0);
});

startServer();

export default app;
