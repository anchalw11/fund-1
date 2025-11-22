import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import { 
  Trophy, Target, Zap, TrendingUp, DollarSign, Clock, 
  ArrowRight, Check, AlertTriangle, Award, Users,
  Calendar, Gauge, Shield, Star, Crown
} from 'lucide-react';

export default function CompetitionDetail() {
  const [activePhase, setActivePhase] = useState(1);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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
  }, []);

  const phases = [
    {
      id: 1,
      name: 'Phase 1: The Gauntlet',
      duration: '30 Days',
      balance: '$100,000',
      profitTarget: '10%',
      maxDrawdown: '6%',
      dailyLoss: '4%',
      advancement: 'Top 15%',
      color: 'from-red-500 to-pink-600',
      icon: Target,
      description: '30 Calendar Days to Prove Your Edge',
      rules: [
        'Profit Target: 10% ($10,000)',
        'Maximum Drawdown: 6% ($6,000)',
        'Daily Loss Limit: 4% ($4,000)',
        'Minimum Trading Days: 18 of 30',
        'Time-weighted position limits',
        'Consistency multiplier rule',
        'News trading blackout periods',
        'Weekly checkpoint gates',
      ],
    },
    {
      id: 2,
      name: 'Phase 2: The Proving Grounds',
      duration: '60 Days',
      balance: '$50,000',
      profitTarget: '12%',
      maxDrawdown: '5%',
      dailyLoss: '2.5%',
      advancement: 'Top 5%',
      color: 'from-purple-500 to-blue-600',
      icon: Zap,
      description: '60 Days to Demonstrate Consistency',
      rules: [
        'Profit Target: 12% ($6,000)',
        'Maximum Drawdown: 5% ($2,500)',
        'Daily Loss Limit: 2.5% ($1,250)',
        'Minimum Trading Days: 45 of 60',
        'Symmetry requirement (40:60 to 60:40)',
        'Weekly withdrawal simulations',
        'Bi-weekly psychology assessments',
        'Zero violation tolerance',
      ],
    },
    {
      id: 3,
      name: 'Phase 3: The Crucible',
      duration: '90 Days',
      balance: '$25,000 LIVE',
      profitTarget: '15%',
      maxDrawdown: '5%',
      dailyLoss: '2%',
      advancement: 'Win',
      color: 'from-green-500 to-emerald-600',
      icon: TrendingUp,
      description: '90 Days with Real Capital',
      rules: [
        'Profit Target: 15% ($3,750)',
        'Maximum Drawdown: 5% ($1,250)',
        'Daily Loss Limit: 2% ($500)',
        'Monthly profitability required',
        'Live supervision & audits',
        'Sharpe ratio weighted 40%',
        'Public leaderboard pressure',
        'Zero violations allowed',
      ],
    },
  ];

  const prizes = [
    {
      place: '1st Place',
      account: '$100,000',
      split: 'No Profit Split',
      salary: '$60,000/year',
      bonus: 'Performance bonuses',
      icon: Crown,
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      place: '2nd-5th Place',
      account: '$50,000',
      split: 'No Profit Split',
      salary: 'Contractor',
      bonus: '6-month evaluation',
      icon: Award,
      gradient: 'from-blue-400 to-purple-500',
    },
    {
      place: '6th-10th Place',
      account: '$25,000',
      split: 'No Profit Split',
      salary: 'Quarterly evals',
      bonus: 'Account scaling',
      icon: Star,
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      place: '11th-20th Place',
      account: '$5,000',
      split: 'No Profit Split',
      salary: 'Mini account',
      bonus: 'Entry level',
      icon: DollarSign,
      gradient: 'from-teal-400 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-4 mb-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 glass-card mb-6 animate-float">
              <Trophy size={32} className="text-yellow-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Fund8r APEX Challenge
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              The Ultimate
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Trading Competition
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
              Prove your skills through our rigorous 3-phase challenge. Win a funded account, 
              competitive salary, and launch your professional trading career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="/competition-signup"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all inline-flex items-center justify-center space-x-2 group"
              >
                <span>Enter Competition</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/competition-rules"
                className="px-8 py-4 glass-card border-2 border-white/20 rounded-lg font-bold text-lg hover:border-white/40 transition-all"
              >
                Read Full Rules
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-yellow-400">$100K</div>
                <div className="text-sm text-gray-400">1st Prize</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-green-400">No Split</div>
                <div className="text-sm text-gray-400">Profit Split</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-blue-400">$60K</div>
                <div className="text-sm text-gray-400">Base Salary</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-purple-400">180</div>
                <div className="text-sm text-gray-400">Total Days</div>
              </div>
            </div>
          </div>
        </section>

        {/* Phase Selector */}
        <section className="px-4 mb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
              {phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex-1 p-6 glass-card border-2 transition-all group ${
                    activePhase === phase.id
                      ? `border-transparent bg-gradient-to-br ${phase.color} text-white`
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <phase.icon size={24} />
                    <span className="font-bold">Phase {phase.id}</span>
                  </div>
                  <div className="text-sm opacity-90">{phase.duration}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Phase Details */}
        <section className="px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className={`transition-all duration-500 ${
                  activePhase === phase.id ? 'block animate-fade-in' : 'hidden'
                }`}
              >
                <div className={`glass-card border-2 p-8 md:p-12 bg-gradient-to-br ${phase.color} bg-opacity-5`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${phase.color}`}>
                      <phase.icon size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold">{phase.name}</h2>
                      <p className="text-gray-400">{phase.description}</p>
                    </div>
                  </div>

                  {/* Phase Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="glass-card p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Duration</div>
                      <div className="text-xl font-bold">{phase.duration}</div>
                    </div>
                    <div className="glass-card p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Balance</div>
                      <div className="text-xl font-bold text-blue-400">{phase.balance}</div>
                    </div>
                    <div className="glass-card p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Target</div>
                      <div className="text-xl font-bold text-green-400">{phase.profitTarget}</div>
                    </div>
                    <div className="glass-card p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Max DD</div>
                      <div className="text-xl font-bold text-red-400">{phase.maxDrawdown}</div>
                    </div>
                    <div className="glass-card p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Daily Loss</div>
                      <div className="text-xl font-bold text-orange-400">{phase.dailyLoss}</div>
                    </div>
                    <div className="glass-card p-4 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Advance</div>
                      <div className="text-xl font-bold text-purple-400">{phase.advancement}</div>
                    </div>
                  </div>

                  {/* Key Rules */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Shield size={24} />
                      Key Rules
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {phase.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3 glass-card p-4 border border-white/5">
                          <Check size={20} className="text-green-400 flex-shrink-0 mt-1" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {phase.id === 1 && (
                    <div className="mt-8 p-6 glass-card border-2 border-yellow-500/30 bg-yellow-500/5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={24} className="text-yellow-400 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-yellow-400 mb-2">Important Notes</div>
                          <ul className="space-y-1 text-sm text-gray-300">
                            <li>• Only top 15% advance to Phase 2</li>
                            <li>• Maximum 1 major violation allowed</li>
                            <li>• Weekly checkpoint gates must be passed</li>
                            <li>• Heat Index protocol activates after 2% daily loss</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {phase.id === 2 && (
                    <div className="mt-8 p-6 glass-card border-2 border-purple-500/30 bg-purple-500/5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={24} className="text-purple-400 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-purple-400 mb-2">Enhanced Requirements</div>
                          <ul className="space-y-1 text-sm text-gray-300">
                            <li>• Zero violation tolerance - any violation = elimination</li>
                            <li>• Only top 5% advance to Phase 3</li>
                            <li>• Weekly profit withdrawals (30% simulated)</li>
                            <li>• Bi-weekly psychology assessments required</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

               {phase.id === 3 && (
                    <div className="mt-8 p-6 glass-card border-2 border-green-500/30 bg-green-500/5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={24} className="text-green-400 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-green-400 mb-2">Live Trading</div>
                          <ul className="space-y-1 text-sm text-gray-300">
                            <li>• Real $25,000 capital - maximum pressure</li>
                            <li>• Monthly profitability required (3/3 months)</li>
                            <li>• Sharpe ratio weighted 40% in final scoring</li>
                            <li>• Public leaderboard with daily updates</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prize Structure */}
        <section className="px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Prize Structure
              </h2>
              <p className="text-xl text-gray-400">
                Life-changing rewards for top performers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className={`glass-card p-8 border-2 hover:scale-105 transition-all ${
                    index === 0 ? `border-transparent bg-gradient-to-br ${prize.gradient} bg-opacity-10` : 'border-white/10'
                  }`}
                >
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${prize.gradient} mb-4`}>
                    <prize.icon size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-6">{prize.place}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400">Funded Account</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {prize.account}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Profit Split</div>
                      <div className="text-2xl font-bold text-green-400">{prize.split}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Position</div>
                      <div className="text-lg font-semibold">{prize.salary}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Additional</div>
                      <div className="text-sm text-gray-300">{prize.bonus}</div>
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="text-sm text-yellow-400 font-semibold">
                        ⭐ Full-time employment offer included
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Competition Timeline
              </h2>
              <p className="text-xl text-gray-400">
                180 days from start to finish
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-purple-500 to-green-500 opacity-20"></div>
              
              <div className="space-y-12">
                {phases.map((phase, index) => (
                  <div key={phase.id} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="glass-card p-6 inline-block">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar size={20} className="text-blue-400" />
                          <span className="font-semibold">{phase.duration}</span>
                        </div>
                        <div className="text-2xl font-bold mb-2">{phase.name}</div>
                        <div className="text-gray-400">{phase.description}</div>
                      </div>
                    </div>
                    
                    <div className={`relative z-10 w-12 h-12 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center`}>
                      <phase.icon size={24} className="text-white" />
                    </div>
                    
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Countdown Timer */}
        <section className="px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card border-2 border-electric-blue/30 p-12 text-center bg-gradient-to-br from-electric-blue/5 to-cyber-purple/5">
              <Clock size={64} className="mx-auto mb-6 text-electric-blue" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Competition Starts In
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                December 1, 2025 - Mark your calendars!
              </p>

              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="glass-card p-6">
                  <div className="text-4xl font-black text-electric-blue mb-2">
                    {countdown.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Days</div>
                </div>
                <div className="glass-card p-6">
                  <div className="text-4xl font-black text-cyber-purple mb-2">
                    {countdown.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Hours</div>
                </div>
                <div className="glass-card p-6">
                  <div className="text-4xl font-black text-neon-pink mb-2">
                    {countdown.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Minutes</div>
                </div>
                <div className="glass-card p-6">
                  <div className="text-4xl font-black text-neon-green mb-2">
                    {countdown.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Seconds</div>
                </div>
              </div>

              <div className="mt-8 text-sm text-gray-400">
                ⏰ Updates every second • Don't miss out!
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card border-2 border-cyan-500/30 p-12 text-center bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
              <Trophy size={64} className="mx-auto mb-6 text-yellow-400" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Compete?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Entry fee: $9.99 (one-time) with optional $5 add-on for 2 attempts
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/competition-signup"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all inline-flex items-center justify-center space-x-2 group"
                >
                  <span>Enter Now - $9.99</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/competition-rules"
                  className="px-8 py-4 glass-card border-2 border-white/20 rounded-lg font-bold text-lg hover:border-white/40 transition-all"
                >
                  View Complete Rules
                </a>
              </div>
              <div className="mt-6 text-sm text-gray-400">
                Limited spots available • Next cohort starts in 14 days
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
