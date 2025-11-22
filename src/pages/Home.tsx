import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import CompetitionBanner from '../components/CompetitionBanner';
import Hero3DBackground from '../components/Hero3DBackground';
import PricingCard from '../components/PricingCard';
import StatCard from '../components/StatCard';
import FeatureCard from '../components/FeatureCard';
import TestimonialCard from '../components/TestimonialCard';
import GradientText from '../components/ui/GradientText';
import { GlowingEffect } from '../components/ui/glowing-effect';
import SphereImageGrid, { ImageData } from '../components/ui/img-sphere';
import GlassCard from '../components/ui/GlassCard';
import { PinContainer } from '../components/ui/3d-pin';
import { TopTraders } from '../components/TopTraders';
import { tradingRulesTestimonials } from '../lib/utils';
import { TestimonialStack } from '../components/ui/glass-testimonial-swiper';
import { AnimatedJobCard, JobCardProps } from '../components/ui/animated-job-card';
import ProfileCard from '../components/ui/profile-card';
import Component from '../components/ui/profile-card';
import {
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { useEffect } from 'react';

const successStoriesData = [
  {
    username: "Marcus Chen",
    bio: "★★★★★ I can't believe it! Made $12,450 in my first month with Fund8r! Their rules are so fair and payouts are lightning-fast. Got my first withdrawal in just 11 days. I absolutely love Fund8r - they changed my life!",
    status: ["WINNER", "PROFITABLE", "FAST PAYOUT"],
    tier: 3,
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=face",
  },
  {
    username: "Sarah Martinez",
    bio: "★★★★★ Fund8r is absolutely incredible! I finally found a legit prop firm after trying 3 others. Fund8r has the best pricing and actually pays on time. I'm in love with their professional approach - they're the real deal!",
    status: ["LEGIT", "BEST PRICING", "RELIABLE"],
    tier: 3,
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face",
  },
  {
    username: "Ahmed Hassan",
    bio: "★★★★★ Fund8r is the best! Passed Phase 1 in just 6 days. The no-time-limit option removed all pressure, letting me trade at my own pace. I absolutely adore Fund8r - they're so trader-friendly and supportive!",
    status: ["QUICK PASS", "NO PRESSURE", "CONSISTENT"],
    tier: 3,
    imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=256&h=256&fit=crop&crop=face",
  },
];

const NewFeaturesDemo = () => {
  const cards: JobCardProps[] = [
    {
      companyLogo: <div className="text-4xl">🏆</div>,
      companyName: "Fund8r",
      jobTitle: "Free Mini Challenge",
      salary: "100% FREE Trading",
      tags: ["Risk-Free", "7 Days Trial"],
      postedDate: "Start Now",
      variant: "yellow" as const,
    },
    {
      companyLogo: <div className="text-4xl">🏅</div>,
      companyName: "Fund8r",
      jobTitle: "Achievement Badges",
      salary: "Unlock Exclusive Badges",
      tags: ["Turn Rewards", "Milestones"],
      postedDate: "Earn Today",
      variant: "purple" as const,
    },
    {
      companyLogo: <div className="text-4xl">♾️</div>,
      companyName: "Fund8r",
      jobTitle: "Unlimited Subscriptions",
      salary: "Flexible Plans",
      tags: ["Monthly/Quarterly", "Retries"],
      postedDate: "Join Now",
      variant: "blue" as const,
    },
    {
      companyLogo: <div className="text-4xl">🎁</div>,
      companyName: "Fund8r",
      jobTitle: "Second Chance Offers",
      salary: "Retry & Succeed",
      tags: ["Special Offers", "Discounts"],
      postedDate: "Don't Give Up",
      variant: "pink" as const,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((job, index) => (
        <AnimatedJobCard
          key={job.jobTitle + job.companyName}
          {...job}
          className="w-full max-w-4xl"
        />
      ))}
    </div>
  );
};

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale-in, .animate-rotate-in');
    animatedElements.forEach((el) => observer.observe(el));

    // Parallax effect for certain elements
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element') as NodeListOf<HTMLElement>;

      parallaxElements.forEach((element) => {
        const rate = parseFloat(element.dataset.parallax || '0.5');
        element.style.transform = `translateY(${scrolled * rate}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      <div className="relative z-10">
        <section className="pt-40 pb-20 px-4 relative overflow-hidden">
          <Hero3DBackground />
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="floating-card floating-card-1">
            💰 $2.4M+ Paid to Traders
          </div>
          <div className="floating-card floating-card-2">
            ⚡ 48hr Payout Processing
          </div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Get Funded Up to{' '}
              <GradientText>$2,000,000</GradientText>
              <br />
              Without Risking Your Own Capital
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Pass our 2-phase challenge, prove your skills, and trade with our capital. Keep up to 100% of profits with bi-monthly payouts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
              <a href="/signup" className="btn-gradient flex items-center space-x-2 group">
                <span>Start Your Challenge</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <a href="#how-it-works" className="px-8 py-4 glass-card rounded-lg font-semibold text-lg hover:border-electric-blue/50 transition-all">
                See How It Works
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <StatCard value="$2.4M+" label="Paid to Traders" icon="💰" />
              <StatCard value="12,847" label="Active Traders" icon="👥" />
              <StatCard value="48hr" label="Payout Processing" icon="⚡" />
              <StatCard value="140+" label="Countries" icon="🌍" />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-4 bg-black/20 relative overflow-hidden">
          {/* Futuristic particle effects */}
          <div className="futuristic-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>

          {/* Cyber grid background */}
          <div className="cyber-grid"></div>

          <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-on-scroll"><GradientText>How It Works</GradientText></h2>
            <p className="text-xl text-gray-400 animate-on-scroll stagger-1">Simple 3-step process to get funded</p>
          </div>

          <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-8 relative z-10">
            <div className="animate-slide-left">
              <GlassCard
                step={1}
                title="Choose Your Account"
                description="Select from $5K to $2M account sizes starting at just $12"
                showSocialIcons={false}
                showLogo={false}
              />
            </div>

            <div className="animate-scale-in">
              <GlassCard
                step={2}
                title="Pass 2 Evaluation Phases"
                description="Hit profit targets while managing risk. No time limits available."
                showSocialIcons={false}
                showLogo={false}
              />
            </div>

            <div className="animate-slide-right">
              <GlassCard
                step={3}
                title="Get Funded & Trade"
                description="Keep 75-100% of profits based on your payout cycle. Choose from weekly to bi-monthly payouts."
                showSocialIcons={false}
                showLogo={false}
              />
            </div>
          </div>
        </section>

        <TopTraders />

        {/* 3D Pin CTA Section */}
        <section className="py-20 px-4 h-[50rem]">
          <div className="max-w-6xl mx-auto h-full flex items-center justify-center">
            <PinContainer
              title="Start Trading"
              href="/signup"
            >
              <div className="flex flex-col p-12 tracking-tight text-slate-100/50 w-[40rem] h-[25rem] bg-gradient-to-b from-slate-800/50 to-slate-800/0 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-4 rounded-full bg-electric-blue animate-pulse" />
                  <div className="text-sm text-slate-400">Join 12,847+ Traders</div>
                </div>

                <div className="flex-1 mt-4 space-y-6">
                  <div className="text-3xl font-bold text-white">
                    Get Funded Up to $2,000,000
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-electric-blue">$2.4M+</div>
                      <div className="text-xs text-slate-400">Paid to Traders</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-cyber-purple">48hrs</div>
                      <div className="text-xs text-slate-400">Avg Payout Time</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-sm text-slate-400">
                      Your trading career starts here
                    </div>
                    <div className="text-electric-blue text-lg font-semibold">
                      Choose Your Account →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>
        </section>

        {/* New Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText>New Features</GradientText>
            </h2>
            <p className="text-xl text-gray-400">Discover our latest additions to enhance your trading journey</p>
          </div>

          {/* Animated Job Card Demo */}
          <NewFeaturesDemo />
        </section>

        {/* Competition Banner - Relocated Here */}
        <CompetitionBanner />

        <section className="py-20 px-4 bg-black/20">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Fund8r?</h2>
            <p className="text-xl text-gray-400">Industry-leading features for serious traders</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
            <div className="relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Component
                title="Instant Demo Access"
                subtitle="Start trading immediately after payment. No waiting."

                avatarSrc="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=256&h=256&fit=crop&crop=center"
                statusText="Instant"
                statusColor="bg-subtle-electric"
                glowColor="bg-subtle-electric"
                glowText="Demo Access"
                className="w-full"
              />
            </div>
            <div className="relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Component
                title="Industry-Leading Splits"
                subtitle="Keep up to 100% of your profits. Choose your payout frequency and split."
                avatarSrc="https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=256&h=256&fit=crop&crop=center"
                statusText="Max Profit"
                statusColor="bg-subtle-sage"
                glowColor="bg-subtle-sage"
                glowText="100% Profits"
                className="w-full"
              />
            </div>
            <div className="relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Component
                title="Unlimited Retakes"
                subtitle="Failed? Reset for 50% off. We want you to succeed."
                avatarSrc="https://images.unsplash.com/photo-1552664730-d307ca884978?w=256&h=256&fit=crop&crop=center"
                statusText="Second Chance"
                statusColor="bg-subtle-cyber"
                glowColor="bg-subtle-cyber"
                glowText="Multiple Attempts"
                className="w-full"
              />
            </div>
            <div className="relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Component
                title="Trade Your Way"
                subtitle="All strategies allowed: scalping, news trading, EAs, overnight holds."
                avatarSrc="https://images.unsplash.com/photo-1611974780285-c640e8f25b8e?w=256&h=256&fit=crop&crop=center"
                statusText="Total Freedom"
                statusColor="bg-gray-400"
                glowColor="bg-gray-400"
                glowText="All Strategies"
                className="w-full"
              />
            </div>
            <div className="relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Component
                title="Real Support"
                subtitle="Live chat 24/5. Real traders helping traders."
                avatarSrc="https://images.unsplash.com/photo-1552664730-d307ca884978?w=256&h=256&fit=crop&crop=center"
                statusText="24/5 Available"
                statusColor="bg-slate-400"
                glowColor="bg-slate-400"
                glowText="Live Support"
                className="w-full"
              />
            </div>
            <div className="relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Component
                title="Scale Your Account"
                subtitle="Grow your funded account up to $2M based on performance."
                avatarSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=256&h=256&fit=crop&crop=center"
                statusText="Unlimited Growth"
                statusColor="bg-gray-400"
                glowColor="bg-gray-400"
                glowText="Scale Up"
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section id="rules" className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trading Rules</h2>
            <p className="text-xl text-gray-400">Clear, fair rules designed for trader success</p>

            <div className="mt-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 w-full max-w-5xl mx-auto">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <span className="text-lg">ℹ️</span>
                  <h4 className="text-white font-medium text-base">Important Notice</h4>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  These are the <strong className="text-electric-blue">Classic Challenge rules</strong>. Some challenges may have different rules.
                  Visit our Challenges page for full details.
                </p>
                <a href="/challenge-types" className="inline-block mt-2 px-3 py-1 bg-electric-blue/20 text-electric-blue border border-electric-blue/30 rounded-md hover:bg-electric-blue/30 transition-colors text-xs font-medium">
                  View Challenge Types
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-8">
            <TestimonialStack testimonials={tradingRulesTestimonials} />
          </div>
        </section>

        <section className="py-20 px-4 bg-black/20" style={{ perspective: '1000px' }}>
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-400">Real traders, real results</p>
          </div>

          <div className="max-w-7xl mx-auto flex justify-center items-center gap-4 md:gap-8 lg:gap-6 xl:gap-8 flex-wrap lg:flex-nowrap">
            {successStoriesData.map((story, index) => (
              <ProfileCard key={story.username} data={story} />
            ))}
          </div>
        </section>

        {/* Interactive 3D Testimonials Sphere - Performance Optimized */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText>Trader Testimonials Sphere</GradientText>
            </h2>
            <p className="text-xl text-gray-400">Interactive 3D sphere - Click and drag to explore</p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <SphereImageGrid
                images={[
                  {
                    id: 'testimonial-1',
                    src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&h=250&fit=crop&crop=face',
                    alt: 'James Rodriguez',
                    title: 'James Rodriguez',
                    description: '"★★★★★ Finally made it past evaluation! Started with their $10K account. Hit the 10% profit target in 18 days. The community support on Discord was incredible - they kept me accountable during drawdown. First withdrawal hit next day after request."'
                  },
                  {
                    id: 'testimonial-2',
                    src: 'https://images.unsplash.com/photo-1594824486539-1c22f6f30dfb?w=250&h=250&fit=crop&crop=face',
                    alt: 'Anna Kowalski',
                    title: 'Anna Kowalski',
                    description: '"★★★★★ I needed a break from traditional prop firms after losing $2K+ in evaluations. Fund8r\'s no-time-limit ruleset saved me. Passed Phase 1 in 37 days working part-time. Their payout split is clean - 80% after 60 days. No nonsense, just fair trading."'
                  },
                  {
                    id: 'testimonial-3',
                    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&h=250&fit=crop&crop=face',
                    alt: 'Miguel Santos',
                    title: 'Miguel Santos',
                    description: '"★★★★★ After failing 3 evaluations with other firms, I found Fund8r through Reddit. Their 5% max drawdown policy worked perfect with my cautious style. Reset fee was only $50 vs other firms charging 50% of original price. Now funded with $50K."'
                  },
                  {
                    id: 'testimonial-4',
                    src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&h=250&fit=crop&crop=face',
                    alt: 'Lisa Thompson',
                    title: 'Lisa Thompson',
                    description: '"★★★★★ Working 9-5 with kids - Fund8r\'s no minimum trading days was exactly what I needed. Traded 12 days total to pass both phases. The flexible schedule let me trade during morning sessions before work. Currently up 15% with disciplined risk management."'
                  },
                  {
                    id: 'testimonial-5',
                    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=face',
                    alt: 'Raj Patel',
                    title: 'Raj Patel',
                    description: '"★★★★★ Switched to MT5 when I passed. The interface is smoother for my scalping strategy. Hit profit target in 9 days through London/New York overlap. Love that they allow all timeframes - been profitable ever since the funded phase."'
                  },
                  {
                    id: 'testimonial-6',
                    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&h=250&fit=crop&crop=face',
                    alt: 'David Chen',
                    title: 'David Chen',
                    description: '"★★★★★ After 4 failed attempts at other firms, Fund8r finally recognized my scalping edge. The no-lot-restriction policy allowed me to trade my way. Passed in 22 days with 95% win rate. Changed my life - made $8,234 this month already."'
                  },
                  {
                    id: 'testimonial-7',
                    src: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=250&h=250&fit=crop&crop=face',
                    alt: 'Maria Garcia',
                    title: 'Maria Garcia',
                    description: '"★★★★★ Spanish trader here. Their payout rules are straightforward - hold profit 60 days and get 80% split. No benchmarks, no minimum lots. The transparency is refreshing. Made my first withdrawal of €3,450 after 67 trading days."'
                  },
                  {
                    id: 'testimonial-8',
                    src: 'https://images.unsplash.com/photo-1556157382-97eda2f9e2a0?w=250&h=250&fit=crop&crop=face',
                    alt: 'Alex Johnson',
                    title: 'Alex Johnson',
                    description: '"★★★★★ Failed Phase 2 again with FTMO last month due to commission drawdown. Fund8r\'s model treats commissions as a separate expense. The fair rules allowed me to focus on market direction, not accounting bullshit. Finally funded."'
                  },
                  {
                    id: 'testimonial-9',
                    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250&h=250&fit=crop&crop=face',
                    alt: 'Sarah Wilson',
                    title: 'Sarah Wilson',
                    description: '"★★★★★ Their support team is actually USEFUL. Called them about order execution during Phase 1 and got real answers. No scripts, no BS. Took 28 days to pass but learned so much. Love the weekly payout options - flexibility is key."'
                  },
                  {
                    id: 'testimonial-10',
                    src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&h=250&fit=crop&crop=face',
                    alt: 'Michael Brown',
                    title: 'Michael Brown',
                    description: '"★★★★★ Destroyed my $5K account Phase 1 due to revenge trading after drawdown. Reset cost me $75 but was worth it. Second attempt was disciplined - passed in 16 days. Trust the process, but know when to reset. Currently up 12%."'
                  },
                  {
                    id: 'testimonial-11',
                    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&h=250&fit=crop&crop=face',
                    alt: 'Emma Davis',
                    title: 'Emma Davis',
                    description: '"★★★★★ I love Fund8r! Their $3K mini-challenge proved my strategy worked perfectly. Started with the demo and turned it into $4,290 profit in just 7 days. The confidence boost was incredible! Then I went straight to a $25K live account and passed both phases in 11 days total."'
                  },
                  {
                    id: 'testimonial-12',
                    src: 'https://images.unsplash.com/photo-1551836022-b5da9ddf0acd?w=250&h=250&fit=crop&crop=face',
                    alt: 'Carlos Ramirez',
                    title: 'Carlos Ramirez',
                    description: '"★★★★★ Fund8r is absolutely amazing! I\'m living the dream now as a trader. After failing 7 evaluations at other firms, Fund8r\'s rules finally worked with my swing trading style. The no minimum trading days let me trade when liquidity was best. First payout was $2,341 after 56 days - I\'m so grateful!"'
                  },
                  {
                    id: 'testimonial-13',
                    src: 'https://images.unsplash.com/photo-1592201420771-56e52fd38f5e?w=250&h=250&fit=crop&crop=face',
                    alt: 'Jessica Liu',
                    title: 'Jessica Liu',
                    description: '"★★★★★ I absolutely adore Fund8r! During Phase 1, my news trading went wrong and put me in drawdown, but Fund8r\'s team encouraged me to hold through it. That experience taught me so much. Now I\'m funded and trading 4 major pairs with discipline. They genuinely care about success!"'
                  },
                  {
                    id: 'testimonial-14',
                    src: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250&h=250&fit=crop&crop=face',
                    alt: 'Robert Taylor',
                    title: 'Robert Taylor',
                    description: '"★★★★★ Fund8r changed my trading life! After losing $4K at other firms, I practiced on their $1K demo for 30 days and built incredible confidence. When I went live, I was profitable from day one! Passed both phases in just 19 days. Best prop firm ever!"'
                  },
                  {
                    id: 'testimonial-15',
                    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=250&h=250&fit=crop&crop=face',
                    alt: 'Isabella Rossi',
                    title: 'Isabella Rossi',
                    description: '"★★★★★ Fund8r is phenomenal! As a London-based scalper, their razor-thin spreads and lightning-fast execution are unbeatable. I absolutely love them! Hit my 8% profit target in just 6 days trading the London session. Their payout process is flawless too - got my 95% split payout!"'
                  },
                  {
                    id: 'testimonial-16',
                    src: 'https://images.unsplash.com/photo-1619948507916-8c6aa3c6a2a9?w=250&h=250&fit=crop&crop=face',
                    alt: 'Kevin Zhang',
                    title: 'Kevin Zhang',
                    description: '"★★★★★ I love Fund8r so much! Their customer service genuinely helps you become a better trader. When I emailed about strategy issues during Phase 1, they gave me valuable resources and advice - not just canned responses. Passed evaluation in 23 days and my first withdrawal came exactly as promised!"'
                  },
                  {
                    id: 'testimonial-17',
                    src: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=250&h=250&fit=crop&crop=face',
                    alt: 'Amanda White',
                    title: 'Amanda White',
                    description: '"★★★★★ Fund8r is the best prop firm I\'ve ever worked with! I failed at 3 other firms because I was terrified of drawdown, but Fund8r\'s 10% max DD gave me breathing room. Passed Phase 1 in 41 days, Phase 2 in 22 days. They made it all worth it - I LOVE this firm!"'
                  },
                  {
                    id: 'testimonial-18',
                    src: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=250&h=250&fit=crop&crop=face',
                    alt: 'Hassan Ahmed',
                    title: 'Hassan Ahmed',
                    description: '"★★★★★ I absolutely love Fund8r! As a Middle Eastern trader, their no weekend holding restriction perfectly fits Islamic trading practices. I can close before Friday prayers. The respect for different cultures is amazing. Passed evaluation trading London to Tokyo overlap. They\'re the best!"'
                  }
                ]}
                containerSize={650}
                sphereRadius={220}
                dragSensitivity={0.8}
                momentumDecay={0.92}
                maxRotationSpeed={3}
                baseImageScale={0.12}
                hoverScale={1.2}
                perspective={1100}
                autoRotate={true}
                autoRotateSpeed={0.08}
                className="cyber-sphere-container"
              />
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400">Everything you need to know</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: 'What platforms can I use?',
                a: 'MT4, MT5, cTrader, or DXtrade - your choice.',
              },
              {
                q: 'Can I trade during news?',
                a: 'Yes! All strategies allowed including news trading.',
              },
              {
                q: 'How fast are payouts?',
                a: 'Requested on-demand every 14 days. Processed within 48hrs.',
              },
              {
                q: 'Can I use Expert Advisors?',
                a: 'Yes! Fully automated trading is allowed across all phases.',
              },
              {
                q: 'What if I fail the challenge?',
                a: 'You can reset your account for 50% off the original fee and try again.',
              },
              {
                q: 'Is Phase 2 really free?',
                a: 'Yes! 100% free. You only pay once for Phase 1.',
              },
            ].map((faq, index) => (
              <details key={index} className="glass-card p-6 group relative">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={80}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
