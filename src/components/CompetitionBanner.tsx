import { useEffect, useRef, useState } from 'react';
import { Trophy, Target, Zap, ArrowRight, DollarSign, Users, Award, ChevronRight, Sparkles, Crown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CompetitionBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;

    // Create floating particles
    if (particlesRef.current) {
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'competition-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particlesRef.current.appendChild(particle);
      }
    }

    // Ultimate responsive scroll-triggered animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: bannerRef.current,
        start: 'top 60%',
        end: 'bottom 70%',
        scrub: 0.05,
      }
    });

    // Animate title instantly
    tl.fromTo(
      '.competition-title',
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.1 }
    );

    // Animate phases simultaneously
    tl.fromTo(
      '.phase-card',
      { opacity: 0, x: -50, rotateY: -15 },
      { opacity: 1, x: 0, rotateY: 0, stagger: 0.02, duration: 0.1 },
      '-=0.05'
    );

    // Animate prize section instantly
    tl.fromTo(
      '.prize-section',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.1 },
      '-=0.02'
    );


    // Auto-cycle phases
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
      clearInterval(interval);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const phases = [
    {
      number: 1,
      name: 'THE GAUNTLET',
      duration: '30 Days',
      account: '$100,000',
      target: '10%',
      drawdown: '6%',
      color: 'from-orange-500 to-red-600',
      icon: <Zap className="w-8 h-8" />,
      participants: '1,000 Start',
      advance: '15% Advance',
    },
    {
      number: 2,
      name: 'THE PROVING GROUNDS',
      duration: '60 Days',
      account: '$150,000',
      target: '12%',
      drawdown: '5%',
      color: 'from-blue-500 to-purple-600',
      icon: <Target className="w-8 h-8" />,
      participants: '150 Continue',
      advance: '5% Advance',
    },
    {
      number: 3,
      name: 'THE CRUCIBLE',
      duration: '90 Days',
      account: '$25,000 LIVE',
      target: '15%',
      drawdown: '5%',
      color: 'from-purple-500 to-pink-600',
      icon: <Trophy className="w-8 h-8" />,
      participants: '10 Finalists',
      advance: 'WIN',
    },
  ];

  const prizes = [
    {
      rank: '1ST',
      icon: <Crown className="w-12 h-12" />,
      account: '$100,000',
      job: 'Full-Time Position',
      salary: '$60K Base',
      color: 'from-yellow-400 via-orange-500 to-red-500',
      glow: 'gold',
    },
    {
      rank: '2ND-5TH',
      icon: <Award className="w-10 h-10" />,
      account: '$50,000',
      job: 'Part-Time Contract',
      salary: 'Performance Based',
      color: 'from-gray-300 via-gray-400 to-gray-500',
      glow: 'silver',
    },
    {
      rank: '6TH-10TH',
      icon: <DollarSign className="w-10 h-10" />,
      account: '$25,000',
      job: 'Quarterly Reviews',
      salary: 'Scaling Potential',
      color: 'from-amber-600 via-orange-700 to-amber-800',
      glow: 'bronze',
    },
    {
      rank: '11TH-20TH',
      icon: <DollarSign className="w-10 h-10" />,
      account: '$5,000',
      job: 'Mini Account',
      salary: 'Entry Level',
      color: 'from-green-600 via-teal-700 to-cyan-800',
      glow: 'green',
    },
  ];

  return (
    <section ref={bannerRef} className="py-32 px-4 relative overflow-hidden">
      {/* Animated particles background */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-electric-blue/20 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-cyber-purple/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title Section */}
        <div className="text-center mb-20 competition-title">
          <div className="inline-block mb-6">
            <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-electric-blue/10 to-cyber-purple/10 backdrop-blur-xl border border-electric-blue/30 rounded-full">
              <Sparkles className="w-5 h-5 text-electric-blue animate-pulse" />
              <span className="text-sm font-bold tracking-wider text-electric-blue">EXCLUSIVE COMPETITION</span>
              <Sparkles className="w-5 h-5 text-cyber-purple animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink bg-clip-text text-transparent drop-shadow-2xl animate-gradient">
              FUND8R APEX
            </span>
            <br />
            <span className="text-white drop-shadow-2xl">TRADER CHALLENGE</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Compete with the <span className="text-electric-blue font-bold">best traders globally</span> in our 
            <span className="text-neon-pink font-bold"> 3-phase ultimate challenge</span>
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 text-neon-green">
              <Users className="w-5 h-5" />
              <span className="font-semibold">1,000+ Participants</span>
            </div>
            <div className="w-1 h-6 bg-gradient-to-b from-transparent via-electric-blue to-transparent" />
            <div className="flex items-center space-x-2 text-electric-blue">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">$100K Top Prize</span>
            </div>
            <div className="w-1 h-6 bg-gradient-to-b from-transparent via-electric-blue to-transparent" />
            <div className="flex items-center space-x-2 text-cyber-purple">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Full-Time Position</span>
            </div>
          </div>
        </div>

        {/* Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {phases.map((phase, index) => (
            <div
              key={phase.number}
              className="phase-card relative group cursor-pointer"
              onMouseEnter={() => setActivePhase(index)}
            >
              <div className={`
                relative p-8 rounded-2xl backdrop-blur-2xl border-2 transition-all duration-500
                ${activePhase === index 
                  ? 'border-electric-blue shadow-2xl shadow-electric-blue/50 scale-105' 
                  : 'border-white/10 hover:border-electric-blue/50 scale-100'
                }
                bg-gradient-to-br from-black/60 via-black/40 to-transparent
              `}>
                {/* Phase number badge */}
                <div className={`
                  absolute -top-6 -right-6 w-20 h-20 rounded-full 
                  bg-gradient-to-br ${phase.color}
                  flex items-center justify-center text-3xl font-black text-white
                  shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300
                  border-4 border-black/20
                `}>
                  {phase.icon}
                </div>

                {/* Phase header */}
                <div className="mb-6">
                  <div className="text-sm font-bold text-gray-400 mb-1">PHASE {phase.number}</div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                    {phase.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-electric-blue">
                    <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
                    <span className="text-sm font-bold">{phase.duration}</span>
                  </div>
                </div>

                {/* Phase stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Account Size</span>
                    <span className="text-white font-bold text-lg">{phase.account}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Profit Target</span>
                    <span className="text-neon-green font-bold text-lg">{phase.target}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Max Drawdown</span>
                    <span className="text-red-400 font-bold text-lg">{phase.drawdown}</span>
                  </div>
                </div>

                {/* Phase participants */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{phase.participants}</span>
                    <span className={`
                      font-bold px-3 py-1 rounded-full
                      bg-gradient-to-r ${phase.color}
                    `}>
                      {phase.advance}
                    </span>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  bg-gradient-to-br ${phase.color} -z-10 blur-2xl
                `} />
              </div>
            </div>
          ))}
        </div>

        {/* Prize Section */}
        <div className="prize-section relative">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                CHAMPIONSHIP PRIZES
              </span>
            </h3>
            <p className="text-gray-300 text-lg">Win life-changing capital and a professional trading career</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {prizes.map((prize, index) => (
              <div
                key={prize.rank}
                className={`
                  relative p-8 rounded-2xl backdrop-blur-2xl border-2
                  bg-gradient-to-br from-black/80 via-black/60 to-transparent
                  hover:scale-105 transition-all duration-500 group
                  ${index === 0 
                    ? 'border-yellow-500/50 shadow-2xl shadow-yellow-500/30 md:scale-110' 
                    : 'border-white/10 hover:border-white/30'
                  }
                `}
              >
                {/* Rank badge */}
                <div className={`
                  absolute -top-4 left-1/2 transform -translate-x-1/2
                  px-6 py-2 rounded-full font-black text-sm
                  bg-gradient-to-r ${prize.color}
                  shadow-xl ${index === 0 ? 'shadow-yellow-500/50' : ''}
                `}>
                  {prize.rank} PLACE
                </div>

                {/* Icon */}
                <div className={`
                  flex items-center justify-center mb-6 mt-4
                  text-${prize.glow === 'gold' ? 'yellow' : prize.glow === 'silver' ? 'gray' : 'amber'}-400
                `}>
                  {prize.icon}
                </div>

                {/* Prize details */}
                <div className="space-y-3 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Funded Account</div>
                    <div className="text-3xl font-black text-white">{prize.account}</div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="text-sm font-bold text-electric-blue mb-1">{prize.job}</div>
                    <div className="text-sm text-gray-400">{prize.salary}</div>
                  </div>
                </div>

                {/* Hover glow */}
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  bg-gradient-to-br ${prize.color} -z-10 blur-2xl
                `} />
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/competition"
              className="group relative px-12 py-5 rounded-xl font-black text-lg overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              <div className="relative flex items-center space-x-3 text-white">
                <Trophy className="w-6 h-6" />
                <span>VIEW FULL DETAILS</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            <Link
              to="/competition-signup"
              className="group px-12 py-5 rounded-xl font-bold text-lg border-2 border-electric-blue backdrop-blur-xl bg-electric-blue/10 hover:bg-electric-blue/20 transition-all duration-300 hover:scale-105 flex items-center space-x-3"
            >
              <Sparkles className="w-5 h-5 text-electric-blue" />
              <span className="text-white">REGISTER NOW - $9.99</span>
              <ChevronRight className="w-5 h-5 text-electric-blue group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* Additional info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-6 px-8 py-4 rounded-full backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-sm text-gray-300">Next Competition: <span className="text-white font-bold">Dec 1, 2025</span></span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-electric-blue" />
                <span className="text-sm text-gray-300">Spots Remaining: <span className="text-white font-bold">637 / 1000</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
