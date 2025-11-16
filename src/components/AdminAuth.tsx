import { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/db';

interface AdminAuthProps {
  children: React.ReactNode;
}

const ADMIN_PIN = '1806';
const ADMIN_SESSION_KEY = 'admin_authenticated';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (authData) {
      try {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();

        if (now - timestamp < SESSION_DURATION) {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    if (pin === ADMIN_PIN) {
      try {
        // Sign in admin to Supabase (create a service account or use anon key)
        // For now, just check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Try to use anon session - RLS policies allow authenticated access
          console.log('Admin accessing with current session');
        }

        const authData = {
          timestamp: Date.now(),
          role: 'admin'
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
        setError('');
      } catch (error) {
        console.error('Error during admin auth:', error);
        setError('Authentication error. Please try again.');
      }
    } else {
      setError('Invalid PIN. Access denied.');
      setPin('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setPin('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"></div>
        </div>

        <div className="glass-card p-8 max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-purple rounded-full mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-white/60">Enter PIN to access admin panel</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                <Lock size={16} className="inline mr-2" />
                Admin PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none text-center text-2xl tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-gradient py-3 font-semibold"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            <p>This is a secure area. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Logout button in top-right corner */}
      <button
        onClick={handleLogout}
        className="fixed top-24 right-8 z-50 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm font-semibold transition-all"
      >
        Logout Admin
      </button>
      {children}
    </div>
  );
}
