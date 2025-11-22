import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signOut, getCurrentUser } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [isMiniChallengeFlow, setIsMiniChallengeFlow] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkExistingUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setExistingUser(user);
        // Check if this is coming from mini challenge flow
        const referrer = document.referrer;
        const currentUrl = window.location.href;
        if (referrer.includes('/mini-challenge/start') || currentUrl.includes('mini-challenge') || location.state?.fromMiniChallenge) {
          setIsMiniChallengeFlow(true);
        }
      }
    };

    checkExistingUser();
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      if (isMiniChallengeFlow || location.state?.fromMiniChallenge) {
        // Redirect to payment for mini-challenge
        navigate('/payment', {
          state: {
            challengeType: 'MINI_PAID',
            accountSize: 3000,
            discountPrice: 0.99,
            regularPrice: 0.99,
            originalPrice: 0.99,
            fromMiniChallenge: true
          }
        });
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const continueWithExistingAccount = () => {
    navigate('/payment', {
      state: {
        challengeType: 'MINI_PAID',
        accountSize: 3000,
        discountPrice: 0.99,
        regularPrice: 0.99,
        originalPrice: 0.99,
        fromMiniChallenge: true
      }
    });
  };

  const continueToSignup = () => {
    // Sign out current user if they want to create a new account
    signOut();
    setExistingUser(null);
    navigate('/signup');
  };

  // Show different UI if user is already logged in and this is mini-challenge flow
  if (existingUser && isMiniChallengeFlow) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-cyber-purple rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              F8
            </div>
            <h1 className="text-3xl font-bold mb-2">Ultra Mini Challenge</h1>
            <p className="text-gray-400">You're already logged in with {existingUser.email}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={continueWithExistingAccount}
              className="w-full py-3 bg-gradient-to-r from-electric-blue to-cyber-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-electric-blue/50 transition-all"
            >
              Continue with this account ($0.99 Mini Challenge)
            </button>

            <button
              onClick={continueToSignup}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all"
            >
              Create new account instead
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h3 className="text-yellow-400 font-semibold mb-2">Mini Challenge Details:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• $3,000 Virtual Account</li>
              <li>• $200 Profit Target (6.67%)</li>
              <li>• 14 Days Duration</li>
              <li>• Only $0.99 One-time Payment</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-cyber-purple rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            F8
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Login to your Fund8r account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-electric-blue to-cyber-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-electric-blue/50 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-electric-blue hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
