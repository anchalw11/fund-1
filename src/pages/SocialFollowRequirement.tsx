import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Youtube, MessageCircle, Check, ExternalLink, Zap, Star, Sparkles, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SocialFollowRequirement() {
  const navigate = useNavigate();
  const [followedPlatforms, setFollowedPlatforms] = useState({
    instagram: false,
    twitter: false,
    youtube: false
  });

  const [clickedButtons, setClickedButtons] = useState({
    instagram: false,
    twitter: false,
    youtube: false
  });

  const [allFollowed, setAllFollowed] = useState(false);

  useEffect(() => {
    setAllFollowed(Object.values(followedPlatforms).every(followed => followed));
  }, [followedPlatforms]);

  type PlatformId = 'instagram' | 'twitter' | 'youtube';

  const socialPlatforms = [
    {
      id: 'instagram' as PlatformId,
      name: 'Instagram',
      handle: '@fund8r.funding',
      icon: Instagram,
      url: 'https://www.instagram.com/fund8r.funding',
      color: 'from-pink-500 to-purple-500',
      description: 'Daily trading tips & strategies'
    },
    {
      id: 'twitter' as PlatformId,
      name: 'Twitter/X',
      handle: '@Fund8r',
      icon: Twitter,
      url: 'https://x.com/Fund8r',
      color: 'from-blue-400 to-blue-600',
      description: 'Real-time market analysis'
    },
    {
      id: 'youtube' as PlatformId,
      name: 'YouTube',
      handle: '@Fund8r',
      icon: Youtube,
      url: 'https://youtube.com/channel/UC07myZojuW3PecCorchzLeA',
      color: 'from-red-500 to-red-600',
      description: 'In-depth strategy videos'
    }
  ];

  const handleFollow = (platformId: PlatformId) => {
    // Mark button as clicked (enables checkbox)
    setClickedButtons(prev => ({
      ...prev,
      [platformId]: true
    }));

    // Open in new tab/window
    const platform = socialPlatforms.find(p => p.id === platformId);
    if (platform) {
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCheckboxChange = (platformId: PlatformId, checked: boolean) => {
    setFollowedPlatforms(prev => ({
      ...prev,
      [platformId]: checked
    }));
  };

  const handleContinue = () => {
    if (allFollowed) {
      // Store verification in localStorage
      localStorage.setItem('socialFollowVerified', Date.now().toString());
      localStorage.setItem('socialFollowPlatforms', JSON.stringify(followedPlatforms));

      // Navigate to mini-challenge scanner
      navigate('/mini-challenge/start');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Users className="w-16 h-16 text-cyan-400 animate-pulse mr-4" />
            <Star className="w-12 h-12 text-yellow-400 animate-spin mr-2" />
            <Sparkles className="w-10 h-10 text-purple-400 animate-bounce" />
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Join Our Community First!
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Follow us on all platforms below to unlock your <strong>$0.99</strong> mini-challenge experience and become part of our exclusive trading community
          </p>

          {/* Warning Notice */}
          <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 backdrop-blur-xl rounded-xl p-6 border-2 border-red-500/50 max-w-4xl mx-auto mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">⚠️</span>
              </div>
              <div>
                <h3 className="text-red-400 font-bold text-lg mb-2 uppercase tracking-wide">
                  Verification Policy
                </h3>
                <p className="text-red-200 text-sm mb-3">
                  <strong>Important:</strong> Our team will manually verify all social media follows within 24-48 hours.
                  If we find that you have not actually followed our accounts, you will be permanently banned from all challenges and future access.
                </p>
                <div className="bg-red-950/50 rounded-lg p-3 border border-red-600/30">
                  <p className="text-red-300 text-xs">
                    <strong>Consequence:</strong> Permanent ban from challenge system, loss of any paid content access,
                    and inability to participate in future trading competitions. This policy is enforced strictly to maintain platform quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-6 mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black px-8 py-3 rounded-full font-bold text-xl flex items-center">
              <Zap className="w-6 h-6 mr-2" />
              almost FREE ACCESS AFTER FOLLOWING
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className={`text-lg ${allFollowed ? 'text-green-400' : 'text-gray-400'}`}>
              {Object.values(followedPlatforms).filter(Boolean).length}/3 Completed
            </span>
          </div>
          <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(Object.values(followedPlatforms).filter(Boolean).length / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Social Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {socialPlatforms.map(platform => (
            <div
              key={platform.id}
              className={`relative group bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                followedPlatforms[platform.id]
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-gray-600 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${platform.color}`}>
                    <platform.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                    <p className="text-gray-400 text-sm">{platform.handle}</p>
                  </div>
                </div>

                {/* Checkbox */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followedPlatforms[platform.id]}
                    onChange={(e) => handleCheckboxChange(platform.id, e.target.checked)}
                    disabled={!clickedButtons[platform.id]}
                    className={`w-5 h-5 rounded focus:ring-green-500 focus:ring-2 ${
                      clickedButtons[platform.id]
                        ? 'text-green-600 bg-gray-100'
                        : 'text-gray-500 bg-gray-600 cursor-not-allowed'
                    }`}
                  />
                  <span className={`text-sm ${
                    clickedButtons[platform.id] ? 'text-white' : 'text-gray-500'
                  }`}>
                    {clickedButtons[platform.id]
                      ? (followedPlatforms[platform.id] ? '✅ Done' : 'Click when followed')
                      : 'Click Follow First →'
                    }
                  </span>
                </label>
              </div>

              <p className="text-gray-300 mb-4">{platform.description}</p>

              <button
                onClick={() => handleFollow(platform.id)}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                  followedPlatforms[platform.id]
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400 hover:bg-green-500/30'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {followedPlatforms[platform.id]
                    ? 'View Profile'
                    : `Follow ${platform.name}`}
                </span>
              </button>

              {followedPlatforms[platform.id] && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Community Benefits */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-500/30 mb-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            🎯 Why Join Our Community?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Daily Trading Signals</h3>
              <p className="text-gray-300 text-sm">Pro-grade market analysis and entry/exit signals</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Exclusive Strategies</h3>
              <p className="text-gray-300 text-sm">Advanced trading strategies not available elsewhere</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Private Community</h3>
              <p className="text-gray-300 text-sm">Connect with 1000+ successful traders</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Free Bonuses</h3>
              <p className="text-gray-300 text-sm">Free challenges, ebooks, and exclusive giveaways</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!allFollowed}
            className={`px-12 py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center mx-auto space-x-3 ${
              allFollowed
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:scale-105 shadow-2xl shadow-green-500/25'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!allFollowed ? (
              <>
                <span>Complete All Follows First</span>
                <span className="text-sm">({Object.values(followedPlatforms).filter(Boolean).length}/3)</span>
              </>
            ) : (
              <>
                <Check className="w-6 h-6" />
                <span>Continue to Mini-Challenge</span>
              </>
            )}
          </button>

          {!allFollowed && (
            <p className="text-gray-400 mt-4">
              💡 Links open in new tabs - follow all platforms to unlock access
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
