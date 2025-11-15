import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Percent, Gift, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/db';

export default function SecondChance() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchOffers(user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchOffers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('second_chance_offers')
        .select('*')
        .eq('user_id', userId)
        .eq('used', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOffers(data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const offerTypeInfo = {
    near_miss_retry: {
      icon: RefreshCw,
      color: 'from-blue-500 to-cyan-500',
      title: 'Near-Miss Retry',
      desc: 'You were so close! Get a discounted retry.'
    },
    progress_preservation: {
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      title: 'Progress Preservation',
      desc: 'Pause your challenge and save your progress.'
    },
    time_extension: {
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      title: 'Time Extension',
      desc: 'Get extra time to complete your challenge.'
    },
    free_retry: {
      icon: Gift,
      color: 'from-yellow-500 to-orange-500',
      title: 'Free Retry',
      desc: 'Complimentary retry on us!'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <RefreshCw className="inline-block w-12 h-12 mr-3 text-green-400" />
            Second Chance Offers
          </h1>
          <p className="text-xl text-gray-300">
            Everyone deserves another opportunity to succeed
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-blue-500"></div>
          </div>
        ) : !user ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6">Please login to view your second chance offers</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition"
            >
              Login Now
            </button>
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => {
              const info = offerTypeInfo[offer.offer_type as keyof typeof offerTypeInfo];
              const Icon = info.icon;
              const expiryDate = new Date(offer.expiry_date);
              const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={offer.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden hover:scale-105 transition"
                >
                  <div className={`bg-gradient-to-r ${info.color} p-6`}>
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/20 rounded-full">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white">{info.title}</h3>
                        <p className="text-white/80">{info.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gray-400 text-sm">Discount</p>
                        <p className="text-3xl font-bold text-green-400">{offer.discount_percentage}% OFF</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Expires In</p>
                        <p className="text-2xl font-bold text-white">{daysLeft} Days</p>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:scale-105 transition">
                      Claim Offer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {/* No Active Offers */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <Gift className="w-20 h-20 text-gray-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">No Active Offers</h2>
              <p className="text-xl text-gray-400 mb-8">
                Second chance offers appear when you're close to passing or after a challenge ends.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">How Second Chance Works</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <RefreshCw className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Near-Miss Retry</h4>
                      <p className="text-gray-400 text-sm mb-2">Missed profit target by less than 1%?</p>
                      <p className="text-green-400 font-semibold">→ 50% off retry</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Progress Preservation</h4>
                      <p className="text-gray-400 text-sm mb-2">Need more time?</p>
                      <p className="text-green-400 font-semibold">→ Pause for 48hrs (small fee)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <Clock className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Time Extension</h4>
                      <p className="text-gray-400 text-sm mb-2">Failed on the last day?</p>
                      <p className="text-green-400 font-semibold">→ One-day extension offer</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <Gift className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Free Retry</h4>
                      <p className="text-gray-400 text-sm mb-2">First-time challenger?</p>
                      <p className="text-green-400 font-semibold">→ Free educational review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VIP Benefits */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">VIP Member Benefits</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>One free retry per quarter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Extended deadline options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>More forgiving rules (slightly higher loss limits)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/subscriptions')}
                    className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition"
                  >
                    Upgrade to VIP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
