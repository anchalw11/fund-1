import { useEffect, useRef } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, Target, Zap, Award, BookOpen, ChevronRight, Crown, Trophy, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CompetitionRules() {
  const rulesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rulesRef.current) return;

    // Animate rule sections on scroll
    const sections = gsap.utils.toArray('.rule-section');
    sections.forEach((section: any) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div ref={rulesRef} className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-electric-blue/10 to-cyber-purple/10 backdrop-blur-xl border border-electric-blue/30 rounded-full">
                <Shield className="w-5 h-5 text-electric-blue animate-pulse" />
                <span className="text-sm font-bold tracking-wider text-electric-blue">OFFICIAL RULES</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink bg-clip-text text-transparent">
                COMPETITION RULES
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete guide to the Fund8r APEX Trader Challenge. Read carefully - violations result in elimination.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="rule-section mb-16 p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-electric-blue/5 to-cyber-purple/5 border border-electric-blue/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-electric-blue" />
              <span>Quick Navigation</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Phase 1: The Gauntlet', href: '#phase1' },
                { title: 'Phase 2: Proving Grounds', href: '#phase2' },
                { title: 'Phase 3: The Crucible', href: '#phase3' },
                { title: 'Prize Structure', href: '#prizes' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-black/50 border border-white/10 hover:border-electric-blue/50 transition-all duration-300 group"
                >
                  <ChevronRight className="w-5 h-5 text-electric-blue group-hover:translate-x-2 transition-transform" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">{item.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Phase 1 Rules */}
          <div id="phase1" className="rule-section mb-20">
            <div className="mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white">PHASE 1: THE GAUNTLET</h2>
                  <p className="text-gray-400">30 Calendar Days • Demo Account • $100,000</p>
                </div>
              </div>
            </div>

            {/* Core Limits */}
            <div className="mb-12 p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
              <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span>Critical Limits (Elimination if Exceeded)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-black/50 border border-red-500/20">
                  <div className="text-red-400 font-bold mb-2">Profit Target</div>
                  <div className="text-3xl font-black text-white">$10,000</div>
                  <div className="text-gray-400 text-sm mt-2">10% of starting balance</div>
                </div>
                <div className="p-6 rounded-xl bg-black/50 border border-red-500/20">
                  <div className="text-red-400 font-bold mb-2">Maximum Drawdown</div>
                  <div className="text-3xl font-black text-white">$6,000</div>
                  <div className="text-gray-400 text-sm mt-2">6% loss limit (Static or Trailing)</div>
                </div>
                <div className="p-6 rounded-xl bg-black/50 border border-red-500/20">
                  <div className="text-red-400 font-bold mb-2">Daily Loss Limit</div>
                  <div className="text-3xl font-black text-white">$4,000</div>
                  <div className="text-gray-400 text-sm mt-2">4% per day (resets 00:00 UTC)</div>
                </div>
                <div className="p-6 rounded-xl bg-black/50 border border-red-500/20">
                  <div className="text-red-400 font-bold mb-2">Minimum Trading Days</div>
                  <div className="text-3xl font-black text-white">18 of 30</div>
                  <div className="text-gray-400 text-sm mt-2">At least 1 completed trade per day</div>
                </div>
              </div>
            </div>

            {/* Position Sizing Rules */}
            <div className="mb-12 p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-400" />
                <span>Time-Weighted Position Limits</span>
              </h3>
              <div className="space-y-4">
                {[
                  { session: 'Asian Session (00:00-08:00 UTC)', limit: '2.0 lots', color: 'from-purple-500 to-pink-500' },
                  { session: 'London Open (07:00-09:00 UTC)', limit: '1.0 lot', color: 'from-red-500 to-orange-500' },
                  { session: 'London Session (08:00-16:00 UTC)', limit: '4.0 lots', color: 'from-blue-500 to-cyan-500' },
                  { session: 'NY Open (12:00-14:00 UTC)', limit: '1.5 lots', color: 'from-orange-500 to-yellow-500' },
                  { session: 'NY Session (13:00-21:00 UTC)', limit: '4.0 lots', color: 'from-green-500 to-teal-500' },
                  { session: 'Weekend Holding', limit: '0.5 lot', color: 'from-gray-500 to-gray-600' },
                ].map((item) => (
                  <div key={item.session} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/10">
                    <span className="text-gray-300">{item.session}</span>
                    <span className={`px-4 py-2 rounded-lg bg-gradient-to-r ${item.color} font-bold text-white`}>
                      Max {item.limit}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-yellow-400 text-sm flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span><strong>Important:</strong> During overlap sessions, use the LOWER limit</span>
                </p>
              </div>
            </div>

            {/* Weekly Checkpoint Gates */}
            <div className="mb-12 p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-green-500/5 to-teal-500/5 border border-green-500/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <Clock className="w-6 h-6 text-green-400" />
                <span>Weekly Checkpoint Gates</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { week: 'Week 1', requirement: 'Must be positive (even $1)', amount: '$1+', status: 'critical' },
                  { week: 'Week 2', requirement: '40% of target', amount: '$4,000', status: 'warning' },
                  { week: 'Week 3', requirement: '65% of target', amount: '$6,500', status: 'warning' },
                  { week: 'Week 4', requirement: 'Hit full target', amount: '$10,000', status: 'critical' },
                ].map((checkpoint) => (
                  <div key={checkpoint.week} className={`p-6 rounded-xl border-2 ${
                    checkpoint.status === 'critical' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-white text-lg">{checkpoint.week}</span>
                      <span className={`text-2xl font-black ${
                        checkpoint.status === 'critical' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {checkpoint.amount}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{checkpoint.requirement}</p>
                    {checkpoint.status === 'critical' && (
                      <div className="mt-3 flex items-center space-x-2 text-red-400 text-xs">
                        <XCircle className="w-4 h-4" />
                        <span>Failure = Elimination</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 2 Rules */}
          <div id="phase2" className="rule-section mb-20">
            <div className="mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white">PHASE 2: THE PROVING GROUNDS</h2>
                  <p className="text-gray-400">60 Calendar Days • Demo Account • $150,000 • Top 15% Only</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 mb-8">
              <p className="text-xl text-gray-300 mb-4">
                <strong className="text-white">All Phase 1 rules remain in effect</strong>, plus additional enhanced requirements:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-blue-500/20">
                  <div className="text-blue-400 font-bold mb-2">Profit Target</div>
                  <div className="text-2xl font-black text-white">$18,000 (12%)</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-red-500/20">
                  <div className="text-red-400 font-bold mb-2">Max Drawdown</div>
                  <div className="text-2xl font-black text-white">$7,500 (5%)</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-orange-500/20">
                  <div className="text-orange-400 font-bold mb-2">Daily Loss</div>
                  <div className="text-2xl font-black text-white">$3,750 (2.5%)</div>
                </div>
              </div>
            </div>

            {/* Zero Violation Tolerance */}
            <div className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-400" />
                <span className="text-red-400">ZERO VIOLATION TOLERANCE</span>
              </h3>
              <p className="text-gray-300">
                Unlike Phase 1, <strong className="text-white">ANY violation of ANY severity results in immediate elimination</strong>. 
                This includes minor violations that would have been warnings in Phase 1.
              </p>
            </div>
          </div>

          {/* Phase 3 Rules */}
          <div id="phase3" className="rule-section mb-20">
            <div className="mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white">PHASE 3: THE CRUCIBLE</h2>
                  <p className="text-gray-400">90 Calendar Days • LIVE ACCOUNT • $25,000 Real Money • Top 5% Only</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <p className="text-xl text-white font-bold">REAL MONEY TRADING - All previous rules enforced + maximum scrutiny</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-purple-500/20">
                  <div className="text-purple-400 font-bold mb-2">Profit Target</div>
                  <div className="text-2xl font-black text-white">$3,750 (15%)</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-red-500/20">
                  <div className="text-red-400 font-bold mb-2">Max Drawdown</div>
                  <div className="text-2xl font-black text-white">$1,250 (5%)</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-orange-500/20">
                  <div className="text-orange-400 font-bold mb-2">Daily Loss</div>
                  <div className="text-2xl font-black text-white">$500 (2%)</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-green-500/20">
                  <div className="text-green-400 font-bold mb-2">Monthly Profit</div>
                  <div className="text-2xl font-black text-white">3 / 3 months</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prize Structure */}
          <div id="prizes" className="rule-section mb-20">
            <h2 className="text-4xl font-black mb-12 text-center">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                PRIZE STRUCTURE
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  rank: '1ST PLACE',
                  account: '$100,000',
                  split: 'No Profit Split',
                  job: 'Full-Time Position',
                  salary: '$60K Base + Bonuses',
                  color: 'from-yellow-400 via-orange-500 to-red-500',
                  icon: <Crown className="w-12 h-12" />
                },
                {
                  rank: '2ND-5TH PLACE',
                  account: '$50,000',
                  split: 'No Profit Split',
                  job: 'Part-Time Contract',
                  salary: 'Performance Based',
                  color: 'from-gray-300 via-gray-400 to-gray-500',
                  icon: <Trophy className="w-10 h-10" />
                },
                {
                  rank: '6TH-10TH PLACE',
                  account: '$25,000',
                  split: 'No Profit Split',
                  job: 'Quarterly Reviews',
                  salary: 'Scaling Potential',
                  color: 'from-amber-600 via-orange-700 to-amber-800',
                  icon: <DollarSign className="w-10 h-10" />
                },
                {
                  rank: '11TH-20TH PLACE',
                  account: '$5,000',
                  split: 'No Profit Split',
                  job: 'Mini Account',
                  salary: 'Entry Level',
                  color: 'from-green-600 via-teal-700 to-cyan-800',
                  icon: <DollarSign className="w-10 h-10" />
                }
              ].map((prize, idx) => (
                <div key={idx} className={`p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/80 to-black/60 border-2 ${
                  idx === 0 ? 'border-yellow-500/50 scale-105' : 'border-white/10'
                }`}>
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r ${prize.color} font-black text-sm shadow-xl`}>
                    {prize.rank}
                  </div>
                  
                  <div className="flex justify-center mb-6 mt-4 text-white">
                    {prize.icon}
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Funded Account</div>
                      <div className="text-3xl font-black text-white">{prize.account}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Profit Split</div>
                      <div className="text-2xl font-bold text-neon-green">No Profit Split</div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-sm font-bold text-electric-blue mb-1">{prize.job}</div>
                      <div className="text-sm text-gray-400">{prize.salary}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center p-12 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-electric-blue/10 to-cyber-purple/10 border border-electric-blue/30">
            <h3 className="text-3xl font-black mb-6 text-white">Ready to Compete?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the Fund8r APEX Trader Challenge and prove your trading skills against the best.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/competition"
                className="group relative px-12 py-5 rounded-xl font-black text-lg overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink animate-gradient" />
                <div className="relative flex items-center space-x-3 text-white">
                  <Trophy className="w-6 h-6" />
                  <span>VIEW DETAILS</span>
                </div>
              </Link>
              <Link
                to="/competition-signup"
                className="group px-12 py-5 rounded-xl font-bold text-lg border-2 border-electric-blue backdrop-blur-xl bg-electric-blue/10 hover:bg-electric-blue/20 transition-all duration-300 hover:scale-105 text-white"
              >
                REGISTER NOW - $9.99
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
