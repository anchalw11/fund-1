import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  Award,
  FileText,
  Trophy,
  Users,
  CreditCard,
  UserPlus,
  Calendar,
  Download,
  Clock,
  HelpCircle,
  CheckCircle,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  Check,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  MessageSquare
} from 'lucide-react';
import GradientText from '../components/ui/GradientText';
import { supabase } from '../lib/db';
import { signOut } from '../lib/auth';
import { api } from '../lib/api';
import Notification from '../components/dashboard/Notification';
import ContractAcceptance from '../components/dashboard/ContractAcceptance';
import AccountStatusBadge from '../components/dashboard/AccountStatusBadge';
import NewSettings from '../components/dashboard/NewSettings';
import Analytics3DBackground from '../components/dashboard/Analytics3DBackground';
import AccountCard from '../components/dashboard/AccountCard';
import { generateContractText } from '../config/contractText';

type Section =
  | 'overview'
  | 'analytics'
  | 'payouts'
  | 'certificates'
  | 'contracts'
  | 'competitions'
  | 'leaderboard'
  | 'billing'
  | 'affiliates'
  | 'calendar'
  | 'downloads'
  | 'support'
  | 'faq'
  | 'settings';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const script1 = document.createElement('script');
    script1.innerHTML = `window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.id = 'zsiqscript';
    script2.src = 'https://salesiq.zohopublic.in/widget?wc=siqa59170b55f5b439a77afcfd82324668581ea9b8cea71b73efd2b3de89f00dd8f';
    script2.defer = true;
    document.head.appendChild(script2);

    return () => {
      // Find and remove the scripts
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        const script = scripts[i];
        if (script.id === 'zsiqscript' || (script.innerHTML && script.innerHTML.includes('$zoho.salesiq'))) {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
      }
    };
  }, []);

  async function checkAuth() {
    try {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Account Overview' },
    // { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'payouts', icon: DollarSign, label: 'Payouts' },
    // { id: 'certificates', icon: Award, label: 'Certificates' },
    { id: 'contracts', icon: FileText, label: 'Contracts' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'leaderboard', icon: Users, label: 'Leaderboard' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'affiliates', icon: UserPlus, label: 'Affiliates' },
    // { id: 'calendar', icon: Calendar, label: 'Economic Calendar' },
    // { id: 'downloads', icon: Download, label: 'Downloads' },
    // { id: 'support', icon: MessageSquare, label: 'Support Tickets' },
    { id: 'faq', icon: HelpCircle, label: 'FAQ' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          <aside className="glass-card p-6 h-fit sticky top-24">
            <div className="text-center mb-6 pb-6 border-b border-white/10">
              <div className="w-20 h-20 bg-gradient-to-br from-electric-blue to-neon-purple rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-white/70">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as Section)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={() => navigate('/challenge-types')}
                className="w-full px-4 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold text-sm hover:scale-105 transition-transform"
              >
                Purchase New Challenge
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </aside>

          <main className="glass-card p-8">
            {activeSection === 'overview' && <OverviewSection user={user} navigate={navigate} />}
            {/* {activeSection === 'analytics' && <AnalyticsSection user={user} />} */}
            {activeSection === 'payouts' && <PayoutsSection user={user} />}
            {activeSection === 'certificates' && <CertificatesSection user={user} />}
            {activeSection === 'contracts' && <ContractsSection user={user} />}
            {activeSection === 'competitions' && <CompetitionsSection user={user} />}
            {activeSection === 'leaderboard' && <LeaderboardSection user={user} />}
            {activeSection === 'billing' && <BillingSection user={user} navigate={navigate} />}
            {activeSection === 'affiliates' && <AffiliatesSection user={user} />}
            {activeSection === 'calendar' && <CalendarSection />}
            {activeSection === 'downloads' && <DownloadsSection />}
            {activeSection === 'support' && <SupportSection user={user} />}
            {activeSection === 'faq' && <FAQSection />}
            {activeSection === 'settings' && <SettingsSection user={user} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function OverviewSection({ user, navigate }: { user: any; navigate: (path: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  const [breachedAccounts, setBreachedAccounts] = useState<any[]>([]);
  const [awaitingCredentialsAccounts, setAwaitingCredentialsAccounts] = useState<any[]>([]);
  const [rejectedAccounts, setRejectedAccounts] = useState<any[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [unsignedChallenge, setUnsignedChallenge] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'breached' | 'awaiting' | 'rejected'>('active');
  const [phaseSubTab, setPhaseSubTab] = useState<'phase1' | 'phase2' | 'live'>('phase1');
  const [userChallenges, setUserChallenges] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const result = await api.getNotifications(user.id);
      if (result.success) {
        setNotifications(result.data);
      } else {
        console.error('Error fetching notifications:', result.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  }

  async function fetchData() {
    try {
      // Fetch user profile
      if (!supabase) return;
      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('friendly_id, email, first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
      }

      setUserProfile(profile);
      const friendlyId = profile?.friendly_id || 'Generating...';
      console.log('User profile:', profile);

      // Load challenges with phase information
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const challengesResponse = await fetch(`${apiUrl}/api/challenges/user/${user.id}/phases`);
      let challenges = [];

      if (challengesResponse.ok) {
        const challengesResult = await challengesResponse.json();
        if (challengesResult.success) {
          challenges = challengesResult.data || [];
          console.log('Loaded challenges with phases:', challenges);
        }
      } else {
        // Fallback to old method if new endpoint fails
        console.warn('Phase endpoint failed, using fallback method');
        if (!supabase) return;
        const { data: rawChallenges, error: challengesError } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false });

        if (challengesError) {
          console.error('Error loading challenges:', challengesError);
        }

        // Load challenge types
        if (!supabase) return;
        const { data: challengeTypes, error: typesError } = await supabase
          .from('challenge_types')
          .select('*');

        if (typesError) {
          console.error('Error loading challenge types:', typesError);
        }

      // Map challenge type data to challenges
      challenges = rawChallenges?.map((c) => {
        const challengeType = challengeTypes?.find((ct) => ct.id === c.challenge_type_id);
        return {
          ...c,
          challenge_type: challengeType ? {
            challenge_name: challengeType.challenge_name,
            challenge_code: challengeType.challenge_code
          } : null,
          phase: c.phase || c.current_phase || 1,
          phase_1_completed: c.phase_1_completed || false,
          phase_2_completed: c.phase_2_completed || false
        };
      }) || [];
      }

      // Check for unsigned contracts on first visit
      const unsigned = challenges?.find(c => !c.contract_signed && c.trading_account_id);
      if (unsigned) {
        setUnsignedChallenge(unsigned);
        setShowContractModal(true);
      }

      // Separate challenges into different categories
      const active = challenges?.filter(c =>
        c.trading_account_id &&
        c.status !== 'pending_payment' &&
        c.status !== 'pending_credentials' &&
        c.status !== 'breached' &&
        c.status !== 'rejected'
      ).map(c => {
        // Determine the actual status
        let actualStatus = c.status;

        // If credentials exist but contract not signed, show awaiting_contract
        if (c.trading_account_id && !c.contract_signed) {
          actualStatus = 'awaiting_contract';
        }
        // If contract signed but credentials not visible, show contract_signed
        else if (c.contract_signed && !c.credentials_visible && !c.credentials_sent) {
          actualStatus = 'contract_signed';
        }
        // If credentials visible, show credentials_given or active
        else if (c.credentials_visible || c.credentials_sent) {
          actualStatus = 'credentials_given';
        }

        return {
          account_id: c.id,
          user_id: c.user_id,
          mt5_login: c.trading_account_id,
          mt5_password: c.trading_account_password || 'Not Set',
          mt5_server: c.trading_account_server || 'MetaQuotes-Demo',
          account_type: c.challenge_type?.challenge_name || c.challenge_type_id || 'Standard',
          account_size: c.account_size,
          leverage: '1:100',
          current_balance: c.account_size,
          status: actualStatus,
          created_at: c.purchase_date,
          challenge_info: c.challenge_type,
          credentials_visible: c.credentials_visible || c.credentials_sent || false,
          contract_signed: c.contract_signed || false
        };
      }) || [];

      const breached = challenges?.filter(c =>
        c.status === 'breached'
      ).map(c => ({
        account_id: c.id,
        user_id: c.user_id,
        mt5_login: c.trading_account_id,
        mt5_password: 'HIDDEN - ACCOUNT BREACHED', // Hide password for breached accounts
        mt5_server: c.trading_account_server || 'MetaQuotes-Demo',
        account_type: c.challenge_type?.challenge_name || c.challenge_type_id || 'Standard',
        account_size: c.account_size,
        leverage: '1:100',
        current_balance: c.account_size,
        status: 'breached',
        breach_reason: c.admin_note || 'Account breached due to rule violation',
        created_at: c.purchase_date,
        challenge_info: c.challenge_type,
        credentials_visible: false, // Never show credentials for breached accounts
        contract_signed: c.contract_signed || false
      })) || [];

      const awaitingCredentials = challenges?.filter(c =>
        c.status === 'pending_credentials' ||
        (!c.trading_account_id && c.status !== 'rejected')
      ).map(c => ({
        account_id: c.id,
        user_id: c.user_id,
        mt5_login: c.trading_account_id || 'Not Assigned',
        mt5_password: 'Not Available',
        mt5_server: c.trading_account_server || 'Pending',
        account_type: c.challenge_type?.challenge_name || c.challenge_type_id || 'Standard',
        account_size: c.account_size,
        leverage: '1:100',
        current_balance: c.account_size,
        status: 'awaiting_credentials',
        created_at: c.purchase_date,
        challenge_info: c.challenge_type,
        credentials_visible: false,
        contract_signed: c.contract_signed || false,
        admin_note: c.admin_note
      })) || [];

      const rejected = challenges?.filter(c =>
        c.status === 'rejected'
      ).map(c => ({
        account_id: c.id,
        user_id: c.user_id,
        mt5_login: c.trading_account_id || 'N/A',
        mt5_password: 'N/A',
        mt5_server: c.trading_account_server || 'N/A',
        account_type: c.challenge_type?.challenge_name || c.challenge_type_id || 'Standard',
        account_size: c.account_size,
        leverage: '1:100',
        current_balance: c.account_size,
        status: 'rejected',
        rejection_reason: c.admin_note || 'Account rejected by admin',
        created_at: c.purchase_date,
        challenge_info: c.challenge_type,
        credentials_visible: false,
        contract_signed: c.contract_signed || false
      })) || [];

      console.log('Active accounts:', active);
      console.log('Breached accounts:', breached);
      console.log('Awaiting credentials accounts:', awaitingCredentials);
      console.log('Rejected accounts:', rejected);

      setMt5Accounts(active);
      setBreachedAccounts(breached);
      setAwaitingCredentialsAccounts(awaitingCredentials);
      setRejectedAccounts(rejected);

      // Set first active account as selected by default
      if (active.length > 0 && !selectedAccountId) {
        setSelectedAccountId(active[0].account_id);
      }

      // Calculate real stats from active accounts
      const totalBalance = active.reduce((sum: number, acc: any) => sum + parseFloat(acc.current_balance || acc.account_size), 0);
      const totalAccountSize = active.reduce((sum: number, acc: any) => sum + parseFloat(acc.account_size), 0);
      const totalProfit = totalBalance - totalAccountSize;

      setStats({
        balance: totalBalance,
        profit: totalProfit,
        accounts: active.length,
        pending: awaitingCredentials.length + rejected.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const selectedAccount = mt5Accounts.find(acc => acc.account_id === selectedAccountId);

  const handleContractAccept = async () => {
    if (!unsignedChallenge) return;

    try {
      const contractText = generateContractText({
        fullName: user.user_metadata?.full_name || user.email || 'Trader',
        email: user.email || '',
        country: 'N/A',
        challengeType: unsignedChallenge.challenge_type?.challenge_name || 'Standard',
        accountSize: unsignedChallenge.account_size,
        purchasePrice: unsignedChallenge.amount_paid || 0,
        profitTarget: 10,
        maxDailyLoss: 5,
        maxTotalLoss: 10
      });

      // Create contract record
      if (!supabase) return;
      const { error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          challenge_id: unsignedChallenge.id,
          contract_text: contractText,
          contract_version: '1.0',
          signed_at: new Date().toISOString(),
          ip_address: 'N/A',
          user_agent: navigator.userAgent,
          full_name: user.user_metadata?.full_name || user.email || 'Trader',
          email: user.email
        });

      if (contractError) {
        console.error('Contract creation error:', contractError);
      }

      // Update user_challenges
      if (!supabase) return;
      const { error } = await supabase
        .from('user_challenges')
        .update({
          contract_signed: true,
          credentials_visible: true,
          credentials_released_at: new Date().toISOString()
        })
        .eq('id', unsignedChallenge.id);

      if (error) throw error;

      // Generate purchase certificate
      await generatePurchaseCertificate(unsignedChallenge);

      setShowContractModal(false);
      fetchData();

      // Show success message
      alert('Contract signed successfully! Your MT5 credentials are now visible.');
    } catch (error) {
      console.error('Error accepting contract:', error);
      alert('Failed to accept contract. Please try again.');
    }
  };

  const generatePurchaseCertificate = async (challenge: any) => {
    try {
      if (!supabase) return;
      const { error } = await supabase
        .from('downloads')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          document_type: 'certificate',
          title: 'Challenge Purchase Certificate',
          description: `Certificate for purchasing ${challenge.challenge_type?.challenge_name || 'Challenge'}`,
          document_number: `CERT-${Date.now()}`,
          issue_date: new Date().toISOString(),
          challenge_type: challenge.challenge_type?.challenge_name,
          account_size: challenge.account_size,
          status: 'generated',
          auto_generated: true,
          generated_at: new Date().toISOString(),
          download_count: 0
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const handleCloseNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div>
      <div className="mb-4 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            title={notification.title || 'Notification'}
            message={notification.message}
            type={notification.type || 'info'}
            onClose={() => handleCloseNotification(notification.id)}
          />
        ))}
      </div>
      {showContractModal && unsignedChallenge && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-4xl w-full border border-white/10 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <GradientText>Trading Challenge Agreement</GradientText>
                </h2>
                <p className="text-white/60 text-sm">Please read carefully and accept to activate your account</p>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Check size={24} />
              </button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-400">
                <Activity size={20} />
                <span className="font-semibold">Legal Binding Contract</span>
              </div>
              <p className="text-white/70 text-sm mt-1">
                Your MT5 credentials will be released immediately after signing this agreement
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-6 max-h-[500px] overflow-y-auto border border-white/10 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap text-white/80">
                {generateContractText({
                  fullName: user.user_metadata?.full_name || user.email || 'Trader',
                  email: user.email || '',
                  country: 'N/A',
                  challengeType: unsignedChallenge.challenge_type?.challenge_name || 'Standard',
                  accountSize: unsignedChallenge.account_size,
                  purchasePrice: unsignedChallenge.amount_paid || 0,
                  profitTarget: 10,
                  maxDailyLoss: 5,
                  maxTotalLoss: 10
                })}
              </pre>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-white">Electronic Acknowledgment</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-neon-green" />
                  </div>
                  <span className="text-white/70 text-sm">
                    I have READ and UNDERSTAND this entire Agreement
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-neon-green" />
                  </div>
                  <span className="text-white/70 text-sm">
                    I AGREE to all Terms and Conditions
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-neon-green" />
                  </div>
                  <span className="text-white/70 text-sm">
                    I am OVER 18 years of age
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-neon-green" />
                  </div>
                  <span className="text-white/70 text-sm">
                    I understand the Challenge Fee is NON-REFUNDABLE
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-neon-green" />
                  </div>
                  <span className="text-white/70 text-sm">
                    This is a LEGALLY BINDING electronic contract
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleContractAccept}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              >
                I Accept and Sign Contract
              </button>
              <button
                onClick={() => setShowContractModal(false)}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
              >
                Review Later
              </button>
            </div>

            <p className="text-center text-white/50 text-xs mt-4">
              By clicking "I Accept and Sign Contract", you electronically sign this agreement
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <GradientText>Account Overview</GradientText>
          {userProfile?.badges && userProfile.badges.length > 0 && (
            <div className="flex gap-2">
              {userProfile.badges.map((badge: string) => (
                <span
                  key={badge}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  title={badge.replace(/_/g, ' ').toUpperCase()}
                >
                  {badge === 'speed_demon_3day' && '⚡'}
                  {badge === 'fast_passer_30day' && '⭐'}
                  {badge === 'payout_starter' && '🥉'}
                  {badge === 'payout_achiever' && '🥈'}
                  {badge === 'payout_master' && '🥇'}
                  {badge === 'payout_legend' && '👑'}
                </span>
              ))}
            </div>
          )}
        </h1>
        <p className="text-white/70">Welcome back! Here's your trading performance summary</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Balance</div>
          <div className="text-3xl font-bold mb-2">${stats?.balance.toLocaleString() || '0.00'}</div>
          <div className="text-sm text-neon-green">Active Accounts: {stats?.accounts || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Profit</div>
          <div className="text-3xl font-bold mb-2">
            ${Math.abs(stats?.profit || 0).toLocaleString()}
          </div>
          <div className={`text-sm ${stats?.profit >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            {stats?.profit >= 0 ? '+' : '-'}
            {stats?.balance && stats?.balance !== stats?.profit
              ? ((Math.abs(stats?.profit || 0) / (stats?.balance - (stats?.profit || 0))) * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-neon-purple/20 to-electric-blue/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Challenge Status</div>
          <div className="text-3xl font-bold mb-2">
            {mt5Accounts.length > 0 ? 'Active' : 'Pending'}
          </div>
          <div className="text-sm text-white/60">
            {mt5Accounts.length > 0 ? 'MT5 Accounts Ready' : 'Awaiting Setup'}
          </div>
        </div>
      </div>

      {/* Removed pending challenges section - accounts are now properly categorized in tabs */}

      {mt5Accounts.length > 0 || breachedAccounts.length > 0 ? (
        <>
          {/* Sub-tabs for Account Categories */}
          <div className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveSubTab('active')}
                className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeSubTab === 'active'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white shadow-lg shadow-electric-blue/50 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">Active</span>
                {mt5Accounts.length > 0 && (
                  <span className="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-bold">
                    {mt5Accounts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('breached')}
                className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeSubTab === 'breached'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">Breached</span>
                {breachedAccounts.length > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                    {breachedAccounts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('awaiting')}
                className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeSubTab === 'awaiting'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">Awaiting</span>
                {awaitingCredentialsAccounts.length > 0 && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                    {awaitingCredentialsAccounts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('rejected')}
                className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeSubTab === 'rejected'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-600/50 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">Rejected</span>
                {rejectedAccounts.length > 0 && (
                  <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded-full text-xs font-bold">
                    {rejectedAccounts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Phase Sub-tabs for Active Accounts */}
          {activeSubTab === 'active' && mt5Accounts.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <button
                  onClick={() => setPhaseSubTab('phase1')}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    phaseSubTab === 'phase1'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">Phase 1</span>
                  {mt5Accounts.filter((acc: any) => acc.phase === 1).length > 0 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                      {mt5Accounts.filter((acc: any) => acc.phase === 1).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setPhaseSubTab('phase2')}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    phaseSubTab === 'phase2'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">Phase 2</span>
                  {mt5Accounts.filter((acc: any) => acc.phase === 2).length > 0 && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                      {mt5Accounts.filter((acc: any) => acc.phase === 2).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setPhaseSubTab('live')}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    phaseSubTab === 'live'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 scale-105'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">Live Account</span>
                  {mt5Accounts.filter((acc: any) => acc.phase === 3).length > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                      {mt5Accounts.filter((acc: any) => acc.phase === 3).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Active Accounts Tab */}
          {activeSubTab === 'active' && (
            <>
              {mt5Accounts.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">My Active Trading Accounts</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mt5Accounts.map(acc => (
                      <AccountCard
                        key={acc.account_id}
                        account={acc}
                        onClick={() => setSelectedAccountId(acc.account_id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center mb-8">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold mb-2">No Active Accounts</h3>
                  <p className="text-white/60 mb-6">
                    All your accounts are currently breached. Check the Breached Accounts tab for details.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Breached Accounts Tab */}
          {activeSubTab === 'breached' && (
            <>
              {breachedAccounts.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-red-400">⚠️ Breached Trading Accounts</h2>
                  <p className="text-white/60 mb-6">
                    These accounts have been breached due to rule violations and are no longer active.
                  </p>
                  <div className="space-y-6">
                    {breachedAccounts.map(acc => (
                      <div
                        key={acc.account_id}
                        className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-8 border border-red-500/30 hover:border-red-500/50 transition-all hover:scale-[1.02] cursor-pointer"
                        onClick={() => setSelectedAccountId(acc.account_id)}
                      >
                        {/* Header Section - Horizontal Layout */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">💀</div>
                            <div>
                              <div className="text-2xl font-bold text-red-400">DEAD</div>
                              <div className="text-sm text-red-300">Account Terminated</div>
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-lg font-semibold border border-red-500/30">
                            BREACHED
                          </div>
                        </div>

                        {/* Main Content - Horizontal Grid Layout */}
                        <div className="grid md:grid-cols-4 gap-6 mb-6">
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Account Type</div>
                            <div className="font-semibold text-white text-lg">{acc.account_type}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Account Size</div>
                            <div className="font-semibold text-white text-lg">${parseFloat(acc.account_size).toLocaleString()}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Login ID</div>
                            <div className="font-mono text-lg text-white/80">{acc.mt5_login}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Created</div>
                            <div className="text-lg text-white/70">{new Date(acc.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Breach Reason - Full Width */}
                        <div className="mb-6">
                          <div className="text-sm text-white/60 mb-2">Breach Reason</div>
                          <div className="text-sm text-red-300 bg-red-500/10 rounded-lg p-4 border border-red-500/20 leading-relaxed">
                            <strong>Maximum Drawdown Violated</strong> - <strong>Rule Breached:</strong> Max Drawdown - 5% - <strong>Breach Reason:</strong> Your account has breached the maximum drawdown limit of 5% ($150). This means your account equity fell below $2,850 at some point during the challenge. Maximum drawdown is calculated from your starting balance or the highest equity peak your account has reached. This is a hard stop rule designed to protect capital, and exceeding it results in immediate challenge failure. Please improve your risk management and position sizing before attempting again.
                          </div>
                        </div>

                        {/* Termination Notice */}
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-300 text-center">
                            <strong>Account Terminated:</strong> This account has been permanently closed due to rule violations.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">No Breached Accounts</h3>
                  <p className="text-white/60 mb-6">
                    Great! All your accounts are active and in good standing.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Awaiting Credentials Tab */}
          {activeSubTab === 'awaiting' && (
            <>
              {awaitingCredentialsAccounts.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-400">⏳ Awaiting Credentials</h2>
                  <p className="text-white/60 mb-6">
                    These accounts are waiting for MT5 credentials to be assigned by our admin team.
                  </p>
                  <div className="space-y-6">
                    {awaitingCredentialsAccounts.map(acc => (
                      <div
                        key={acc.account_id}
                        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-8 border border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        {/* Header Section - Horizontal Layout */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">⏳</div>
                            <div>
                              <div className="text-2xl font-bold text-yellow-400">WAITING</div>
                              <div className="text-sm text-yellow-300">Credentials Pending</div>
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-lg font-semibold border border-yellow-500/30">
                            AWAITING CREDENTIALS
                          </div>
                        </div>

                        {/* Main Content - Horizontal Grid Layout */}
                        <div className="grid md:grid-cols-4 gap-6 mb-6">
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Account Type</div>
                            <div className="font-semibold text-white text-lg">{acc.account_type}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Account Size</div>
                            <div className="font-semibold text-white text-lg">${parseFloat(acc.account_size).toLocaleString()}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Login ID</div>
                            <div className="font-mono text-lg text-white/80">{acc.mt5_login}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Created</div>
                            <div className="text-lg text-white/70">{new Date(acc.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Status Information */}
                        <div className="mb-6">
                          <div className="text-sm text-white/60 mb-2">Status Information</div>
                          <div className="text-sm text-yellow-300 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 leading-relaxed">
                            Your account has been purchased and is waiting for MT5 credentials to be assigned. Our admin team will set up your trading account within 24-48 hours. You will receive an email notification once your credentials are ready.
                          </div>
                        </div>

                        {/* Next Steps */}
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm text-yellow-300 text-center">
                            <strong>Next Steps:</strong> Please wait for admin to assign your MT5 credentials. Check back soon!
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">No Accounts Awaiting Credentials</h3>
                  <p className="text-white/60 mb-6">
                    All your accounts have been assigned credentials or are in other statuses.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Rejected Accounts Tab */}
          {activeSubTab === 'rejected' && (
            <>
              {rejectedAccounts.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-red-500">❌ Rejected Accounts</h2>
                  <p className="text-white/60 mb-6">
                    These accounts have been rejected by our admin team. Please review the rejection reason and contact support if needed.
                  </p>
                  <div className="space-y-6">
                    {rejectedAccounts.map(acc => (
                      <div
                        key={acc.account_id}
                        className="bg-gradient-to-br from-red-600/10 to-pink-600/10 rounded-xl p-8 border border-red-600/30 hover:border-red-600/50 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        {/* Header Section - Horizontal Layout */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">❌</div>
                            <div>
                              <div className="text-2xl font-bold text-red-500">REJECTED</div>
                              <div className="text-sm text-red-400">Account Not Approved</div>
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-red-600/20 text-red-500 rounded-lg text-lg font-semibold border border-red-600/30">
                            REJECTED
                          </div>
                        </div>

                        {/* Main Content - Horizontal Grid Layout */}
                        <div className="grid md:grid-cols-4 gap-6 mb-6">
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Account Type</div>
                            <div className="font-semibold text-white text-lg">{acc.account_type}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Account Size</div>
                            <div className="font-semibold text-white text-lg">${parseFloat(acc.account_size).toLocaleString()}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Login ID</div>
                            <div className="font-mono text-lg text-white/80">{acc.mt5_login}</div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1">Created</div>
                            <div className="text-lg text-white/70">{new Date(acc.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Rejection Reason - Full Width */}
                        <div className="mb-6">
                          <div className="text-sm text-white/60 mb-2">Rejection Reason</div>
                          <div className="text-sm text-red-400 bg-red-600/10 rounded-lg p-4 border border-red-600/20 leading-relaxed">
                            {acc.rejection_reason || 'Your account application has been rejected by our admin team. Please contact support for more details or to understand the rejection reason.'}
                          </div>
                        </div>

                        {/* Contact Support */}
                        <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                          <p className="text-sm text-red-400 text-center">
                            <strong>Contact Support:</strong> Please reach out to our support team to discuss this rejection or submit a new application.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">No Rejected Accounts</h3>
                  <p className="text-white/60 mb-6">
                    Great! None of your accounts have been rejected.
                  </p>
                </div>
              )}
            </>
          )}

          {selectedAccount && selectedAccount.status && (
            <div className="mb-6">
              <AccountStatusBadge status={selectedAccount.status} size="lg" />
            </div>
          )}

          {selectedAccount && selectedAccount.status === 'awaiting_contract' && (
            <ContractAcceptance
              accountId={selectedAccount.account_id}
              accountSize={parseFloat(selectedAccount.account_size)}
              accountType={selectedAccount.account_type}
              onAccepted={() => fetchData()}
            />
          )}

          {selectedAccount && selectedAccount.status === 'contract_signed' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8 mb-6 text-center">
              <Clock size={64} className="mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">Contract Accepted!</h3>
              <p className="text-white/70 mb-4">
                Your contract has been signed. Our admin team is preparing your MT5 credentials.
              </p>
              <p className="text-sm text-white/50">
                You will receive your login details within 24 hours. Check back soon!
              </p>
            </div>
          )}

          {selectedAccount && (selectedAccount.status === 'credentials_given' || selectedAccount.status === 'active') && selectedAccount.mt5_login && !selectedAccount.credentials_visible && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 mb-6 text-center">
              <Clock size={64} className="mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-2">Credentials Pending Release</h3>
              <p className="text-white/70 mb-4">
                Your MT5 credentials have been assigned but not yet released by admin.
              </p>
              <p className="text-sm text-white/50">
                Please sign your contract or wait for admin to release your credentials.
              </p>
            </div>
          )}

          {selectedAccount && (selectedAccount.status === 'credentials_given' || selectedAccount.status === 'active') && selectedAccount.mt5_login && selectedAccount.credentials_visible && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">MT5 Account Credentials</h3>
                  <p className="text-white/60 text-sm mt-1">Use these credentials to login to MetaTrader 5</p>
                </div>
                <a
                  href="https://www.metatrader5.com/en/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Download size={16} />
                  Download MT5
                </a>
              </div>

              <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300">
                  <span className="font-semibold">Note:</span> our own server is currently under progress with MT5, for now use this server
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/70">Account Type</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono">
                    {selectedAccount.account_type.toUpperCase()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/70">Account Size</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono">
                    ${parseFloat(selectedAccount.account_size).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/70">Login ID</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono">
                      {selectedAccount.mt5_login}
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedAccount.mt5_login, 'login')}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                    >
                      {copied === 'login' ? <Check size={20} className="text-neon-green" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/70">Password</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono">
                      {showPassword ? selectedAccount.mt5_password : '••••••••'}
                    </div>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedAccount.mt5_password, 'password')}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                    >
                      {copied === 'password' ? <Check size={20} className="text-neon-green" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/70">Server</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono">
                      {selectedAccount.mt5_server}
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedAccount.mt5_server, 'server')}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                    >
                      {copied === 'server' ? <Check size={20} className="text-neon-green" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/70">Leverage</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono">
                    1:{selectedAccount.leverage}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-electric-blue/10 border border-electric-blue/30 rounded-lg">
                <p className="text-sm text-white/80">
                  <strong>Important:</strong> Keep your credentials secure. Download MT5, use the server address, login ID, and password above to access your trading account.
                </p>
              </div>
            </div>
          )}

          {/* Removed "All Your MT5 Accounts" section - accounts are now properly categorized in tabs only */}
        </>
      ) : (
        <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold mb-2">No MT5 Accounts Yet</h3>
          <p className="text-white/60 mb-6">
            Your MT5 account will be created after purchasing a challenge. Contact support if you need assistance.
          </p>
          <button
            onClick={() => navigate('/challenge-types')}
            className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            Purchase Challenge
          </button>
        </div>
      )}

      <div className="mt-8 bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 border border-electric-blue/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-purple rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">Help Us Improve</h3>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                beta
              </span>
            </div>
            <p className="text-sm text-white/70 mb-4">
              Fund8r is currently in beta. Your feedback is invaluable in helping us create the best trading experience.
              Share your thoughts, report issues, or suggest improvements.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold text-sm hover:scale-105 transition-transform"
            >
              Share Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({ user }: { user: any }) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [allTrades, setAllTrades] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'ALL'>('ALL');
  const [activeView, setActiveView] = useState<'overview' | 'trades' | 'positions'>('overview');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchRealTimeData();
      const interval = setInterval(fetchRealTimeData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedAccountId]);

  async function fetchAccounts() {
    try {
      if (!supabase) return;
      const { data: challenges } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .not('trading_account_id', 'is', null)
        .eq('credentials_sent', true);

      const accounts = challenges?.map(c => ({
        id: c.id,
        login: c.trading_account_id,
        accountSize: c.account_size,
        accountType: c.challenge_type_id
      })) || [];

      setMt5Accounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }

  async function fetchRealTimeData() {
    if (!selectedAccountId) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Fetch real-time data
      const [dataRes, tradesRes, positionsRes] = await Promise.all([
        fetch(`${apiUrl}/api/analytics/mt5-data/${user.id}`),
        fetch(`${apiUrl}/api/analytics/all-trades/${user.id}`),
        fetch(`${apiUrl}/api/analytics/positions/${user.id}`)
      ]);

      if (dataRes.ok) {
        const result = await dataRes.json();
        if (result.success && result.data) {
          setRealTimeData({
            ...result.data,
            isLiveData: true
          });
        }
      }

      if (tradesRes.ok) {
        const tradesResult = await tradesRes.json();
        if (tradesResult.success) {
          setAllTrades(tradesResult.data || []);
        }
      }

      if (positionsRes.ok) {
        const positionsResult = await positionsRes.json();
        if (positionsResult.success) {
          setPositions(positionsResult.data || []);
        }
      }
    } catch (error) {
      console.warn('Analytics not available:', error);
      setRealTimeData(null);
    } finally {
      setLoading(false);
    }
  }

  const selectedAccount = mt5Accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="relative min-h-screen">
      {/* Animated 3D Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-deep-space via-deep-space/95 to-deep-space"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with 3D effect */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-neon-purple to-neon-green animate-gradient">
                Trading Analytics
              </h1>
              <p className="text-white/60 text-lg">Real-time performance metrics powered by MetaAPI</p>
            </div>
            {realTimeData && (
              <div className="flex flex-col items-end space-y-3">
                <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl backdrop-blur-xl border-2 ${
                  realTimeData.isLiveData ? 
                  'bg-neon-green/10 border-neon-green/30 shadow-lg shadow-neon-green/20' : 
                  'bg-yellow-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/20'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    realTimeData.isLiveData ? 'bg-neon-green animate-pulse' : 'bg-yellow-500'
                  }`}></div>
                  <span className="font-semibold">{realTimeData.isLiveData ? '🟢 Live Data' : '🟡 Static Data'}</span>
                </div>
                <div className="text-sm text-white/50">
                  Last update: {new Date(realTimeData.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* View Switcher with 3D tabs */}
          <div className="flex space-x-2 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            {[
              { id: 'overview', label: '📊 Overview', icon: BarChart3 },
              { id: 'trades', label: '💹 All Trades', icon: TrendingUp, badge: allTrades.length },
              { id: 'positions', label: '🎯 Open Positions', icon: Target, badge: positions.length }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white shadow-lg shadow-electric-blue/50 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{view.label.split(' ')[0]}</span>
                <span>{view.label.split(' ').slice(1).join(' ')}</span>
                {view.badge !== undefined && (
                  <span className="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-bold">
                    {view.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {mt5Accounts.length === 0 ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
          <BarChart3 size={64} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-2xl font-bold mb-2">No Active Accounts</h3>
          <p className="text-white/70">Purchase a challenge to start tracking your trading analytics</p>
        </div>
      ) : (
        <>
          {mt5Accounts.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Select Account</label>
              <select
                value={selectedAccountId || ''}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              >
                {mt5Accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-deep-space">
                    MT5 #{acc.login} - ${parseFloat(acc.accountSize).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading && !realTimeData ? (
            <div className="text-center py-12">
              <Activity size={48} className="animate-spin mx-auto mb-4 text-electric-blue" />
              <p className="text-white/70">Loading analytics data...</p>
            </div>
          ) : realTimeData ? (
            <>
              {/* Overview Section */}
              {activeView === 'overview' && (
                <div className="space-y-6">
                  {/* 3D Stat Cards */}
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* Balance Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-neon-purple rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 hover:border-electric-blue/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-electric-blue/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-electric-blue/20 rounded-xl">
                            <DollarSign className="text-electric-blue" size={24} />
                          </div>
                          <div className="text-xs px-3 py-1 bg-white/10 rounded-full">Initial</div>
                        </div>
                        <div className="text-sm text-white/60 mb-2">Account Balance</div>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-white">
                          ${parseFloat(realTimeData.balance).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Equity Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-green to-electric-blue rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-neon-green/10 to-electric-blue/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 hover:border-neon-green/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-neon-green/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-neon-green/20 rounded-xl">
                            <TrendingUp className="text-neon-green" size={24} />
                          </div>
                          <div className={`text-xs px-3 py-1 rounded-full ${
                            parseFloat(realTimeData.profitPercentage) >= 0 ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {realTimeData.profitPercentage}%
                          </div>
                        </div>
                        <div className="text-sm text-white/60 mb-2">Current Equity</div>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-green to-white">
                          ${parseFloat(realTimeData.equity).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* P&L Card */}
                    <div className="group relative">
                      <div className={`absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${
                        parseFloat(realTimeData.profit) >= 0 ? 'bg-gradient-to-r from-neon-green to-electric-blue' : 'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}></div>
                      <div className={`relative backdrop-blur-2xl rounded-2xl p-6 border border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${
                        parseFloat(realTimeData.profit) >= 0 
                          ? 'bg-gradient-to-br from-neon-green/10 to-electric-blue/10 hover:border-neon-green/50 hover:shadow-neon-green/30' 
                          : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 hover:border-red-500/50 hover:shadow-red-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${
                            parseFloat(realTimeData.profit) >= 0 ? 'bg-neon-green/20' : 'bg-red-500/20'
                          }`}>
                            <Activity className={parseFloat(realTimeData.profit) >= 0 ? 'text-neon-green' : 'text-red-400'} size={24} />
                          </div>
                          <div className="text-xs px-3 py-1 bg-white/10 rounded-full">
                            {parseFloat(realTimeData.profit) >= 0 ? 'Profit' : 'Loss'}
                          </div>
                        </div>
                        <div className="text-sm text-white/60 mb-2">Total P&L</div>
                        <div className={`text-4xl font-bold ${
                          parseFloat(realTimeData.profit) >= 0 ? 'text-neon-green' : 'text-red-400'
                        }`}>
                          {parseFloat(realTimeData.profit) >= 0 ? '+' : '-'}${Math.abs(parseFloat(realTimeData.profit)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Open Trades Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-neon-purple rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-orange-500/10 to-neon-purple/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 hover:border-orange-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-orange-500/20 rounded-xl">
                            <Target className="text-orange-500" size={24} />
                          </div>
                          <div className="text-xs px-3 py-1 bg-white/10 rounded-full">Active</div>
                        </div>
                        <div className="text-sm text-white/60 mb-2 group-hover:text-white/80 transition-colors">Open Positions</div>
                        <div className="text-3xl font-bold mb-2">{realTimeData.openTrades}</div>
                        <div className="text-xs text-white/50">Active Trades</div>
                      </div>
                    </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Activity className="mr-2 text-electric-blue" size={20} />
                    Account Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/70">Margin Used</span>
                      <span className="font-bold">${parseFloat(realTimeData.margin).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/70">Free Margin</span>
                      <span className="font-bold text-neon-green">${parseFloat(realTimeData.freeMargin).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/70">Margin Level</span>
                      <span className="font-bold">{realTimeData.marginLevel}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Max Drawdown</span>
                      <span className="font-bold text-red-400">{realTimeData.maxDrawdown}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-neon-green" size={20} />
                    Performance Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/70">Total Trades</span>
                      <span className="font-bold">{realTimeData.totalTrades}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/70">Win Rate</span>
                      <span className="font-bold text-neon-green">{realTimeData.winRate}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/70">Profit Factor</span>
                      <span className="font-bold">{realTimeData.profitFactor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Sharpe Ratio</span>
                      <span className="font-bold text-electric-blue">{realTimeData.sharpeRatio}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-xl font-bold mb-4">Trade Statistics</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-white/60 mb-2">Average Win</div>
                    <div className="text-2xl font-bold text-neon-green">${parseFloat(realTimeData.averageWin).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-2">Average Loss</div>
                    <div className="text-2xl font-bold text-red-400">${parseFloat(realTimeData.averageLoss).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-2">Risk/Reward Ratio</div>
                    <div className="text-2xl font-bold text-electric-blue">
                      {(parseFloat(realTimeData.averageWin) / parseFloat(realTimeData.averageLoss)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border ${realTimeData?.isLiveData === false ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' : 'bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 border-electric-blue/30'}`}>
                <div className="flex items-start space-x-4">
                  <Activity className={`mt-1 ${realTimeData?.isLiveData === false ? 'text-yellow-500' : 'text-electric-blue'}`} size={24} />
                  <div>
                    <h4 className="font-bold text-lg mb-2">
                      {realTimeData?.isLiveData === false ? 'Account Information' : 'Real-Time Data Integration'}
                    </h4>
                    <p className="text-white/70 text-sm">
                      {realTimeData?.isLiveData === false
                        ? 'Currently displaying simulated trading data. Once your MT5 credentials are activated, this will show real-time trading metrics from MetaTrader 5.'
                        : 'This analytics dashboard displays real-time data from your MT5 trading account via Supabase Edge Function. Data is refreshed every 5 seconds to provide you with up-to-the-minute trading insights.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </>
      ) : (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center backdrop-blur-sm">
          <Activity size={64} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-2xl font-bold mb-2">Unable to Load Real-Time Data</h3>
              <p className="text-white/70 mb-4">Failed to fetch MT5 data. Please ensure:</p>
              <ul className="text-left max-w-md mx-auto text-white/60 space-y-2">
                <li>• MT5 account credentials have been assigned by admin</li>
                <li>• Your account is active and properly configured</li>
                <li>• You have a stable internet connection</li>
            </ul>
          <button
            onClick={fetchRealTimeData}
            className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform"
          >
              Retry Connection
            </button>
          </div>
        )}
        </>
      )}
      </div>
    </div>
  );
}

function PayoutsSection({ user }: { user: any }) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Payouts</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Manage your withdrawal requests and payout history</p>

      <div className="bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-xl p-8 mb-8 border border-white/10">
        <div className="text-sm text-white/60 mb-2">Available for Withdrawal</div>
        <div className="text-4xl font-bold text-neon-green mb-6">$0.00</div>
        <button className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform">
          Request Withdrawal
        </button>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">Payout History</h3>
        <div className="text-center py-8 text-white/60">
          <p>No payout history yet</p>
        </div>
      </div>
    </div>
  );
}

function CertificatesSection({ user }: { user: any }) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Certificates</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Your achievements and certifications</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Funded Trader Certificate</h3>
          <p className="text-white/60 text-sm mb-4">Available after funding</p>
          <button className="px-6 py-2 bg-white/10 rounded-lg text-sm opacity-50 cursor-not-allowed">
            Not Available
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-bold mb-2">Challenge Completion</h3>
          <p className="text-white/60 text-sm mb-4">Complete challenge to unlock</p>
          <button className="px-6 py-2 bg-white/10 rounded-lg text-sm opacity-50 cursor-not-allowed">
            Not Available
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractsSection({ user }: { user: any }) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    try {
      if (!supabase) return;
      const { data: challenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('contract_signed', true)
        .order('purchase_date', { ascending: false });

      if (challengesError) throw challengesError;

      // Get challenge types separately
      if (!supabase) return;
      const { data: challengeTypes, error: typesError } = await supabase
        .from('challenge_types')
        .select('*');

      if (typesError) throw typesError;

      const typesMap = new Map(challengeTypes?.map((t: any) => [t.id, t]) || []);

      // Merge challenge type data
      const enrichedContracts = challenges?.map(challenge => {
        const challengeType = typesMap.get(challenge.challenge_type_id);
        return {
          ...challenge,
          challenge_type: {
            challenge_name: challengeType?.challenge_name || 'Unknown Challenge'
          }
        };
      }) || [];

      setContracts(enrichedContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Contracts & Agreements</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Your signed contracts and legal agreements</p>

      {loading ? (
        <div className="text-center py-12 text-white/60">Loading contracts...</div>
      ) : contracts.length > 0 ? (
        <div className="space-y-6">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {contract.challenge_type?.challenge_name || 'Trading Challenge'} Agreement
                  </h3>
                  <p className="text-white/60 text-sm">
                    Account Size: ${parseFloat(contract.account_size).toLocaleString()}
                  </p>
                  <p className="text-white/60 text-sm">
                    Signed: {contract.contract_signed_at ? new Date(contract.contract_signed_at).toLocaleString() : new Date(contract.purchase_date).toLocaleString()}
                  </p>
                  <p className="text-white/50 text-xs mt-1">Challenge ID: {contract.id.slice(0, 8)}...</p>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold bg-neon-green/20 text-neon-green`}>
                  Signed
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-1">Full Name</div>
                  <div className="font-semibold">{contract.full_name}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-1">Email</div>
                  <div className="font-semibold">{contract.email}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-1">Signed From IP</div>
                  <div className="font-mono text-sm">{contract.signature_ip_address}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-1">Electronic Signature</div>
                  <div className="font-semibold italic">{contract.electronic_signature}</div>
                </div>
              </div>

              {contract.pdf_url && (
                <button className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                  <Download size={16} />
                  Download Contract PDF
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
          <FileText size={64} className="mx-auto mb-4 text-white/30" />
          <h3 className="text-2xl font-bold mb-2">No Contracts Yet</h3>
          <p className="text-white/60">You haven't signed any contracts yet. Complete a challenge purchase to sign your first contract.</p>
        </div>
      )}
    </div>
  );
}

function CompetitionsSection({ user }: { user: any }) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Competitions</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Join trading competitions and win prizes</p>

      <div className="text-center py-12 text-white/60">
        <Trophy size={64} className="mx-auto mb-4 opacity-50" />
        <p>No active competitions at this time</p>
        <p className="text-sm mt-2">Check back soon for upcoming trading competitions!</p>
      </div>
    </div>
  );
}

function LeaderboardSection({ user }: { user: any }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.rpc('get_leaderboard');

      if (error) {
        console.warn('Leaderboard not available:', error.message);
        setLeaderboard([]);
        setLoading(false);
        return;
      }
      setLeaderboard(data || []);
    } catch (error) {
      console.warn('Leaderboard feature not available');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Leaderboard</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Top performing traders this month</p>

      {loading ? (
        <div className="text-center py-12 text-white/60">Loading...</div>
      ) : leaderboard.length > 0 ? (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-electric-blue to-neon-purple">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Trader</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Profit</th>
                <th className="px-6 py-4 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((trader, index) => (
                <tr
                  key={trader.user_id}
                  className={`border-t border-white/10 ${
                    trader.user_id === user.id ? 'bg-neon-green/10' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0
                          ? 'bg-yellow-500 text-black'
                          : index === 1
                          ? 'bg-gray-300 text-black'
                          : index === 2
                          ? 'bg-orange-600 text-white'
                          : 'bg-white/10'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">
                      {trader.user_id === user.id ? 'You' : trader.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    ${parseFloat(trader.total_balance).toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-bold ${
                      parseFloat(trader.total_profit) >= 0 ? 'text-neon-green' : 'text-red-400'
                    }`}
                  >
                    {parseFloat(trader.total_profit) >= 0 ? '+' : ''}$
                    {parseFloat(trader.total_profit).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-electric-blue">
                    {trader.roi}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-white/60">
          <p>No leaderboard data available yet</p>
        </div>
      )}
    </div>
  );
}

function BillingSection({ user, navigate }: { user: any; navigate: (path: string) => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'payout' | 'refund'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  async function fetchTransactions() {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const totals = transactions.reduce((acc, txn) => {
    if (txn.status === 'completed') {
      acc.spent += parseFloat(txn.amount) || 0;
    }
    return acc;
  }, { spent: 0, earned: 0 });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Billing & Transactions</GradientText>
      </h1>
      <p className="text-white/70 mb-8">View your complete payment history and invoices</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Spent</div>
          <div className="text-3xl font-bold mb-2">${totals.spent.toLocaleString()}</div>
          <div className="text-sm text-white/60">Challenge Purchases</div>
        </div>

        <div className="bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Earned</div>
          <div className="text-3xl font-bold text-neon-green mb-2">${totals.earned.toLocaleString()}</div>
          <div className="text-sm text-white/60">Payouts Received</div>
        </div>

        <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Transactions</div>
          <div className="text-3xl font-bold mb-2">{transactions.length}</div>
          <div className="text-sm text-white/60">All Time</div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {['all', 'purchase', 'payout', 'refund'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-electric-blue to-neon-purple'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/60">Loading transactions...</div>
      ) : transactions.length > 0 ? (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-electric-blue to-neon-purple">
                <tr>
                  <th className="px-6 py-4 text-left">Transaction ID</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-6 py-4 font-mono text-sm text-electric-blue">
                      {txn.transaction_id || txn.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold bg-neon-purple/20 text-neon-purple`}>
                        Purchase
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {txn.notes || 'Challenge Purchase'}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-lg text-white`}>
                      ${parseFloat(txn.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        txn.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
                        txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {txn.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {new Date(txn.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
          <CreditCard size={64} className="mx-auto mb-4 text-white/30" />
          <h3 className="text-2xl font-bold mb-2">No Transactions Yet</h3>
          <p className="text-white/60">Your transaction history will appear here once you make a purchase.</p>
        </div>
      )}
    </div>
  );
}

function AffiliatesSection({ user }: { user: any }) {
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
      fetchPayoutHistory();
    }
  }, [user]);

  async function fetchAffiliateData() {
    try {
      console.log('Fetching affiliate data for user:', user);
      console.log('User ID:', user?.id);
      console.log('API URL:', import.meta.env.VITE_API_URL);

      if (!user?.id) {
        console.error('No user ID available');
        setLoading(false);
        return;
      }

      // First, create affiliate account if doesn't exist
      console.log('Creating affiliate account...');
      const createRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/affiliates/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      console.log('Create response status:', createRes.status);
      const createData = await createRes.json();
      console.log('Create response data:', createData);

      // Then fetch stats
      console.log('Fetching affiliate stats...');
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/affiliates/stats/${user.id}`);
      console.log('Stats response status:', statsRes.status);
      const statsData = await statsRes.json();
      console.log('Stats response data:', statsData);

      if (statsData.success) {
        console.log('Setting affiliate data:', statsData.data);
        setAffiliateData(statsData.data);
      } else {
        console.error('Stats request failed:', statsData);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPayoutHistory() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/affiliates/payouts/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setPayoutHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  }

  async function handleCopyLink() {
    const referralLink = `${window.location.origin}?ref=${affiliateData?.affiliate_code}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRequestPayout() {
    if (!payoutAmount || parseFloat(payoutAmount) < 100) {
      alert('Minimum payout amount is $100');
      return;
    }

    setPayoutLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/affiliates/request-payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: parseFloat(payoutAmount)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Payout request submitted successfully!');
        setPayoutAmount('');
        fetchAffiliateData();
        fetchPayoutHistory();
      } else {
        alert(data.error || 'Failed to request payout');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-electric-blue/20 border-t-electric-blue rounded-full animate-spin mx-auto"></div>
        <p className="text-white/60 mt-4">Loading affiliate data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Affiliate Program</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Earn 10% commission by referring new traders</p>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Referrals</div>
          <div className="text-3xl font-bold text-neon-green">{affiliateData?.total_referrals || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Active Referrals</div>
          <div className="text-3xl font-bold text-electric-blue">{affiliateData?.active_referrals || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-neon-purple/20 to-cyber-purple/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Total Earnings</div>
          <div className="text-3xl font-bold text-neon-purple">${(affiliateData?.total_earnings || 0).toFixed(2)}</div>
        </div>

        <div className="bg-gradient-to-br from-cyber-purple/20 to-neon-green/20 rounded-xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Available Balance</div>
          <div className="text-3xl font-bold text-cyber-purple">${(affiliateData?.available_balance || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Referral Code */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border-2 border-yellow-500/30">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="text-yellow-400">⭐</span> Your Referral Code
          </h3>
          <div className="bg-black/30 rounded-lg p-4 mb-3">
            <div className="text-3xl font-mono font-bold text-yellow-400 text-center tracking-wider">
              {affiliateData?.affiliate_code || 'LOADING'}
            </div>
          </div>
          <p className="text-sm text-white/70">
            Share this code! Users can enter it during payment to give you credit.
          </p>
        </div>

        {/* Referral Link */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold mb-2">Your Referral Link</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={`${window.location.origin}?ref=${affiliateData?.affiliate_code || 'LOADING'}`}
              readOnly
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-white/70">
            Share this link to automatically apply your code.
          </p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
        <p className="text-white text-sm">
          <span className="font-bold text-blue-400">How it works:</span> Your referrals can either click your link OR enter your code <span className="font-mono font-bold text-yellow-400">{affiliateData?.affiliate_code || 'CODE'}</span> during checkout. You'll earn 10% commission either way!
        </p>
      </div>

      {/* Request Payout */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
        <h3 className="text-xl font-bold mb-4">Request Payout</h3>
        <div className="flex gap-4">
          <input
            type="number"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="Enter amount (min $100)"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
          />
          <button
            onClick={handleRequestPayout}
            disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) < 100}
            className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {payoutLoading ? 'Processing...' : 'Request Payout'}
          </button>
        </div>
        <p className="text-sm text-white/60 mt-4">
          Available balance: ${(affiliateData?.available_balance || 0).toFixed(2)} • Minimum payout: $100
        </p>
      </div>

      {/* Payout History */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">Payout History</h3>
        {payoutHistory.length > 0 ? (
          <div className="space-y-4">
            {payoutHistory.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="font-semibold">${payout.amount.toFixed(2)}</div>
                  <div className="text-sm text-white/60">
                    {new Date(payout.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  payout.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
                  payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  payout.status === 'processing' ? 'bg-electric-blue/20 text-electric-blue' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <p>No payout history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarSection() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Economic Calendar</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Important economic events and announcements</p>

      <div className="text-center py-12 text-white/60">
        <Calendar size={64} className="mx-auto mb-4 opacity-50" />
        <p>Economic calendar integration coming soon!</p>
      </div>
    </div>
  );
}

function DownloadsSection() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDownloads();
  }, [filter]);

  async function fetchDownloads() {
    try {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!supabase) return;
      let query = supabase
        .from('downloads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('document_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(doc: any) {
    try {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const certificateHTML = generateCertificateHTML(doc, user);
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.document_type}_${doc.document_number || Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (!supabase) return;
      await supabase
        .from('downloads')
        .update({ download_count: (doc.download_count || 0) + 1 })
        .eq('id', doc.id);

      fetchDownloads();
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download document');
    }
  }

  const documentTypes = [
    { value: 'all', label: 'All Documents' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'contract', label: 'Contracts' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'receipt', label: 'Receipts' },
  ];

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'certificate': return '🏆';
      case 'contract': return '📜';
      case 'invoice': return '🧾';
      case 'receipt': return '💰';
      default: return '📄';
    }
  };

  async function generateTestCertificate() {
    try {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No user logged in');
        return;
      }

      console.log('🎫 Generating test certificate for user:', user.id);
      
      // Use backend API to bypass RLS issues
      console.log('🚀 Using backend API to generate certificate...');
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('📡 API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/certificates/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response content-type:', response.headers.get('content-type'));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response received:', textResponse.substring(0, 200));
        throw new Error(
          `Backend returned HTML instead of JSON. This usually means:\n` +
          `1. Backend server is not running\n` +
          `2. Wrong API URL (current: ${API_URL})\n` +
          `3. Backend route not found\n` +
          `4. Backend crashed or returned an error page`
        );
      }

      const result = await response.json();
      console.log('📡 Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || result.message || `Server error: ${response.status}`);
      }
      
      if (result.success) {
        console.log('✅ Certificate created successfully:', result.data);
        alert('✅ Test certificate generated successfully!');
        fetchDownloads();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Error generating test certificate:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please check if the backend is running.';
      }
      
      alert(`Failed to generate certificate:\n\n${errorMessage}`);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-bold">
          <GradientText>Downloads & Certificates</GradientText>
        </h1>
        <button
          onClick={generateTestCertificate}
          className="px-4 py-2 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform text-sm flex items-center gap-2"
        >
          <Award size={16} />
          Generate Test Certificate
        </button>
      </div>
      <p className="text-white/70 mb-8">Your certificates, receipts, and important documents</p>

      <div className="mb-6 flex gap-2 flex-wrap">
        {documentTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filter === type.value
                ? 'bg-gradient-to-r from-electric-blue to-neon-purple'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/60">Loading documents...</div>
      ) : downloads.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((doc) => (
            <div
              key={doc.id}
              className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10 hover:border-electric-blue/50 transition-all hover:scale-105"
            >
              <div className="text-6xl mb-4 text-center">{getDocumentIcon(doc.document_type)}</div>
              <h3 className="text-xl font-bold mb-2 text-center">{doc.title || 'Document'}</h3>
              <p className="text-white/60 text-sm mb-4 text-center">
                {doc.description || doc.document_type}
              </p>

              {doc.document_number && (
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="text-xs text-white/60">Document Number</div>
                  <div className="font-mono text-sm">{doc.document_number}</div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Issue Date</span>
                  <span>{new Date(doc.issue_date || doc.created_at).toLocaleDateString()}</span>
                </div>
                {doc.download_count > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Downloads</span>
                    <span>{doc.download_count}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
            <Award size={64} className="mx-auto mb-4 text-white/30" />
            <h3 className="text-2xl font-bold mb-2">No Documents Yet</h3>
            <p className="text-white/60 mb-6">
              Your certificates and documents will appear here once generated.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Download Trading Platforms</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <div className="text-6xl mb-4">💻</div>
                <h3 className="text-xl font-bold mb-2">MetaTrader 5</h3>
                <p className="text-white/60 text-sm mb-4">Windows Desktop</p>
                <a
                  href="https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Download
                </a>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-2">MT5 Mobile</h3>
                <p className="text-white/60 text-sm mb-4">iOS & Android</p>
                <a
                  href="https://www.metatrader5.com/en/mobile-trading"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Get App
                </a>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Trading Guide</h3>
                <p className="text-white/60 text-sm mb-4">PDF Documentation</p>
                <button className="px-6 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateCertificateHTML(doc: any, user: any) {
  const issueDate = new Date(doc.issue_date || doc.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title || 'Fund8r Certificate'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @keyframes glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    body {
      font-family: 'Rajdhani', sans-serif;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f0a1e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(123, 46, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(0, 102, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .certificate {
      background: linear-gradient(135deg, #0d1129 0%, #1a1f3a 50%, #0f0a1e 100%);
      max-width: 1200px;
      width: 100%;
      padding: 0;
      border: 3px solid;
      border-image: linear-gradient(135deg, #7B2EFF, #0066FF, #7B2EFF) 1;
      box-shadow: 
        0 0 60px rgba(123, 46, 255, 0.4),
        0 0 120px rgba(0, 102, 255, 0.2),
        inset 0 0 60px rgba(123, 46, 255, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(123, 46, 255, 0.03) 2px,
          rgba(123, 46, 255, 0.03) 4px
        );
      pointer-events: none;
    }
    
    .certificate::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
      animation: scanline 8s linear infinite;
      pointer-events: none;
    }
    
    .cert-inner {
      padding: 60px;
      position: relative;
      z-index: 1;
    }
    
    .corner-decoration {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 2px solid;
    }
    
    .corner-decoration.top-left {
      top: 20px;
      left: 20px;
      border-right: none;
      border-bottom: none;
      border-image: linear-gradient(135deg, #7B2EFF, transparent) 1;
    }
    
    .corner-decoration.top-right {
      top: 20px;
      right: 20px;
      border-left: none;
      border-bottom: none;
      border-image: linear-gradient(225deg, #0066FF, transparent) 1;
    }
    
    .corner-decoration.bottom-left {
      bottom: 20px;
      left: 20px;
      border-right: none;
      border-top: none;
      border-image: linear-gradient(45deg, #7B2EFF, transparent) 1;
    }
    
    .corner-decoration.bottom-right {
      bottom: 20px;
      right: 20px;
      border-left: none;
      border-top: none;
      border-image: linear-gradient(315deg, #0066FF, transparent) 1;
    }
    
    .header {
      text-align: center;
      margin-bottom: 50px;
      position: relative;
    }
    
    .logo {
      font-family: 'Orbitron', sans-serif;
      font-size: 64px;
      font-weight: 900;
      background: linear-gradient(135deg, #7B2EFF 0%, #0066FF 50%, #7B2EFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-transform: uppercase;
      letter-spacing: 8px;
      margin-bottom: 10px;
      text-shadow: 0 0 30px rgba(123, 46, 255, 0.5);
      animation: glow 3s ease-in-out infinite;
    }
    
    .subtitle {
      color: #8B9DC3;
      font-size: 16px;
      font-weight: 300;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #7B2EFF, #0066FF, #7B2EFF, transparent);
      margin: 30px 0;
      box-shadow: 0 0 10px rgba(123, 46, 255, 0.5);
    }
    
    .title {
      font-family: 'Orbitron', sans-serif;
      font-size: 48px;
      font-weight: 700;
      background: linear-gradient(135deg, #FFFFFF 0%, #8B9DC3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-align: center;
      margin: 40px 0;
      text-transform: uppercase;
      letter-spacing: 6px;
      line-height: 1.2;
    }
    
    .content {
      text-align: center;
      font-size: 22px;
      line-height: 1.8;
      color: #B8C5D6;
      margin: 40px 0;
      font-weight: 300;
    }
    
    .content p {
      margin: 15px 0;
    }
    
    .recipient {
      font-family: 'Orbitron', sans-serif;
      font-size: 42px;
      font-weight: 700;
      background: linear-gradient(135deg, #7B2EFF 0%, #0066FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 30px 0;
      padding: 20px;
      border: 2px solid;
      border-image: linear-gradient(90deg, transparent, #7B2EFF, transparent) 1;
      position: relative;
      animation: float 3s ease-in-out infinite;
    }
    
    .recipient::before,
    .recipient::after {
      content: '▸';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #7B2EFF;
      font-size: 24px;
      animation: glow 2s ease-in-out infinite;
    }
    
    .recipient::before {
      left: 10px;
    }
    
    .recipient::after {
      right: 10px;
      content: '◂';
    }
    
    .details {
      margin: 50px 0;
      padding: 30px;
      background: linear-gradient(135deg, rgba(123, 46, 255, 0.1) 0%, rgba(0, 102, 255, 0.1) 100%);
      border: 1px solid rgba(123, 46, 255, 0.3);
      border-radius: 10px;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 8px 32px rgba(123, 46, 255, 0.2),
        inset 0 0 20px rgba(123, 46, 255, 0.1);
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;
      font-size: 18px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(123, 46, 255, 0.2);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #8B9DC3;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 14px;
    }
    
    .detail-value {
      font-family: 'Orbitron', sans-serif;
      color: #FFFFFF;
      font-weight: 600;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-around;
      margin-top: 80px;
      padding-top: 40px;
      border-top: 2px solid;
      border-image: linear-gradient(90deg, transparent, #7B2EFF, #0066FF, #7B2EFF, transparent) 1;
    }
    
    .signature {
      text-align: center;
    }
    
    .signature-line {
      width: 250px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #7B2EFF, transparent);
      margin: 20px auto 15px;
      box-shadow: 0 0 10px rgba(123, 46, 255, 0.5);
    }
    
    .signature-name {
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      font-size: 20px;
      color: #FFFFFF;
      margin-bottom: 5px;
    }
    
    .signature-title {
      color: #8B9DC3;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 1px;
    }
    
    .seal {
      position: absolute;
      bottom: 50px;
      right: 50px;
      width: 120px;
      height: 120px;
      border: 3px solid #7B2EFF;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      color: #7B2EFF;
      font-size: 14px;
      text-align: center;
      transform: rotate(-15deg);
      background: radial-gradient(circle, rgba(123, 46, 255, 0.2) 0%, transparent 70%);
      box-shadow: 
        0 0 20px rgba(123, 46, 255, 0.6),
        inset 0 0 20px rgba(123, 46, 255, 0.2);
      animation: glow 3s ease-in-out infinite;
    }
    
    .seal::before {
      content: '';
      position: absolute;
      width: 90%;
      height: 90%;
      border: 2px solid rgba(123, 46, 255, 0.3);
      border-radius: 50%;
    }
    
    .document-type-badge {
      display: inline-block;
      padding: 8px 20px;
      background: linear-gradient(135deg, rgba(123, 46, 255, 0.2), rgba(0, 102, 255, 0.2));
      border: 1px solid #7B2EFF;
      border-radius: 20px;
      color: #7B2EFF;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    
    @media print {
      body {
        background: #0a0e27;
      }
      .certificate {
        box-shadow: none;
      }
      .certificate::after {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    <div class="corner-decoration bottom-left"></div>
    <div class="corner-decoration bottom-right"></div>
    
    <div class="cert-inner">
      <div class="header">
        <div class="logo">FUND8R</div>
        <div class="subtitle">Next-Generation Proprietary Trading</div>
      </div>

      <div class="divider"></div>
      
      <div style="text-align: center;">
        <span class="document-type-badge">${doc.document_type || 'Certificate'}</span>
      </div>

      <div class="title">${doc.title || 'Digital Certificate'}</div>

      <div class="content">
        <p>This digital certificate verifies that</p>
        <div class="recipient">${user.email}</div>
        <p>${doc.description || 'has successfully achieved this milestone in their trading journey'}</p>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Document ID</span>
          <span class="detail-value">${doc.document_number || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue Date</span>
          <span class="detail-value">${issueDate}</span>
        </div>
        ${doc.challenge_type ? `
        <div class="detail-row">
          <span class="detail-label">Challenge Type</span>
          <span class="detail-value">${doc.challenge_type}</span>
        </div>
        ` : ''}
        ${doc.account_size ? `
        <div class="detail-row">
          <span class="detail-label">Account Size</span>
          <span class="detail-value">$${parseFloat(doc.account_size).toLocaleString()}</span>
        </div>
        ` : ''}
        ${doc.amount ? `
        <div class="detail-row">
          <span class="detail-label">Amount</span>
          <span class="detail-value">$${parseFloat(doc.amount).toFixed(2)}</span>
        </div>
        ` : ''}
      </div>

      <div class="signature-section">
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">MICHAEL JOHNSON</div>
          <div class="signature-title">Chief Executive Officer</div>
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">SARAH WILLIAMS</div>
          <div class="signature-title">Director of Operations</div>
        </div>
      </div>

      <div class="seal">
        <div>VERIFIED</div>
        <div style="font-size: 10px; margin-top: 5px;">FUND8R</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function SupportSection({ user }: { user: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      if (!supabase) return;
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (ticketError) {
        console.error('Error fetching ticket:', ticketError);
        return;
      }

      // Fetch messages via backend API (bypasses PostgREST cache)
      const API_URL = import.meta.env.VITE_API_URL || 'https://fund-backend-pbde.onrender.com/api';
      const messagesResponse = await fetch(`${API_URL}/support/tickets/${ticketId}/messages`);
      const messagesResult = await messagesResponse.json();

      const messages = messagesResult.success ? messagesResult.data : [];
      setSelectedTicket({ ...ticket, messages });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendUserMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      console.log('Sending user message to ticket:', selectedTicket.id);

      // Use backend API (uses service role, bypasses PostgREST completely)
      const API_URL = import.meta.env.VITE_API_URL || 'https://fund-backend-pbde.onrender.com/api';
      const response = await fetch(`${API_URL}/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          is_admin: false,
          user_id: user.id,
          admin_id: null
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      console.log('Message sent successfully:', result.data);

      setNewMessage('');
      fetchTicketMessages(selectedTicket.id);
      fetchTickets();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Failed to send message. Error: ' + (error?.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'text-blue-400 bg-blue-500/20',
      pending: 'text-yellow-400 bg-yellow-500/20',
      resolved: 'text-green-400 bg-green-500/20',
      closed: 'text-gray-400 bg-gray-500/20'
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">
          <GradientText>Support Tickets</GradientText>
        </h2>
        <p className="text-gray-400">View and manage your support tickets</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading tickets...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">No support tickets yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Contact us from the Contact page
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => fetchTicketMessages(ticket.id)}
                  className={`w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-4 border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-electric-blue'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-1">
                      {ticket.subject}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {selectedTicket ? (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 p-6 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Ticket #{selectedTicket.id.slice(0, 8)}</span>
                    <span className={`px-2 py-1 rounded ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-electric-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">You</span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedTicket.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{selectedTicket.description}</p>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.messages?.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-4 border ${
                        msg.is_admin
                          ? 'bg-neon-purple/10 border-neon-purple/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.is_admin
                            ? 'bg-neon-purple/20'
                            : 'bg-electric-blue/20'
                        }`}>
                          {msg.is_admin ? (
                            <CheckCircle className="w-4 h-4 text-neon-purple" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-electric-blue" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">
                              {msg.is_admin ? 'Support Team' : 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendUserMessage()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-electric-blue focus:outline-none"
                    />
                    <button
                      onClick={sendUserMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-purple text-white rounded-lg hover:shadow-lg hover:shadow-electric-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl border border-white/10 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a ticket to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I withdraw my profits?',
      a: 'You can request withdrawals through the Payouts section once you meet the minimum payout threshold and have completed the required trading days. Payouts are processed within 24-48 hours.',
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum withdrawal amount is $100. There are no maximum limits on withdrawals.',
    },
    {
      q: 'How does the profit split work?',
      a: 'Your profit split percentage is determined by your challenge type (ranging from 80% to 90%). You keep your percentage of all profits generated.',
    },
    {
      q: 'Can I trade during news events?',
      a: 'Yes, you can trade during news events. However, we recommend proper risk management during high-impact news releases.',
    },
    {
      q: 'What happens if I violate a trading rule?',
      a: 'Violations of trading rules may result in account termination. Minor violations may receive warnings first. Serious violations (like exceeding max drawdown) result in immediate account closure.',
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Frequently Asked Questions</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Find answers to common questions</p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="font-semibold">{faq.q}</span>
              <span className="text-2xl">{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-white/70">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection({ user }: { user: any }) {
  return <NewSettings user={user} />;
}
