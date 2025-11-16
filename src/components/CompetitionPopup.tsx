import { useState, useEffect } from 'react';
import { X, Trophy, Clock, DollarSign, Crown, Zap, Target, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompetitionPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Check if popup has been shown before
    const hasShownPopup = localStorage.getItem('competitionPopupShown');
    if (!hasShownPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const targetDate = new Date('2025-12-01T00:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('competitionPopupShown', 'true');
  };

  if (!isVisible) return null;

  const prizes = [
    { place: '1ST', amount: '$100,000', color: 'from-yellow-400 to-orange-500' },
    { place: '2ND-5TH', amount: '$50,000', color: 'from-gray-300 to-gray-500' },
    { place: '6TH-10TH', amount: '$25,000', color: 'from-amber-600 to-orange-700' },
    { place: '11TH-20TH', amount: '$5,000', color: 'from-green-600 to-teal-700' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-electric-blue rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Main popup container */}
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-electric-blue/50 rounded-3xl shadow-2xl shadow-electric-blue/20 overflow-hidden">
          {/* Animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink animate-gradient rounded-3xl opacity-20" />

          {/* Header with close button */}
          <div className="relative p-6 border-b border-white/10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 group"
            >
              <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-electric-blue/10 to-cyber-purple/10 backdrop-blur-xl border border-electric-blue/30 rounded-full mb-4">
                <Sparkles className="w-5 h-5 text-electric-blue animate-pulse" />
                <span className="text-sm font-bold tracking-wider text-electric-blue">🚀 ULTIMATE TRADING COMPETITION</span>
                <Sparkles className="w-5 h-5 text-cyber-purple animate-pulse" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black mb-2">
                <span className="bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink bg-clip-text text-transparent">
                  FUND8R APEX CHALLENGE
                </span>
              </h2>
              <p className="text-gray-300 text-lg">Win up to $100,000 in funded capital!</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Countdown Timer */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-electric-blue" />
                <span className="text-xl font-bold text-white">Competition Starts In:</span>
              </div>

              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-4">
                <div className="bg-gradient-to-br from-electric-blue/20 to-electric-blue/5 border border-electric-blue/30 rounded-xl p-4">
                  <div className="text-3xl font-black text-electric-blue mb-1">
                    {countdown.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Days</div>
                </div>
                <div className="bg-gradient-to-br from-cyber-purple/20 to-cyber-purple/5 border border-cyber-purple/30 rounded-xl p-4">
                  <div className="text-3xl font-black text-cyber-purple mb-1">
                    {countdown.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Hours</div>
                </div>
                <div className="bg-gradient-to-br from-neon-pink/20 to-neon-pink/5 border border-neon-pink/30 rounded-xl p-4">
                  <div className="text-3xl font-black text-neon-pink mb-1">
                    {countdown.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Minutes</div>
                </div>
                <div className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/30 rounded-xl p-4">
                  <div className="text-3xl font-black text-neon-green mb-1">
                    {countdown.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Seconds</div>
                </div>
              </div>

              <p className="text-gray-400 text-sm">December 1, 2025 - Don't miss out!</p>
            </div>

            {/* Prize Structure */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-white">🏆 Championship Prizes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prizes.map((prize, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-xl border-2 bg-gradient-to-br from-black/60 to-black/40 ${
                      index === 0
                        ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                        : 'border-white/10'
                    }`}
                  >
                    <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${prize.color} text-white shadow-lg`}>
                      {prize.place}
                    </div>
                    <div className="text-center pt-4">
                      <div className="text-2xl font-black text-white mb-1">{prize.amount}</div>
                      <div className="text-xs text-gray-400">FUNDED CAPITAL</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-center mb-6 text-white">⚡ Why Compete?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-electric-blue/10 to-electric-blue/5 border border-electric-blue/20">
                  <Zap className="w-8 h-8 text-electric-blue mx-auto mb-2" />
                  <div className="font-bold text-white mb-1">No Profit Split</div>
                  <div className="text-sm text-gray-400">Keep 100% of your profits</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyber-purple/10 to-cyber-purple/5 border border-cyber-purple/20">
                  <Target className="w-8 h-8 text-cyber-purple mx-auto mb-2" />
                  <div className="font-bold text-white mb-1">180 Days</div>
                  <div className="text-sm text-gray-400">Complete challenge timeline</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-neon-green/10 to-neon-green/5 border border-neon-green/20">
                  <Crown className="w-8 h-8 text-neon-green mx-auto mb-2" />
                  <div className="font-bold text-white mb-1">Career Boost</div>
                  <div className="text-sm text-gray-400">Full-time trading position</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/competition-signup"
                onClick={handleClose}
                className="group relative px-8 py-4 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink rounded-xl font-black text-lg overflow-hidden transition-all duration-300 hover:scale-105 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink animate-gradient" />
                <div className="relative flex items-center justify-center space-x-3 text-white">
                  <Trophy className="w-6 h-6" />
                  <span>REGISTER NOW - $9.99</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>

              <Link
                to="/competition"
                onClick={handleClose}
                className="px-8 py-4 glass-card border-2 border-white/20 rounded-xl font-bold text-lg hover:border-white/40 transition-all duration-300 hover:scale-105 text-center text-white"
              >
                Learn More
              </Link>
            </div>

            {/* Footer note */}
            <div className="text-center mt-6 text-sm text-gray-500">
              Entry fee: $9.99 (one-time) • Limited spots available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
