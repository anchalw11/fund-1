import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Infinity } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Subscriptions() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  const handleSubscribe = async (plan: any, isVip: boolean = false) => {
    const user = await getCurrentUser();

    if (!user) {
      navigate('/signup', {
        state: {
          subscription: true,
          plan: plan,
          billingCycle: billingCycle,
          isVip: isVip
        }
      });
      return;
    }

    navigate('/payment', {
      state: {
        subscription: true,
        accountSize: isVip ? 0 : parseInt(plan.size.replace(/[^0-9]/g, '')),
        subscriptionPrice: isVip ? plan.price : (billingCycle === 'monthly' ? plan.monthly : plan.quarterly),
        billingCycle: billingCycle,
        isVip: isVip,
        vipPlan: isVip ? plan.name : null,
        challengeType: 'CLASSIC_2STEP'
      }
    });
  };

  const classicPlans = [
    { size: '$5K', monthly: 69, quarterly: 172.5 },
    { size: '$10K', monthly: 134, quarterly: 335 },
    { size: '$25K', monthly: 339, quarterly: 847.5 },
    { size: '$50K', monthly: 684, quarterly: 1710 },
    { size: '$100K', monthly: 1349, quarterly: 3372.5 },
    { size: '$200K', monthly: 2699, quarterly: 6747.5 }
  ];

  const vipPlans = [
    { name: 'Basic', price: 997, duration: '2 months', features: ['Unlimited retries', 'Priority support', 'Extended deadlines'] },
    { name: 'Premium', price: 1497, duration: '2 months', features: ['Unlimited retries', 'VIP support', 'Extended deadlines', 'Free retry per quarter'] },
    { name: 'Elite', price: 2997, duration: '2 months', features: ['Unlimited retries', 'Dedicated account manager', 'Extended deadlines', 'Free retry per quarter', 'More forgiving rules'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Infinity className="inline-block w-12 h-12 mr-3 text-blue-400" />
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Unlimited retries, pay monthly or quarterly
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white/10 backdrop-blur-lg rounded-full p-2 border border-white/20">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-8 py-3 rounded-full font-semibold transition relative ${
                billingCycle === 'quarterly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Quarterly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Save 25%</span>
            </button>
          </div>
        </div>

        {/* Classic Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Classic Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classicPlans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthly : plan.quarterly;
              return (
                <div
                  key={plan.size}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-blue-500/50 transition"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{plan.size}</h3>
                    <div className="text-gray-400 mb-2">Account Size</div>
                    <div className="text-5xl font-bold text-white mb-2">
                      ${price.toFixed(0)}
                    </div>
                    <div className="text-gray-400">
                      per {billingCycle === 'monthly' ? 'month' : 'quarter'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Unlimited Retries</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Classic Challenge Rules</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Standard Support</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan, false)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:scale-105 transition"
                  >
                    Subscribe Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* VIP Plans */}
        <div>
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold mb-4">
              PREMIUM
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">VIP Plans</h2>
            <p className="text-gray-400">2-month subscriptions with exclusive benefits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vipPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 transition ${
                  index === 1
                    ? 'border-yellow-500 scale-105'
                    : 'border-white/20 hover:border-yellow-500/50'
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-5xl font-bold text-white mb-2">${plan.price}</div>
                  <div className="text-gray-400">{plan.duration}</div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan, true)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition"
                >
                  Get VIP Access
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">What's Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Infinity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">Unlimited Retries</h4>
              <p className="text-gray-400 text-sm">Try as many times as you need to pass</p>
            </div>
            <div>
              <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">Flexible Billing</h4>
              <p className="text-gray-400 text-sm">Cancel anytime, no long-term commitment</p>
            </div>
            <div>
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">VIP Benefits</h4>
              <p className="text-gray-400 text-sm">Exclusive perks for VIP members</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
