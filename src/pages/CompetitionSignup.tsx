import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CompetitionSignup() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to signup with competition-specific state
    navigate('/signup', {
      state: {
        returnTo: '/payment',
        accountSize: 10000, // Standard competition account size
        challengeType: 'COMPETITION',
        originalPrice: 9.99,
        discountPrice: 9.99,
        isCompetition: true // Flag to identify competition signup
      },
      replace: true
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to registration...</p>
      </div>
    </div>
  );
}
