import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// Get current user from request
export async function getCurrentUser(req) {
  try {
    // Try to get user from Authorization header (JWT token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        if (decoded.sub) {
          // Get user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.sub)
            .single();

          if (!error && user) {
            return user;
          }
        }
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message);
      }
    }

    // Try to get user from session (if using Supabase auth)
    const sessionToken = req.headers['x-session-token'] || req.cookies?.session;
    if (sessionToken) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
        if (!error && user) {
          return user;
        }
      } catch (sessionError) {
        console.log('Session verification failed:', sessionError.message);
      }
    }

    // If no auth found, return null
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Middleware to require authentication
export function requireAuth(req, res, next) {
  getCurrentUser(req).then(user => {
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    req.user = user;
    next();
  }).catch(error => {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Authentication error' });
  });
}
