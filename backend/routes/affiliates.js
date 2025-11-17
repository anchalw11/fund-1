import express from 'express';
// import affiliateService from '../services/affiliateService.js';
// import { supabase } from '../config/supabase.js';

const router = express.Router();

// Test route to verify routes are loading
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Affiliate routes are working!' });
});

// Temporary disabled all complex routes that depend on services
// Keeping only the test route to verify affiliate routes are loading

export default router;
