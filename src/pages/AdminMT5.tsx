import { useState, useEffect, useMemo } from 'react';
import { supabase, supabaseAdmin, boltSupabase, oldSupabase, backendSupabase } from '../lib/db';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminAuth from '../components/AdminAuth';
import GradientText from '../components/ui/GradientText';
import AdminPropFirm from './AdminPropFirm';
import { Plus, Send, Eye, EyeOff, Copy, Check, X, Search, Award, Trophy, User, AlertTriangle, FileText, Users, Target, Calendar, DollarSign, BarChart3, Activity, Shield } from 'lucide-react';

interface MT5Account {
  _db_source: string;
  account_id: string;
  user_id: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
  account_type: string;
  account_size: number;
  current_balance: number;
  status: string;
  is_sent: boolean;
  created_at: string;
  user_email?: string;
  user_name?: string;
  unique_user_id?: string;
  phase?: number;
  challenge_type?: string;
}

interface UserProfile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  friendly_id?: string;
  full_name: string;
  display_name?: string;
}

export default function AdminMT5() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'accounts' | 'analytics' | 'certificates' | 'competitions' | 'user-details' | 'profiles' | 'breach' | 'affiliates' | 'propfirm'>('accounts');
  const [phaseSubTabs, setPhaseSubTabs] = useState<{[key: string]: 'phase1' | 'phase2' | 'live'}>({});
  const [error, setError] = useState<string | null>(null);
  const [allProfilesData, setAllProfilesData] = useState<any[]>([]);
  const [authUsersData, setAuthUsersData] = useState<any[]>([]);
  const [authUsersMap, setAuthUsersMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading data from ALL databases (PRIMARY + BOLT + OLD)...');

      // ========== FETCH ALL USER PROFILES ==========
      const fetchProfiles = async (db: any, dbName: string) => {
        if (!db) {
          console.log(`DB client '${dbName}' not available, skipping.`);
          return [];
        }
        try {
          const { data, error } = await db.from('user_profile').select('*');
          if (error) {
            console.error(`Error fetching profiles from ${dbName}:`, error.message);
            return [];
          }
          console.log(`Successfully fetched ${data.length} profiles from ${dbName}.`);
          return data;
        } catch (e: any) {
          console.error(`Exception fetching profiles from ${dbName}:`, e.message);
          return [];
        }
      };

      const [primaryProfiles, boltProfiles, oldProfiles] = await Promise.all([
        fetchProfiles(supabaseAdmin, 'Primary DB'),
        fetchProfiles(boltSupabase, 'Bolt DB'),
        fetchProfiles(oldSupabase, 'Old DB')
      ]);

      const allProfiles = [...primaryProfiles, ...boltProfiles, ...oldProfiles].filter((p: any) => p.user_id);
      const allProfilesData = Array.from(new Map(allProfiles.map((p: any) => [p.user_id, p])).values());
      console.log(`Total unique profiles merged from all DBs: ${allProfilesData.length}`);
      if (allProfilesData.length > 0) {
        console.log('Sample profile data:', allProfilesData[0]);
      }

      // ========== FETCH AUTH.USERS AS FALLBACK ==========
      console.log('🔄 Fetching auth.users data for fallback...');
      let authUsersData: any[] = [];
      try {
        if (backendSupabase) {
          const { data: authUsers, error: authError } = await backendSupabase.auth.admin.listUsers();
          if (authError) {
            console.warn('⚠️ Could not fetch auth.users:', authError.message);
          } else {
            authUsersData = authUsers.users || [];
            console.log(`✅ Fetched ${authUsersData.length} users from auth.users`);
          }
        }
      } catch (authException: any) {
        console.warn('⚠️ Exception fetching auth.users:', authException.message);
      }

      // Create auth users map for fallback
      const authUsersMap = new Map(authUsersData.map((user: any) => [
        user.id,
        {
          user_id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || '',
          last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          friendly_id: user.user_metadata?.friendly_id || null,
          full_name: user.user_metadata?.name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email
        }
      ]));

      // ========== MERGE PROFILES WITH AUTH FALLBACK ==========
      const profilesMap = new Map<string, UserProfile>();

      // First, add all existing profiles
      allProfilesData.forEach((profile: UserProfile) => {
        profilesMap.set(profile.user_id, profile);
      });

      // Then, add auth users as fallback for missing profiles
      authUsersData.forEach((authUser: any) => {
        if (!profilesMap.has(authUser.id)) {
          const authProfile = authUsersMap.get(authUser.id);
          if (authProfile) {
            console.log(`🔄 Using auth.users fallback for user_id: ${authUser.id} (${authUser.email})`);
            profilesMap.set(authUser.id, authProfile);
          }
        }
      });

      console.log(`📊 Final merged profiles: ${profilesMap.size} (profiles: ${allProfilesData.length}, auth fallback: ${authUsersData.length - allProfilesData.length})`);

      // ========== PRIMARY DATABASE (Challenges Only) ==========
      let newChallengesData = null;

      if (!supabaseAdmin) {
        console.error('Primary Supabase admin client is not initialized');
      } else {
        try {

          const { data: challenges, error: newChallengesError } = await supabaseAdmin
            .from('user_challenges')
            .select('*')
            .order('purchase_date', { ascending: false });

          if (newChallengesError) {
            console.error('❌ Error fetching PRIMARY DB challenges:', newChallengesError);
          } else {
            newChallengesData = challenges;
            console.log('✅ PRIMARY Database: Found', challenges?.length || 0, 'challenges');
          }
        } catch (primaryError: any) {
          console.error('❌ PRIMARY Database error:', primaryError.message);
        }
      }

      // ========== BOLT DATABASE (Challenges Only) ==========
      let boltChallengesData = null;

      if (boltSupabase) {
        try {

          const { data: challenges, error: boltChallengesError } = await boltSupabase
            .from('user_challenges')
            .select('*')
            .order('purchase_date', { ascending: false });
          if (boltChallengesError) console.warn('⚠️ BOLT DB challenges error:', boltChallengesError.message);
          else {
            boltChallengesData = challenges;
            console.log('⚡️ BOLT Database: Found', challenges?.length || 0, 'challenges');
          }
        } catch (boltError: any) {
          console.warn('⚠️ BOLT Database unavailable:', boltError.message || 'Connection failed');
        }
      }

      // ========== OLD DATABASE (Challenges Only) ==========
      let oldChallengesData = null;

      if (oldSupabase) {
        try {

          const { data: challenges, error: oldChallengesError } = await oldSupabase
            .from('user_challenges')
            .select('*')
            .order('purchase_date', { ascending: false });
          if (oldChallengesError) console.warn('⚠️ OLD DB challenges error:', oldChallengesError.message);
          else {
            oldChallengesData = challenges;
            console.log('💾 OLD Database: Found', challenges?.length || 0, 'challenges');
          }
        } catch (oldDbError: any) {
          console.warn('⚠️ OLD Database unavailable:', oldDbError.message || 'Connection failed');
        }
      }

      // ========== MERGE DATA FROM ALL SOURCES ==========
      

      // Merge challenges from all databases and add source tracking
      const primaryChallengesWithSource = (newChallengesData || []).map((c: any) => ({ ...c, _db_source: 'PRIMARY' }));
      const boltChallengesWithSource = (boltChallengesData || []).map((c: any) => ({ ...c, _db_source: 'BOLT' }));
      const oldChallengesWithSource = (oldChallengesData || []).map((c: any) => ({ ...c, _db_source: 'OLD' }));
      
      const challengesData = [
        ...primaryChallengesWithSource,
        ...boltChallengesWithSource,
        ...oldChallengesWithSource
      ].filter((c: any) => c.user_id);

      console.log('📊 MERGED: Total challenges:', challengesData.length);
      console.log('   - From PRIMARY DB:', newChallengesData?.length || 0);
      console.log('   - From BOLT DB:', boltChallengesData?.length || 0);
      console.log('   - From OLD DB:', oldChallengesData?.length || 0);

      console.log('📊 Admin: Challenge statuses breakdown:', {
        total: challengesData?.length || 0,
        with_credentials: challengesData?.filter((c: any) => c.trading_account_id).length || 0,
        without_credentials: challengesData?.filter((c: any) => !c.trading_account_id).length || 0,
        active: challengesData?.filter((c: any) => c.status === 'active').length || 0,
        pending_payment: challengesData?.filter((c: any) => c.status === 'pending_payment').length || 0,
      });

      // Separate pending challenges (no trading_account_id yet OR credentials not sent)
      // Include all statuses except 'pending_payment' (which means payment not completed)
      const pending = challengesData?.filter((c: any) => {
        const needsCredentials = (!c.trading_account_id || !c.credentials_sent) && c.status !== 'pending_payment';
        if (needsCredentials) {
          console.log('🔍 Pending challenge found:', {
            id: c.id,
            user_id: c.user_id,
            status: c.status,
            account_size: c.account_size,
            challenge_type: c.challenge_type,
            purchase_date: c.purchase_date,
            has_trading_id: !!c.trading_account_id,
            credentials_sent: c.credentials_sent
          });
        }
        return needsCredentials;
      }).map((c: any) => {
        const profile = profilesMap.get(c.user_id);
        if (!profile) {
          console.log(`[PENDING] Profile not found for user_id: ${c.user_id}`);
        }
        const email = (profile && profile.email) || 'Unknown';
        const name = (profile && `${profile.first_name || ''} ${profile.last_name || ''}`.trim()) || 'N/A';
        
        return {
          id: c.id,
          user_id: c.user_id,
          user_email: email,
          user_name: name,
          friendly_id: (profile && profile.friendly_id) || 'N/A',
          account_size: c.account_size,
          challenge_type: c.challenge_type || 'Unknown',
          challenge_type_id: c.challenge_type_id,
          status: c.status,
          phase: 'pending_credentials',
          created_at: c.purchase_date || c.created_at,
          amount_paid: c.amount_paid
        };
      }) || [];

      console.log('✅ Admin: Pending challenges (need MT5 credentials):', pending.length);
      if (pending.length > 0) {
        console.table(pending.map(p => ({
          email: p.user_email,
          account_size: p.account_size,
          challenge_type: p.challenge_type,
          status: p.status,
          created: new Date(p.created_at).toLocaleDateString()
        })));
      }

      setPendingChallenges(pending);
      
      // Show detailed info if no pending challenges found
      if (pending.length === 0 && challengesData && challengesData.length > 0) {
        console.warn('⚠️ No pending challenges found, but there are', challengesData.length, 'total challenges');
        console.log('📋 All challenge statuses:');
        console.table(challengesData.map(c => ({ 
          id: c.id.slice(0, 8), 
          status: c.status, 
          has_trading_id: !!c.trading_account_id,
          account_size: c.account_size,
          purchase_date: c.purchase_date ? new Date(c.purchase_date).toLocaleDateString() : 'N/A'
        })));
      }

      if (challengesData && challengesData.length === 0) {
        console.info('ℹ️ No challenges found in database. This could mean:\n  1. No users have purchased any challenges yet\n  2. Admin RLS policy is not working (check admin_roles table)');
      }

      // Format challenges as "accounts" for display
      const formattedAccounts = challengesData?.filter((c: any) => c.trading_account_id).map((c: any) => {
        const profile = profilesMap.get(c.user_id);
        if (!profile) {
          console.log(`[ACCOUNTS] Profile not found for user_id: ${c.user_id}`);
        }
        const email = (profile && profile.email) || 'Unknown';
        const name = (profile && `${profile.first_name || ''} ${profile.last_name || ''}`.trim()) || 'N/A';
        
        return {
          _db_source: c._db_source,
          account_id: c.id,
          user_id: c.user_id,
          mt5_login: c.trading_account_id || 'Not Assigned',
          mt5_password: c.trading_account_password || 'Not Set',
          mt5_server: c.trading_account_server || 'MetaQuotes-Demo',
          account_type: c.challenge_type_id || 'Standard',
          account_size: c.account_size,
          current_balance: 0,
          status: c.status,
          is_sent: c.credentials_sent || false,
          created_at: c.purchase_date,
          user_email: email,
          user_name: name,
          unique_user_id: (profile && profile.friendly_id) || 'N/A'
        };
      }) || [];

      setAccounts(formattedAccounts);

            // Create comprehensive users list from all sources (profiles + auth users)
            const usersMap = new Map<string, any>();

            // First, add all profile users
            allProfilesData.forEach((p: any) => {
              usersMap.set(p.user_id, {
                id: p.user_id,
                user_id: p.user_id,
                email: p.email,
                full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
                friendly_id: p.friendly_id,
                source: 'profile'
              });
            });

            // Then, add any auth users not already included
            authUsersData.forEach((u: any) => {
              usersMap.set(u.id, {
                id: u.id,
                user_id: u.id,
                email: u.email,
                full_name: authUsersMap.get(u.id)?.full_name || u.email,
                friendly_id: authUsersMap.get(u.id)?.friendly_id || null,
                source: 'auth'
              });
            });

            const comprehensiveUsers = Array.from(usersMap.values());

      console.log('📊 Users for affiliate management:', comprehensiveUsers.length);
      console.log('   - From profiles:', allProfilesData.length);
      console.log('   - Total comprehensive:', comprehensiveUsers.length);

      setUsers(comprehensiveUsers);
      
      setLoading(false);
      setError(null);
      
      console.log('✅ Data loaded successfully:', {
        users: comprehensiveUsers.length,
        accounts: formattedAccounts.length,
        pendingChallenges: pending.length,
        totalChallenges: challengesData.length
      });
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      setError(error.message || 'Failed to load data. Please check console for details.');
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.mt5_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <AdminAuth>
      <div className="min-h-screen bg-deep-space">
        <Navbar />

        <div className="pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <GradientText>Admin MT5 Management Panel</GradientText>
            </h1>
            <p className="text-gray-400">Complete admin control center for certificates, competitions, user profiles, and account management</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 glass-card p-2">
            <TabButton
              active={activeTab === 'accounts'}
              onClick={() => setActiveTab('accounts')}
              icon={<Users size={18} />}
              label="MT5 Accounts"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<BarChart3 size={18} />}
              label="MT5 Analytics"
            />
            <TabButton
              active={activeTab === 'certificates'}
              onClick={() => setActiveTab('certificates')}
              icon={<Award size={18} />}
              label="Manual Certificates"
            />
            <TabButton
              active={activeTab === 'competitions'}
              onClick={() => setActiveTab('competitions')}
              icon={<Trophy size={18} />}
              label="Competitions"
            />
            <TabButton
              active={activeTab === 'user-details'}
              onClick={() => setActiveTab('user-details')}
              icon={<FileText size={18} />}
              label="User Details"
            />
            <TabButton
              active={activeTab === 'profiles'}
              onClick={() => setActiveTab('profiles')}
              icon={<User size={18} />}
              label="User Profile 360°"
            />
            <TabButton
              active={activeTab === 'breach'}
              onClick={() => setActiveTab('breach')}
              icon={<AlertTriangle size={18} />}
              label="Manual Breach"
            />
            <TabButton
              active={activeTab === 'affiliates'}
              onClick={() => setActiveTab('affiliates')}
              icon={<DollarSign size={18} />}
              label="Affiliate Management"
            />
            <TabButton
              active={activeTab === 'propfirm'}
              onClick={() => setActiveTab('propfirm')}
              icon={<Shield size={18} />}
              label="Prop Firm Dashboard"
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'accounts' && (
            <AccountsTab
              accounts={accounts}
              pendingChallenges={pendingChallenges}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setShowCreateModal={setShowCreateModal}
              loadData={loadData}
            />
          )}

          {activeTab === 'analytics' && <MT5AnalyticsTab />}
          {activeTab === 'certificates' && <CertificatesTab users={users} />}
          {activeTab === 'competitions' && <CompetitionsTab users={users} />}

          {activeTab === 'profiles' && <UserProfilesTab users={users} accounts={accounts} />}
          {activeTab === 'breach' && <ManualBreachTab users={users} accounts={accounts} />}
          {activeTab === 'affiliates' && <AffiliatesManagementTab users={users} />}
          {activeTab === 'propfirm' && <AdminPropFirm />}
        </div>
      </div>

      {showCreateModal && (
        <CreateAccountModal
          users={users}
          pendingChallenges={pendingChallenges}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

        <Footer />
      </div>
    </AdminAuth>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
          : 'bg-white/5 hover:bg-white/10 text-white/70'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AccountsTab({ accounts, pendingChallenges, searchTerm, setSearchTerm, setShowCreateModal, loadData }: { accounts: MT5Account[]; pendingChallenges: any[]; searchTerm: string; setSearchTerm: (term: string) => void; setShowCreateModal: (show: boolean) => void; loadData: () => void }) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [notes, setNotes] = useState<{ [key: string]: { userNote: string; adminNote: string } }>({});
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [phaseFormData, setPhaseFormData] = useState({
    phase: 1,
    mt5_login: '',
    mt5_password: '',
    mt5_server: 'MetaQuotes-Demo',
    account_size: 0
  });
  const [editFormData, setEditFormData] = useState({
    mt5_login: '',
    mt5_password: '',
    mt5_server: '',
    account_size: 0
  });

  // Phase management functions
  const handleMarkAsPassed = async (account: any) => {
    if (!account) return;

    const nextPhase = account.phase ? account.phase + 1 : 2;
    const nextAccountSize = account.account_size * 2; // Double the account size for next phase

    if (window.confirm(`Mark this account as PASSED and create Phase ${nextPhase} credentials? This will create a new account with $${nextAccountSize.toLocaleString()} size.`)) {
      try {
        // Update current account status to 'passed'
        let dbClient = supabase;
        if (account._db_source === 'BOLT') dbClient = boltSupabase;
        else if (account._db_source === 'OLD') dbClient = oldSupabase;

        if (!dbClient) {
          throw new Error(`Database client for ${account._db_source} is not initialized`);
        }

        // Update current account to passed
        const { error: updateError } = await dbClient
          .from('user_challenges')
          .update({
            status: 'passed',
            phase: account.phase || 1
          })
          .eq('id', account.account_id);

        if (updateError) throw updateError;

        // Create next phase account
        const nextPhaseData = {
          user_id: account.user_id,
          challenge_type: account.challenge_type || 'competition',
          challenge_type_id: account.account_type,
          account_size: nextAccountSize,
          amount_paid: 0, // Free for phase progression
          status: 'pending_credentials',
          phase: nextPhase,
          credentials_sent: false
        };

        const { data: newChallenge, error: createError } = await dbClient
          .from('user_challenges')
          .insert(nextPhaseData)
          .select()
          .single();

        if (createError) throw createError;

        alert(`✅ Account marked as PASSED! Phase ${nextPhase} account created with $${nextAccountSize.toLocaleString()} size.`);
        loadData();
      } catch (error: any) {
        console.error('Error marking account as passed:', error);
        alert(`Failed to mark account as passed: ${error.message}`);
      }
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;

    try {
      let dbClient = supabase;
      if (selectedAccount._db_source === 'BOLT') dbClient = boltSupabase;
      else if (selectedAccount._db_source === 'OLD') dbClient = oldSupabase;

      if (!dbClient) {
        throw new Error(`Database client for ${selectedAccount._db_source} is not initialized`);
      }

      const { error } = await dbClient
        .from('user_challenges')
        .update({
          trading_account_id: editFormData.mt5_login,
          trading_account_password: editFormData.mt5_password,
          trading_account_server: editFormData.mt5_server,
          account_size: editFormData.account_size
        })
        .eq('id', selectedAccount.account_id);

      if (error) throw error;

      alert('✅ Account details updated successfully!');
      setShowEditModal(false);
      setSelectedAccount(null);
      loadData();
    } catch (error: any) {
      console.error('Error updating account:', error);
      alert(`Failed to update account: ${error.message}`);
    }
  };

  const handleAssignPhaseCredentials = async () => {
    if (!selectedAccount) return;

    try {
      let dbClient = supabase;
      if (selectedAccount._db_source === 'BOLT') dbClient = boltSupabase;
      else if (selectedAccount._db_source === 'OLD') dbClient = oldSupabase;

      if (!dbClient) {
        throw new Error(`Database client for ${selectedAccount._db_source} is not initialized`);
      }

      const { error } = await dbClient
        .from('user_challenges')
        .update({
          trading_account_id: phaseFormData.mt5_login,
          trading_account_password: phaseFormData.mt5_password,
          trading_account_server: phaseFormData.mt5_server,
          account_size: phaseFormData.account_size,
          status: 'active',
          credentials_sent: false,
          phase: phaseFormData.phase
        })
        .eq('id', selectedAccount.account_id);

      if (error) throw error;

      alert(`✅ Phase ${phaseFormData.phase} credentials assigned successfully!`);
      setShowPhaseModal(false);
      setSelectedAccount(null);
      loadData();
    } catch (error: any) {
      console.error('Error assigning phase credentials:', error);
      alert(`Failed to assign credentials: ${error.message}`);
    }
  };

  const handleNoteChange = (challengeId: string, noteType: 'userNote' | 'adminNote', value: string) => {
    setNotes(prev => ({
      ...prev,
      [challengeId]: {
        ...(prev[challengeId] || {}),
        [noteType]: value,
      },
    }));
  };

  const handleSaveInternalNote = async (challengeId: string) => {
    const adminNote = notes[challengeId]?.adminNote || '';
    if (!adminNote.trim()) {
      alert('Please enter an internal note to save.');
      return;
    }

    try {
      const response = await api.saveInternalNote(challengeId, adminNote);

      if (response.success) {
        alert('Internal note saved successfully.');
      } else {
        throw new Error(response.error || 'Failed to save internal note.');
      }
    } catch (error: any) {
      console.error('Error saving internal note:', error);
      alert(`Failed to save internal note: ${error.message}`);
    }
  };

  const handleSendUserNote = async (challengeId: string) => {
    const userNote = notes[challengeId]?.userNote || '';
    if (!userNote.trim()) {
      alert('Please enter a note to send.');
      return;
    }

    if (window.confirm('Are you sure you want to send this note to the user?')) {
      try {
        const response = await api.sendUserNote(challengeId, userNote);

        if (response.success) {
          alert('Note sent successfully.');
          // Optionally clear the note after sending
          handleNoteChange(challengeId, 'userNote', '');
        } else {
          throw new Error(response.error || 'Failed to send note.');
        }
      } catch (error: any) {
        console.error('Error sending note:', error);
        alert(`Failed to send note: ${error.message}`);
      }
    }
  };

  const handleReject = async (challengeId: string) => {
    if (window.confirm('Are you sure you want to reject this challenge? This action cannot be undone.')) {
      try {
        const userNote = notes[challengeId]?.userNote || '';
        const adminNote = notes[challengeId]?.adminNote || '';
        await api.rejectChallenge(challengeId, userNote, adminNote);
        alert('Challenge rejected successfully.');
        loadData(); // Refresh data
      } catch (error: any) {
        console.error('Error rejecting challenge:', error);
        alert(`Failed to reject challenge: ${error.message}`);
      }
    }
  };

  const pending = pendingChallenges.filter((c: any) => c.status !== 'rejected');
  const rejected = pendingChallenges.filter((c: any) => c.status === 'rejected');

  const filteredPendingChallenges = pending.filter((challenge: any) =>
    challenge.user_email?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    challenge.user_name?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    challenge.challenge_type?.toLowerCase().includes(pendingSearchTerm.toLowerCase())
  );

  const filteredRejectedChallenges = rejected.filter((challenge: any) =>
    challenge.user_email?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    challenge.user_name?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    challenge.challenge_type?.toLowerCase().includes(pendingSearchTerm.toLowerCase())
  );

  const filteredAccounts = accounts.filter((acc: any) =>
    acc.mt5_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">MT5 Account Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gradient flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Account</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search all accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Pending Setup"
              value={pendingChallenges.length}
              icon="⏳"
              color="orange"
            />
            <StatCard
              label="Total Accounts"
              value={accounts.length}
              icon="👥"
              color="blue"
            />
            <StatCard
              label="Active"
              value={accounts.filter((a: MT5Account) => a.status === 'active').length}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Total Balance"
              value={`$${accounts.reduce((sum: number, a: MT5Account) => sum + Number(a.current_balance), 0).toLocaleString()}`}
              icon="💰"
              color="purple"
            />
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-white/10 mb-6">
        <SubTabButton active={activeSubTab === 'pending'} onClick={() => setActiveSubTab('pending')}>
          Pending Setup ({pending.length})
        </SubTabButton>
        <SubTabButton active={activeSubTab === 'rejected'} onClick={() => setActiveSubTab('rejected')}>
          Rejected ({rejected.length})
        </SubTabButton>
        <SubTabButton active={activeSubTab === 'phase1'} onClick={() => setActiveSubTab('phase1')}>
          Phase 1 ({accounts.filter(acc => acc.phase === 1 || !acc.phase).length})
        </SubTabButton>
        <SubTabButton active={activeSubTab === 'phase2'} onClick={() => setActiveSubTab('phase2')}>
          Phase 2 ({accounts.filter(acc => acc.phase === 2).length})
        </SubTabButton>
        <SubTabButton active={activeSubTab === 'live'} onClick={() => setActiveSubTab('live')}>
          Live Accounts ({accounts.filter(acc => acc.phase === 3).length})
        </SubTabButton>
        <SubTabButton active={activeSubTab === 'all'} onClick={() => setActiveSubTab('all')}>
          All Accounts ({accounts.length})
        </SubTabButton>
      </div>

      {activeSubTab === 'pending' && (
        <>
          {/* Pending Challenges Section */}
          {pending.length > 0 ? (
            <div className="glass-card p-6 mb-8 border-2 border-yellow-500/50">
              <h2 className="text-2xl font-bold mb-2 text-yellow-400">⏳ Pending Challenges - Needs MT5 Credentials</h2>
              <p className="text-gray-400 mb-6">These users have purchased challenges and are waiting for MT5 account setup</p>

              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search pending challenges..."
                    value={pendingSearchTerm}
                    onChange={(e) => setPendingSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredPendingChallenges.map((challenge: any) => (
                  <div key={challenge.id} className="bg-white/5 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="font-bold text-lg">
                            {challenge.user_name} ({challenge.friendly_id || 'N/A'})
                          </div>
                          <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold">
                            Awaiting Setup
                          </div>
                        </div>
                         <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Email</div>
                            <div className="font-semibold">{challenge.user_email}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Account Size</div>
                            <div className="font-semibold">${parseFloat(challenge.account_size).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Challenge Type</div>
                            <div className="font-semibold">{challenge.challenge_type}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Platform</div>
                            <div className="font-semibold">
                              {challenge.trading_platform === 'tradingview' ? (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs uppercase">TradingView</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs uppercase">MT5</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Amount Paid</div>
                            <div className="font-semibold">${parseFloat(challenge.amount_paid || 0).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Created</div>
                            <div className="font-semibold">{new Date(challenge.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">Notes to User</label>
                          <div className="flex items-center space-x-2">
                            <textarea
                              placeholder="Visible to the user..."
                              className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none text-sm"
                              value={notes[challenge.id]?.userNote || ''}
                              onChange={(e) => handleNoteChange(challenge.id, 'userNote', e.target.value)}
                            />
                            <button onClick={() => handleSendUserNote(challenge.id)} className="p-2 bg-electric-blue/20 rounded-lg text-electric-blue hover:bg-electric-blue/30"><Send size={16} /></button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">Internal Notes</label>
                          <div className="flex items-center space-x-2">
                            <textarea
                              placeholder="Only visible to admins..."
                              className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none text-sm"
                              value={notes[challenge.id]?.adminNote || ''}
                              onChange={(e) => handleNoteChange(challenge.id, 'adminNote', e.target.value)}
                            />
                            <button onClick={() => handleSaveInternalNote(challenge.id)} className="p-2 bg-gray-500/20 rounded-lg text-gray-400 hover:bg-gray-500/30">Save</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs text-white/60">Use tab navigation for account management</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No pending challenges.</div>
          )}
        </>
      )}

      {activeSubTab === 'rejected' && (
        <div className="glass-card p-6 mb-8 border-2 border-red-500/50">
          <h2 className="text-2xl font-bold mb-2 text-red-400">🚫 Rejected Challenges</h2>
          <p className="text-gray-400 mb-6">These challenges have been rejected and require no further action.</p>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search rejected challenges..."
                value={pendingSearchTerm}
                onChange={(e) => setPendingSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredRejectedChallenges.length > 0 ? (
            <div className="space-y-4">
              {filteredRejectedChallenges.map((challenge: any) => (
                <div key={challenge.id} className="bg-white/5 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="font-bold text-lg">
                          {challenge.user_name} ({challenge.friendly_id || 'N/A'})
                        </div>
                        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold">
                          Rejected
                        </div>
                      </div>
                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Email</div>
                          <div className="font-semibold">{challenge.user_email}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Account Size</div>
                          <div className="font-semibold">${parseFloat(challenge.account_size).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Challenge Type</div>
                          <div className="font-semibold">{challenge.challenge_type}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Amount Paid</div>
                          <div className="font-semibold">${parseFloat(challenge.amount_paid || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Created</div>
                          <div className="font-semibold">{new Date(challenge.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No rejected challenges.</div>
          )}
        </div>
      )}

      {activeSubTab === 'phase1' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Phase 1 Accounts</h2>

          {filteredAccounts.filter(acc => acc.phase === 1 || !acc.phase).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No Phase 1 accounts found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gradient"
              >
                Create First Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAccounts.filter(acc => acc.phase === 1 || !acc.phase).map((account: MT5Account) => (
                <AccountCard
                  key={account.account_id}
                  account={account}
                  onUpdate={loadData}
                  onMarkPassed={handleMarkAsPassed}
                  onEditAccount={(selectedAccount: MT5Account) => {
                    setSelectedAccount(selectedAccount);
                    setEditFormData({
                      mt5_login: selectedAccount.mt5_login,
                      mt5_password: selectedAccount.mt5_password,
                      mt5_server: selectedAccount.mt5_server,
                      account_size: selectedAccount.account_size
                    });
                    setShowEditModal(true);
                  }}
                  onAssignPhase={(selectedAccount: MT5Account) => {
                    setSelectedAccount(selectedAccount);
                    setPhaseFormData({
                      phase: 1,
                      mt5_login: '',
                      mt5_password: '',
                      mt5_server: 'MetaQuotes-Demo',
                      account_size: selectedAccount.account_size * 2
                    });
                    setShowPhaseModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'phase2' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Phase 2 Accounts</h2>

          {filteredAccounts.filter(acc => acc.phase === 2).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No Phase 2 accounts found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gradient"
              >
                Create First Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAccounts.filter(acc => acc.phase === 2).map((account: MT5Account) => (
                <AccountCard
                  key={account.account_id}
                  account={account}
                  onUpdate={loadData}
                  onMarkPassed={handleMarkAsPassed}
                  onEditAccount={(acc) => {
                    setSelectedAccount(acc);
                    setEditFormData({
                      mt5_login: acc.mt5_login,
                      mt5_password: acc.mt5_password,
                      mt5_server: acc.mt5_server,
                      account_size: acc.account_size
                    });
                    setShowEditModal(true);
                  }}
                  onAssignPhase={(acc) => {
                    setSelectedAccount(acc);
                    setPhaseFormData({
                      phase: 1,
                      mt5_login: '',
                      mt5_password: '',
                      mt5_server: 'MetaQuotes-Demo',
                      account_size: acc.account_size * 2
                    });
                    setShowPhaseModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'live' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Live Accounts</h2>

          {filteredAccounts.filter(acc => acc.phase === 3).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No Live accounts found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gradient"
              >
                Create First Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAccounts.filter(acc => acc.phase === 3).map((account: MT5Account) => (
                <AccountCard
                  key={account.account_id}
                  account={account}
                  onUpdate={loadData}
                  onMarkPassed={handleMarkAsPassed}
                  onEditAccount={(acc) => {
                    setSelectedAccount(acc);
                    setEditFormData({
                      mt5_login: acc.mt5_login,
                      mt5_password: acc.mt5_password,
                      mt5_server: acc.mt5_server,
                      account_size: acc.account_size
                    });
                    setShowEditModal(true);
                  }}
                  onAssignPhase={(acc) => {
                    setSelectedAccount(acc);
                    setPhaseFormData({
                      phase: 1,
                      mt5_login: '',
                      mt5_password: '',
                      mt5_server: 'MetaQuotes-Demo',
                      account_size: acc.account_size * 2
                    });
                    setShowPhaseModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'all' && (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">All MT5 Accounts</h2>

            {filteredAccounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No MT5 accounts found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-gradient"
                >
                  Create First Account
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAccounts.map((account: MT5Account) => (
                  <AccountCard
                    key={account.account_id}
                    account={account}
                    onUpdate={loadData}
                    onMarkPassed={handleMarkAsPassed}
                    onEditAccount={(acc) => {
                      setSelectedAccount(acc);
                      setEditFormData({
                        mt5_login: acc.mt5_login,
                        mt5_password: acc.mt5_password,
                        mt5_server: acc.mt5_server,
                        account_size: acc.account_size
                      });
                      setShowEditModal(true);
                    }}
                    onAssignPhase={(acc) => {
                      setSelectedAccount(acc);
                      setPhaseFormData({
                        phase: 1,
                        mt5_login: '',
                        mt5_password: '',
                        mt5_server: 'MetaQuotes-Demo',
                        account_size: acc.account_size * 2
                      });
                      setShowPhaseModal(true);
                    }}
                  />
                ))}
              </div>
            )}
        </div>
      )}

      {/* Phase Modal */}
      {showPhaseModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                <GradientText>Assign Phase Credentials</GradientText>
              </h2>
              <button onClick={() => setShowPhaseModal(false)} className="p-2 hover:bg-white/10 rounded">
                <X size={24} />
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-white/60 text-sm">User</div>
                  <div className="font-bold">{selectedAccount.user_email}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Current Size</div>
                  <div className="font-bold">${parseFloat(selectedAccount.account_size).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Challenge Type</div>
                  <div className="font-bold">{selectedAccount.account_type}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Status</div>
                  <div className="font-bold text-neon-green">ACTIVE</div>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssignPhaseCredentials(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Phase *</label>
                  <select
                    value={phaseFormData.phase}
                    onChange={(e) => setPhaseFormData({ ...phaseFormData, phase: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  >
                    <option value={1}>Phase 1</option>
                    <option value={2}>Phase 2</option>
                    <option value={3}>Phase 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Account Size *</label>
                  <input
                    type="number"
                    value={phaseFormData.account_size}
                    onChange={(e) => setPhaseFormData({ ...phaseFormData, account_size: parseFloat(e.target.value) })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                    placeholder="e.g., 200000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">MT5 Login *</label>
                  <input
                    type="text"
                    value={phaseFormData.mt5_login}
                    onChange={(e) => setPhaseFormData({ ...phaseFormData, mt5_login: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                    placeholder="e.g., 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password *</label>
                  <input
                    type="text"
                    value={phaseFormData.mt5_password}
                    onChange={(e) => setPhaseFormData({ ...phaseFormData, mt5_password: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none font-mono"
                    placeholder="Generated password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">MT5 Server *</label>
                <input
                  type="text"
                  value={phaseFormData.mt5_server}
                  onChange={(e) => setPhaseFormData({ ...phaseFormData, mt5_server: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  placeholder="e.g., MetaQuotes-Demo"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPhaseModal(false)}
                  className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Assign Phase Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                <GradientText>Edit Account Details</GradientText>
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded">
                <X size={24} />
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-white/60 text-sm">User</div>
                  <div className="font-bold">{selectedAccount.user_email}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">MT5 Login</div>
                  <div className="font-bold">{selectedAccount.mt5_login}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Challenge Type</div>
                  <div className="font-bold">{selectedAccount.account_type}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Status</div>
                  <div className="font-bold text-neon-green">ACTIVE</div>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditAccount(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">MT5 Login *</label>
                  <input
                    type="text"
                    value={editFormData.mt5_login}
                    onChange={(e) => setEditFormData({ ...editFormData, mt5_login: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password *</label>
                  <input
                    type="text"
                    value={editFormData.mt5_password}
                    onChange={(e) => setEditFormData({ ...editFormData, mt5_password: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">MT5 Server *</label>
                  <input
                    type="text"
                    value={editFormData.mt5_server}
                    onChange={(e) => setEditFormData({ ...editFormData, mt5_server: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Account Size *</label>
                  <input
                    type="number"
                    value={editFormData.account_size}
                    onChange={(e) => setEditFormData({ ...editFormData, account_size: parseFloat(e.target.value) })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Update Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SubTabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-semibold transition-all ${
        active
          ? 'border-b-2 border-electric-blue text-white'
          : 'text-white/60 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors = {
    blue: 'bg-electric-blue/20 border-electric-blue/30',
    green: 'bg-neon-green/20 border-neon-green/30',
    orange: 'bg-orange-500/20 border-orange-500/30',
    purple: 'bg-cyber-purple/20 border-cyber-purple/30'
  };

  return (
    <div className={`glass-card p-6 border ${colors[color as keyof typeof colors]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold">
        <GradientText>{value}</GradientText>
      </div>
    </div>
  );
}

function AccountCard({ account, onUpdate, onMarkPassed, onEditAccount, onAssignPhase }: {
  account: MT5Account;
  onUpdate: () => void;
  onMarkPassed: (account: MT5Account) => void;
  onEditAccount: (account: MT5Account) => void;
  onAssignPhase: (account: MT5Account) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [breachDetails, setBreachDetails] = useState<any>(null);

  useEffect(() => {
    // Load breach details if account is breached
    if (account.status === 'breached') {
      loadBreachDetails();
    }
  }, [account.status]);

  const loadBreachDetails = async () => {
    try {
      // Try to get the breach reason from user_challenges admin_note
      let dbClient = supabase;
      if (account._db_source === 'BOLT') dbClient = boltSupabase;
      else if (account._db_source === 'OLD') dbClient = oldSupabase;

      if (dbClient) {
        const { data } = await dbClient
          .from('user_challenges')
          .select('admin_note, updated_at')
          .eq('id', account.account_id)
          .single();
        
        if (data) {
          setBreachDetails({
            reason: data.admin_note || 'No reason provided',
            date: data.updated_at
          });
        }
      }
    } catch (error) {
      console.error('Error loading breach details:', error);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const sendCredentials = async () => {
    setSending(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      console.log('🚀 Assigning MT5 credentials and starting monitoring...');

      const response = await fetch(`${apiUrl}/accounts/assign-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challenge_id: account.account_id,
          user_id: account.user_id,
          account_number: account.mt5_login,
          password: account.mt5_password,
          server: account.mt5_server,
          account_size: account.account_size
        })
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to assign credentials');
      }

      console.log('✅ Credentials assigned successfully:', result);

      alert('✅ MT5 credentials assigned successfully!\n\n• User can now access credentials\n• Real-time monitoring started\n• Email notification sent');
      onUpdate();
    } catch (error: any) {
      console.error('❌ Error sending credentials:', error);
      const errorMsg = error.message || 'Unknown error occurred';
      alert(`❌ Failed to send credentials:\n\n${errorMsg}\n\nPlease check the console for details or contact support.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`bg-white/5 p-6 rounded-lg border hover:border-white/20 transition-all ${
      account.status === 'breached' ? 'border-red-600/70 bg-red-900/10' :
      account.status === 'rejected' ? 'border-red-500/50' : 
      'border-white/10'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold">{account.user_email}</h3>
            {account.status === 'breached' ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-400 border-2 border-red-600/70 animate-pulse">
                ☠️ DEAD - BREACHED
              </span>
            ) : account.status === 'rejected' ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                Rejected
              </span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                account.is_sent
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
              }`}>
                {account.is_sent ? 'Sent' : 'Pending'}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
              {account.account_type}
            </span>
            {account.unique_user_id && account.unique_user_id !== 'N/A' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
              User ID: {account.unique_user_id}
            </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{account.user_name}</p>
        </div>
        {!account.is_sent && (
          <button
            onClick={sendCredentials}
            disabled={sending}
            className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all disabled:opacity-50"
          >
            <Send size={16} />
            <span>{sending ? 'Sending...' : 'Send Credentials'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CredentialField
          label="MT5 Login"
          value={account.mt5_login}
          onCopy={() => copyToClipboard(account.mt5_login, 'login')}
          copied={copied === 'login'}
        />
        <CredentialField
          label="Password"
          value={account.mt5_password}
          onCopy={() => copyToClipboard(account.mt5_password, 'password')}
          copied={copied === 'password'}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        <CredentialField
          label="Server"
          value={account.mt5_server}
          onCopy={() => copyToClipboard(account.mt5_server, 'server')}
          copied={copied === 'server'}
        />
        <CredentialField
          label="Balance"
          value={`$${Number(account.current_balance).toLocaleString()}`}
        />
      </div>

      {/* Breach Details Section */}
      {account.status === 'breached' && breachDetails && (
        <div className="mt-4 p-4 bg-red-900/20 border-2 border-red-600/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-red-500 mb-2">⚠️ Account Breached</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-red-400 font-semibold">Reason:</span>
                  <p className="text-white mt-1">{breachDetails.reason}</p>
                </div>
                {breachDetails.date && (
                  <div className="text-sm text-red-400">
                    Breached on: {new Date(breachDetails.date).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10">
        <div className="flex items-center space-x-4">
          <span>Created: {new Date(account.created_at).toLocaleDateString()}</span>
          <span>Account Size: ${Number(account.account_size).toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEditAccount(account)}
            className="px-3 py-1 bg-electric-blue/20 text-electric-blue border border-electric-blue/30 rounded-lg hover:bg-electric-blue/30 transition-all text-xs"
          >
            Edit Details
          </button>
          <button
            onClick={() => onAssignPhase(account)}
            className="px-3 py-1 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/30 transition-all text-xs"
          >
            Assign Phase
          </button>
        </div>
      </div>
    </div>
  );
}

function CredentialField({ label, value, onCopy, copied, showPassword, onTogglePassword }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-black/50 px-3 py-2 rounded border border-white/10 font-mono text-sm">
          {showPassword !== undefined && !showPassword ? '••••••••' : value}
        </div>
        {showPassword !== undefined && (
          <button
            onClick={onTogglePassword}
            className="p-2 bg-white/5 rounded hover:bg-white/10 transition-all"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-2 bg-white/5 rounded hover:bg-white/10 transition-all"
          >
            {copied ? <Check size={16} className="text-neon-green" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateAccountModal({ users, onClose, onSuccess, pendingChallenges: propPendingChallenges }: any) {
  const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [formData, setFormData] = useState({
    mt5_login: '',
    mt5_password: generatePassword(),
    mt5_server: 'MetaQuotes-Demo',
    leverage: 100
  });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Modal opened, propPendingChallenges:', propPendingChallenges);
    console.log('Modal opened, propPendingChallenges length:', propPendingChallenges?.length || 0);
    // Use prop data if available, otherwise show empty state
    if (propPendingChallenges && propPendingChallenges.length > 0) {
      console.log('Modal received pending challenges:', propPendingChallenges.length);
      console.log('Sample challenge:', propPendingChallenges[0]);
      setPendingChallenges(propPendingChallenges);
      setLoading(false);
    } else {
      console.log('Modal received no pending challenges or empty array');
      setPendingChallenges([]);
      setLoading(false);
    }
  }, [propPendingChallenges]);

  const handleChallengeSelect = (challengeId: string) => {
    if (!challengeId) {
      setSelectedChallenge(null);
      return;
    }

    const challenge = pendingChallenges.find(c => c.id === challengeId);
    setSelectedChallenge(challenge);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChallenge) {
      alert('Please select a challenge');
      return;
    }

    if (!formData.mt5_login) {
      alert('Please enter MT5 login ID');
      return;
    }

    setCreating(true);

    try {
      // Determine which database to use based on challenge source
      let dbClient = null;
      let dbName = '';

      if (selectedChallenge._db_source === 'PRIMARY') {
        dbClient = supabase;
        dbName = 'PRIMARY DB';
      } else if (selectedChallenge._db_source === 'BOLT') {
        dbClient = boltSupabase;
        dbName = 'BOLT DB';
      } else if (selectedChallenge._db_source === 'OLD') {
        dbClient = oldSupabase;
        dbName = 'OLD DB';
      } else {
        // Default to primary if source unknown
        dbClient = supabase;
        dbName = 'PRIMARY DB (default)';
      }

      if (!dbClient) {
        throw new Error(`Database client for ${dbName} is not initialized`);
      }

      console.log(`💾 Assigning credentials to ${dbName}...`);

      // Update the selected challenge with MT5 credentials
      const { error: updateError } = await dbClient
        .from('user_challenges')
        .update({
          trading_account_id: formData.mt5_login,
          trading_account_password: formData.mt5_password,
          trading_account_server: formData.mt5_server,
          status: 'active',  // Valid statuses: 'active', 'passed', 'failed', 'funded', 'breached'
          credentials_sent: false
        })
        .eq('id', selectedChallenge.id);

      if (updateError) {
        console.error(`❌ Error updating ${dbName}:`, updateError);
        throw updateError;
      }

      console.log(`✅ Credentials assigned successfully in ${dbName}`);

      // Generate purchase certificate when credentials are assigned
      try {
        if (!dbClient) {
          throw new Error('Database client is not initialized');
        }
        const { error: certError } = await dbClient
          .from('downloads')
          .insert({
            user_id: selectedChallenge.user_id,
            challenge_id: selectedChallenge.id,
            document_type: 'certificate',
            title: 'Challenge Purchase Certificate',
            description: 'Certificate for purchasing challenge',
            document_number: `CERT-${Date.now()}`,
            issue_date: new Date().toISOString(),
            account_size: selectedChallenge.account_size,
            status: 'generated',
            auto_generated: true,
            generated_at: new Date().toISOString(),
            download_count: 0
          });

        if (certError) {
          console.warn('Error generating certificate:', certError);
        } else {
          console.log('✅ Certificate generated');
        }
      } catch (certError) {
        console.error('Certificate generation error:', certError);
      }

      alert(`✅ MT5 credentials assigned successfully in ${dbName}!`);
      onSuccess();
    } catch (error: any) {
      console.error('Error assigning credentials:', error);
      alert(`❌ Failed to assign credentials: ${error.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <GradientText>Create MT5 Account</GradientText>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/60">Loading...</div>
        ) : pendingChallenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 mb-4">No pending challenges found</p>
            <p className="text-sm text-white/50">All purchased challenges have been assigned MT5 credentials</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Select Pending Challenge *</label>
              <select
                value={selectedChallenge?.id || ''}
                onChange={(e) => handleChallengeSelect(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              >
                <option value="">-- Select Challenge --</option>
        {pendingChallenges.map((challenge: any) => (
          <option key={challenge.id} value={challenge.id} className="bg-deep-space">
            [{challenge._db_source || 'PRIMARY'}] {challenge.user_email} - ${parseFloat(challenge.account_size).toLocaleString()} - {challenge.challenge_type}
          </option>
        ))}
              </select>
            </div>

            {selectedChallenge && (
              <div className="p-4 bg-electric-blue/10 border border-electric-blue/30 rounded-lg">
                <h4 className="font-bold mb-2">Selected Challenge Details:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">User:</span>
                    <div className="font-semibold">{selectedChallenge.user_email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Name:</span>
                    <div className="font-semibold">{selectedChallenge.user_name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Account Size:</span>
                    <div className="font-semibold">${parseFloat(selectedChallenge.account_size).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Challenge Type:</span>
                    <div className="font-semibold">{selectedChallenge.challenge_type_id}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Trading Platform:</span>
                    <div className="font-semibold">
                      {selectedChallenge.trading_platform === 'tradingview' ? (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs uppercase">TradingView</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs uppercase">MT5</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Purchased:</span>
                    <div className="font-semibold">{new Date(selectedChallenge.purchase_date || selectedChallenge.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Status:</span>
                    <div className="font-semibold">{selectedChallenge.status}</div>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">MT5 Login *</label>
              <input
                type="text"
                value={formData.mt5_login}
                onChange={(e) => setFormData({ ...formData, mt5_login: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                placeholder="e.g., 1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password *</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.mt5_password}
                  onChange={(e) => setFormData({ ...formData, mt5_password: e.target.value })}
                  required
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mt5_password: generatePassword() })}
                  className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  🎲
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">MT5 Server *</label>
            <input
              type="text"
              value={formData.mt5_server}
              onChange={(e) => setFormData({ ...formData, mt5_server: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              placeholder="e.g., MetaQuotes-Demo"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedChallenge || creating}
              className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {creating ? 'Assigning...' : 'Assign MT5 Credentials'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Reusable Searchable User Dropdown Component
function SearchableUserDropdown({ onSelect, selectedUser, users: propUsers }: { onSelect: (user: any) => void; selectedUser: any; users?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use users from props if available, otherwise empty array
  const users = propUsers || [];

  const filteredUsers = useMemo(() => {
    if (searchTerm.length === 0) {
      return users;
    }
    return users.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.friendly_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:border-electric-blue transition-colors flex items-center justify-between"
      >
        <span className={selectedUser ? 'text-white' : 'text-white/50'}>
          {selectedUser ? `${selectedUser.email} (${selectedUser.friendly_id})` : 'Select a user...'}
        </span>
        <Search size={20} className="text-white/40" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-deep-space border border-white/20 rounded-lg max-h-96 overflow-hidden z-50 shadow-2xl">
          <div className="p-3 border-b border-white/10 sticky top-0 bg-deep-space">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none text-sm"
              autoFocus
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-white/60">Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelect(user);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-all border-b border-white/5 last:border-0"
                >
                 <div className="flex items-center justify-between">
 <div className="font-semibold text-white">{user.email}</div>
 <span className={`px-2 py-0.5 rounded text-xs font-bold ${
 user.source === 'NEW DB'
 ? 'bg-neon-green/20 text-neon-green'
 : 'bg-electric-blue/20 text-electric-blue'
 }`}>
 {user.source}
 </span>
 </div>
                  <div className="text-sm text-white/60 flex items-center gap-2">
                    <span>{user.full_name || 'N/A'}</span>
                    <span>•</span>
                    <span className="font-mono text-xs">ID: {user.friendly_id}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-white/60">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CertificateCard({ icon, title, description, userId }: any) {
  const [sending, setSending] = useState(false);

  const sendCertificate = async () => {
    setSending(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      const { error } = await supabase
        .from('downloads')
        .insert({
          user_id: userId,
          document_type: 'certificate',
          title,
          description,
          document_number: `MANUAL-${Date.now()}`,
          issue_date: new Date().toISOString(),
          status: 'generated',
          auto_generated: false,
          generated_at: new Date().toISOString(),
          download_count: 0
        });

      if (error) throw error;
      alert('Certificate sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send certificate');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10 hover:border-electric-blue/50 transition-all">
      <div className="text-6xl mb-4 text-center">{icon}</div>
      <h4 className="text-lg font-bold mb-2 text-center">{title}</h4>
      <p className="text-white/60 text-sm mb-4 text-center">{description}</p>
      <button
        onClick={sendCertificate}
        disabled={sending}
        className="w-full btn-gradient disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Certificate'}
      </button>
    </div>
  );
}

function MT5AnalyticsTab() {
  const [allUserAnalytics, setAllUserAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);

      // Get all challenges with credentials
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      const { data: challenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select(`
          id,
          user_id,
          challenge_type,
          account_size,
          status,
          trading_account_id,
          trading_account_server,
          credentials_sent,
          start_date,
          user_profile:user_id (
            first_name,
            last_name,
            friendly_id
          )
        `)
        .eq('credentials_sent', true)
        .order('start_date', { ascending: false });

      if (challengesError) throw challengesError;

      if (!challenges || challenges.length === 0) {
        console.log('No challenges with credentials found');
        setAllUserAnalytics([]);
        setLoading(false);
        return;
      }

      // Fetch analytics for each challenge
      const analyticsPromises = challenges.map(async (challenge) => {
        try {
          // Get analytics cache
          if (!supabase) {
            throw new Error('Supabase client is not initialized');
          }
          const { data: analytics } = await supabase
            .from('mt5_analytics_cache')
            .select('*')
            .eq('challenge_id', challenge.id)
            .eq('is_valid', true)
            .maybeSingle();

      // Get latest snapshot
      const { data: snapshot } = await supabase!
        .from('mt5_account_snapshots')
        .select('*')
        .eq('challenge_id', challenge.id)
        .eq('is_latest', true)
        .maybeSingle();

      // Get violations count
      const { data: violations, count: violationsCount } = await supabase!
        .from('mt5_rule_violations')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challenge.id)
        .eq('is_resolved', false);

          return {
            challenge_id: challenge.id,
            user_id: challenge.user_id,
            user_name: challenge.user_profile?.[0]
              ? `${challenge.user_profile[0].first_name || ''} ${challenge.user_profile[0].last_name || ''}`.trim()
              : 'N/A',
            friendly_id: challenge.user_profile?.[0]?.friendly_id || 'N/A',
            challenge_type: challenge.challenge_type,
            account_size: challenge.account_size,
            trading_account_id: challenge.trading_account_id,
            trading_account_server: challenge.trading_account_server,
            status: challenge.status,
            start_date: challenge.start_date,
            analytics: analytics || null,
            snapshot: snapshot || null,
            violations_count: violationsCount || 0
          };
        } catch (error) {
          console.error(`Error fetching analytics for challenge ${challenge.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(analyticsPromises);
      const validResults = results.filter(r => r !== null);

      setAllUserAnalytics(validResults);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAnalytics();
    setRefreshing(false);
  };

  const filteredAnalytics = allUserAnalytics.filter(item =>
    item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.friendly_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.trading_account_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.challenge_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center">
          <div className="loader-spinner"></div>
          <span className="ml-4 text-white/60">Loading MT5 Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">MT5 Account Analytics</h2>
          <p className="text-white/60 mt-1">Real-time monitoring of all active MT5 trading accounts</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-gradient flex items-center space-x-2 disabled:opacity-50"
        >
          <Activity size={18} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Total Accounts</span>
            <Users size={24} className="text-electric-blue" />
          </div>
          <div className="text-3xl font-bold">{allUserAnalytics.length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Active Challenges</span>
            <Target size={24} className="text-neon-green" />
          </div>
          <div className="text-3xl font-bold">
            {allUserAnalytics.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Total Capital</span>
            <DollarSign size={24} className="text-neon-purple" />
          </div>
          <div className="text-3xl font-bold">
            ${allUserAnalytics.reduce((sum, a) => sum + (a.account_size || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Rule Violations</span>
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold">
            {allUserAnalytics.reduce((sum, a) => sum + (a.violations_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search by user name, friendly ID, MT5 login, or challenge type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-electric-blue"
          />
        </div>
      </div>

      {/* Analytics Table */}
      {filteredAnalytics.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-white/60">No MT5 accounts with analytics data found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">MT5 Account</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Challenge Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Account Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Current Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Profit/Loss</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Violations</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredAnalytics.map((item) => {
                  const currentBalance = item.snapshot?.balance || item.analytics?.current_balance || item.account_size;
                  const profitLoss = item.snapshot?.profit_loss || item.analytics?.total_profit_loss || 0;
                  const profitLossPercent = item.snapshot?.profit_loss_percent || item.analytics?.total_profit_loss_percent || 0;
                  const isProfitable = profitLoss >= 0;

                  return (
                    <tr key={item.challenge_id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{item.user_name}</div>
                          <div className="text-sm text-white/60">{item.friendly_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-mono text-sm">{item.trading_account_id}</div>
                          <div className="text-xs text-white/60">{item.trading_account_server}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-xs font-medium">
                          {item.challenge_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${item.account_size.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${currentBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${isProfitable ? 'text-neon-green' : 'text-red-500'}`}>
                          {isProfitable ? '+' : ''}${profitLoss.toFixed(2)}
                          <span className="text-sm ml-1">({profitLossPercent.toFixed(2)}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                          item.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                          'bg-white/20 text-white/60'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.violations_count > 0 ? (
                          <span className="flex items-center space-x-1 text-red-500">
                            <AlertTriangle size={16} />
                            <span className="font-medium">{item.violations_count}</span>
                          </span>
                        ) : (
                          <span className="text-white/40">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedChallenge(item)}
                          className="text-electric-blue hover:text-neon-blue transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
}

function ChallengeDetailModal({ challenge, onClose }: { challenge: any; onClose: () => void }) {
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallengeDetails();
  }, [challenge.challenge_id]);

  const loadChallengeDetails = async () => {
    try {
      setLoading(true);

      // Get recent trades
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      const { data: trades } = await supabase
        .from('mt5_trades')
        .select('*')
        .eq('challenge_id', challenge.challenge_id)
        .order('open_time', { ascending: false })
        .limit(10);

      setRecentTrades(trades || []);

      // Get violations
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      const { data: violationsData } = await supabase
        .from('mt5_rule_violations')
        .select('*')
        .eq('challenge_id', challenge.challenge_id)
        .order('detected_at', { ascending: false });

      setViolations(violationsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading challenge details:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-deep-space/95 backdrop-blur-sm p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-2">Challenge Details</h3>
            <p className="text-white/60">
              {challenge.user_name} - {challenge.trading_account_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <div className="text-white/60 text-sm mb-1">Challenge Type</div>
              <div className="text-xl font-bold">{challenge.challenge_type}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-white/60 text-sm mb-1">Account Size</div>
              <div className="text-xl font-bold">${challenge.account_size.toLocaleString()}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-white/60 text-sm mb-1">Current Balance</div>
              <div className="text-xl font-bold">
                ${(challenge.snapshot?.balance || challenge.analytics?.current_balance || challenge.account_size).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          {challenge.analytics && (
            <div className="glass-card p-6">
              <h4 className="text-lg font-bold mb-4">Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Total Trades</div>
                  <div className="text-xl font-bold">{challenge.analytics.total_trades || 0}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Win Rate</div>
                  <div className="text-xl font-bold">{challenge.analytics.win_rate?.toFixed(1) || 0}%</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Profit Factor</div>
                  <div className="text-xl font-bold">{challenge.analytics.profit_factor?.toFixed(2) || 0}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Max Drawdown</div>
                  <div className="text-xl font-bold text-red-500">{challenge.analytics.max_drawdown?.toFixed(2) || 0}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Trades */}
          <div className="glass-card p-6">
            <h4 className="text-lg font-bold mb-4">Recent Trades</h4>
            {loading ? (
              <div className="text-center py-8 text-white/60">Loading trades...</div>
            ) : recentTrades.length === 0 ? (
              <div className="text-center py-8 text-white/60">No trades recorded yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm">Symbol</th>
                      <th className="px-4 py-2 text-left text-sm">Type</th>
                      <th className="px-4 py-2 text-left text-sm">Volume</th>
                      <th className="px-4 py-2 text-left text-sm">Open Price</th>
                      <th className="px-4 py-2 text-left text-sm">Close Price</th>
                      <th className="px-4 py-2 text-left text-sm">Profit/Loss</th>
                      <th className="px-4 py-2 text-left text-sm">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {recentTrades.map((trade) => (
                      <tr key={trade.id || `${trade.symbol}-${trade.open_time}`}>
                        <td className="px-4 py-2 font-mono text-sm">{trade.symbol}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.trade_type === 'BUY' ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {trade.trade_type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{trade.volume}</td>
                        <td className="px-4 py-2 text-sm">{trade.open_price?.toFixed(5)}</td>
                        <td className="px-4 py-2 text-sm">{trade.close_price?.toFixed(5)}</td>
                        <td className={`px-4 py-2 text-sm font-medium ${
                          trade.profit_loss >= 0 ? 'text-neon-green' : 'text-red-500'
                        }`}>
                          {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-white/60">
                          {new Date(trade.open_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Violations */}
          {violations.length > 0 && (
            <div className="glass-card p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <AlertTriangle size={20} className="text-red-500" />
                <span>Rule Violations</span>
              </h4>
              <div className="space-y-3">
                {violations.map((violation) => (
                  <div key={violation.id || `${violation.rule_type}-${violation.detected_at}`} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-red-500">{violation.rule_type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        violation.severity === 'critical' ? 'bg-red-500 text-white' :
                        violation.severity === 'warning' ? 'bg-yellow-500 text-black' :
                        'bg-white/20 text-white'
                      }`}>
                        {violation.severity}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">{violation.description}</p>
                    <div className="text-xs text-white/60">
                      Detected: {new Date(violation.detected_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CertificatesTab({ users }: { users: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [pendingCertificates, setPendingCertificates] = useState<any[]>([]);
  const [sentHistory, setSentHistory] = useState<any[]>([]);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'manual' | 'history'>('pending');
  const [userAccounts, setUserAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadCertificateData();
  }, [users]);

  useEffect(() => {
    if (selectedUser) {
      loadUserAccounts(selectedUser.id);
    }
  }, [selectedUser]);

  async function loadUserAccounts(userId: string) {
    try {
      if (!supabase) return;

      // Get user challenges from all databases
      const fetchChallenges = async (db: any, dbName: string) => {
        if (!db) return [];
        try {
          const { data, error } = await db
            .from('user_challenges')
            .select('*')
            .eq('user_id', userId)
            .order('purchase_date', { ascending: false });

          if (error) return [];
          return data?.map((c: any) => ({ ...c, _db_source: dbName })) || [];
        } catch (e) {
          return [];
        }
      };

      const [primary, bolt, old] = await Promise.all([
        fetchChallenges(supabase, 'PRIMARY'),
        fetchChallenges(boltSupabase, 'BOLT'),
        fetchChallenges(oldSupabase, 'OLD')
      ]);

      const allChallenges = [...primary, ...bolt, ...old];
      setUserAccounts(allChallenges);
    } catch (error) {
      console.error('Error loading user accounts:', error);
    }
  }

  async function loadCertificateData() {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      // Get all sent certificates and emails
      const [certsResult, emailResult] = await Promise.all([
        supabase
          .from('downloads')
          .select('*')
          .eq('document_type', 'certificate')
          .order('created_at', { ascending: false }),
        supabase
          .from('email_log')
          .select('*')
          .order('sent_at', { ascending: false })
          .limit(100)
      ]);

      if (certsResult.error) throw certsResult.error;
      if (emailResult.error) throw emailResult.error;

      setSentHistory(certsResult.data || []);
      setEmailHistory(emailResult.data || []);

      // Detect pending certificates and emails
      const pending: any[] = [];

      for (const user of users) {
        // Check welcome certificate
        const hasWelcome = (certsResult.data || []).some(
          cert => cert.user_id === user.id && cert.title?.includes('Welcome')
        );

        if (!hasWelcome) {
          pending.push({
            user_id: user.id,
            user_email: user.email,
            user_name: user.full_name || user.email,
            type: 'welcome_certificate',
            title: 'Welcome Certificate',
            reason: 'New user - needs welcome certificate',
            priority: 'high',
            icon: '🎉',
            category: 'certificate'
          });
        }

        // Check for active/passed challenges
        const userChallenges = await loadUserChallenges(user.id);
        for (const challenge of userChallenges) {
          // Challenge started certificate
          if (challenge.status === 'active') {
            const hasStarted = (certsResult.data || []).some(
              cert => cert.user_id === user.id &&
              cert.challenge_id === challenge.id &&
              cert.title?.includes('Challenge Started')
            );

            if (!hasStarted) {
              pending.push({
                user_id: user.id,
                user_email: user.email,
                user_name: user.full_name || user.email,
                type: 'challenge_started_certificate',
                title: 'Challenge Started Certificate',
                reason: `Started ${challenge.challenge_type} - $${challenge.account_size}`,
                priority: 'medium',
                icon: '🚀',
                category: 'certificate',
                challenge_id: challenge.id,
                challenge_type: challenge.challenge_type,
                account_size: challenge.account_size
              });
            }
          }

          // Challenge passed certificate
          if (challenge.status === 'passed') {
            const hasPassed = (certsResult.data || []).some(
              cert => cert.user_id === user.id &&
              cert.challenge_id === challenge.id &&
              cert.title?.includes('Passed')
            );

            if (!hasPassed) {
              pending.push({
                user_id: user.id,
                user_email: user.email,
                user_name: user.full_name || user.email,
                type: 'challenge_passed_certificate',
                title: 'Challenge Passed Certificate',
                reason: `Passed ${challenge.challenge_type} - $${challenge.account_size} 🎉`,
                priority: 'high',
                icon: '🏆',
                category: 'certificate',
                challenge_id: challenge.id,
                challenge_type: challenge.challenge_type,
                account_size: challenge.account_size
              });
            }
          }

          // Challenge started email
          if (challenge.status === 'active' && !challenge.credentials_sent) {
            const hasStartedEmail = (emailResult.data || []).some(
              email => email.user_id === user.id &&
              email.email_type === 'challenge_started' &&
              email.challenge_id === challenge.id
            );

            if (!hasStartedEmail) {
              pending.push({
                user_id: user.id,
                user_email: user.email,
                user_name: user.full_name || user.email,
                type: 'challenge_started_email',
                title: 'Challenge Started Email',
                reason: `Send MT5 credentials for ${challenge.challenge_type}`,
                priority: 'high',
                icon: '📧',
                category: 'email',
                challenge_id: challenge.id,
                challenge_type: challenge.challenge_type,
                account_size: challenge.account_size
              });
            }
          }

          // Breach notification
          if (challenge.status === 'breached') {
            const hasBreachEmail = (emailResult.data || []).some(
              email => email.user_id === user.id &&
              email.email_type === 'breach_notification' &&
              email.challenge_id === challenge.id
            );

            if (!hasBreachEmail) {
              pending.push({
                user_id: user.id,
                user_email: user.email,
                user_name: user.full_name || user.email,
                type: 'breach_notification',
                title: 'Breach Notification',
                reason: `${challenge.challenge_type} account breached - notify user`,
                priority: 'high',
                icon: '⚠️',
                category: 'email',
                challenge_id: challenge.id,
                challenge_type: challenge.challenge_type,
                account_size: challenge.account_size
              });
            }
          }
        }
      }

      setPendingCertificates(pending);
    } catch (error) {
      console.error('Error loading certificate data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserChallenges(userId: string) {
    try {
      const fetchChallenges = async (db: any, dbName: string) => {
        if (!db) return [];
        try {
          const { data, error } = await db
            .from('user_challenges')
            .select('*')
            .eq('user_id', userId);

          if (error) return [];
          return data?.map((c: any) => ({ ...c, _db_source: dbName })) || [];
        } catch (e) {
          return [];
        }
      };

      const [primary, bolt, old] = await Promise.all([
        fetchChallenges(supabase, 'PRIMARY'),
        fetchChallenges(boltSupabase, 'BOLT'),
        fetchChallenges(oldSupabase, 'OLD')
      ]);

      return [...primary, ...bolt, ...old];
    } catch (error) {
      console.error('Error loading user challenges:', error);
      return [];
    }
  }

  async function handleSendCertificate(pendingItem: any) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      let endpoint = '';
      let body: any = {
        user_id: pendingItem.user_id,
        email: pendingItem.user_email,
        name: pendingItem.user_name || pendingItem.user_email
      };

      // Determine endpoint and body based on type
      switch (pendingItem.type) {
        case 'welcome_certificate':
          endpoint = `${API_URL}/certificates/welcome`;
          break;
        case 'challenge_started_certificate':
        case 'challenge_passed_certificate':
          endpoint = `${API_URL}/certificates/challenge-started`;
          body = {
            user_id: pendingItem.user_id,
            email: pendingItem.user_email,
            name: pendingItem.user_name || pendingItem.user_email,
            account_id: pendingItem.challenge_id,
            challenge_type: pendingItem.challenge_type,
            account_size: pendingItem.account_size
          };
          break;
        case 'challenge_started_email':
          endpoint = `${API_URL}/emails/challenge-started`;
          body = {
            user_id: pendingItem.user_id,
            email: pendingItem.user_email,
            name: pendingItem.user_name || pendingItem.user_email,
            challenge_id: pendingItem.challenge_id,
            challenge_type: pendingItem.challenge_type,
            account_size: pendingItem.account_size
          };
          break;
        case 'breach_notification':
          endpoint = `${API_URL}/emails/breach-notification`;
          body = {
            user_id: pendingItem.user_id,
            email: pendingItem.user_email,
            name: pendingItem.user_name || pendingItem.user_email,
            challenge_id: pendingItem.challenge_id,
            challenge_type: pendingItem.challenge_type,
            account_size: pendingItem.account_size
          };
          break;
        default:
          throw new Error('Unknown item type');
      }

      console.log('Sending request to:', endpoint, 'with body:', body);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('API Response:', data);

      if (data.success) {
        alert(`✅ ${pendingItem.category === 'email' ? 'Email' : 'Certificate'} sent successfully to ${pendingItem.user_email}!`);
        loadCertificateData();
      } else {
        alert('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error sending:', error);
      alert(`❌ Failed to send ${pendingItem.category}: ${error.message}`);
    }
  }

  const getEmailTemplates = (user: any, accounts: any[]) => [
    {
      id: 'welcome',
      icon: '🎉',
      title: 'Welcome Email',
      description: 'Send welcome email with certificate',
      type: 'email'
    },
    {
      id: 'challenge_started',
      icon: '🚀',
      title: 'Challenge Started',
      description: 'Send MT5 credentials and challenge info',
      type: 'email',
      requiresAccount: true
    },
    {
      id: 'challenge_passed',
      icon: '🏆',
      title: 'Challenge Passed',
      description: 'Congratulations for passing challenge',
      type: 'email',
      requiresAccount: true
    },
    {
      id: 'breach_notification',
      icon: '⚠️',
      title: 'Breach Notification',
      description: 'Notify user of account breach',
      type: 'email',
      requiresAccount: true
    },
    {
      id: 'payout_notification',
      icon: '💰',
      title: 'Payout Notification',
      description: 'Notify user of successful payout',
      type: 'email'
    },
    {
      id: 'welcome_certificate',
      icon: '📜',
      title: 'Welcome Certificate',
      description: 'Generate welcome certificate',
      type: 'certificate'
    },
    {
      id: 'challenge_certificate',
      icon: '🏅',
      title: 'Challenge Certificate',
      description: 'Generate challenge completion certificate',
      type: 'certificate',
      requiresAccount: true
    }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        <GradientText>Comprehensive Email & Certificate Management</GradientText>
      </h2>
      <p className="text-white/70 mb-8">Send emails and certificates to users, track delivery status</p>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-electric-blue to-neon-purple'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          🔔 Pending ({pendingCertificates.length})
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'manual'
              ? 'bg-gradient-to-r from-electric-blue to-neon-purple'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          ✋ Manual Send
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-electric-blue to-neon-purple'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          📋 History ({sentHistory.length + emailHistory.length})
        </button>
      </div>

      {/* Pending Items Tab */}
      {activeTab === 'pending' && (
        <div>
          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
              <p className="text-white/60">Analyzing pending emails and certificates...</p>
            </div>
          ) : pendingCertificates.length > 0 ? (
            <div className="space-y-4">
              {pendingCertificates.map((item, idx) => (
                <div key={idx} className={`glass-card p-6 border-l-4 ${
                  item.category === 'email' ? 'border-blue-500' : 'border-yellow-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h4 className="text-lg font-bold">{item.title}</h4>
                        <p className="text-white/60 text-sm">{item.user_name} ({item.user_email})</p>
                        <p className="text-white/80 text-sm mt-1">{item.reason}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                          item.category === 'email' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.priority === 'high' ? '🔥 HIGH PRIORITY' : '⚡ MEDIUM'}
                      </span>
                      <button
                        onClick={() => handleSendCertificate(item)}
                        className="px-6 py-2 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform"
                      >
                        📤 Send Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-white/60">No pending emails or certificates to send</p>
            </div>
          )}
        </div>
      )}

      {/* Manual Send Tab */}
      {activeTab === 'manual' && (
        <div>
          <div className="glass-card p-8 mb-6">
            <h3 className="text-xl font-bold mb-4">Select User</h3>
            <SearchableUserDropdown
              onSelect={(user) => {
                setSelectedUser(user);
                setSelectedAccount(null);
              }}
              selectedUser={selectedUser}
              users={users}
            />
          </div>

          {selectedUser && (
            <div className="glass-card p-8 mb-6">
              <h3 className="text-xl font-bold mb-4">Selected User</h3>
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/60 text-sm">Email</div>
                    <div className="font-bold">{selectedUser.email}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Name</div>
                    <div className="font-bold">{selectedUser.full_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">User ID</div>
                    <div className="font-mono text-sm">{selectedUser.id}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Registered</div>
                    <div className="font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Account Selection for account-specific emails */}
              {userAccounts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-4">Select Account (for account-specific emails)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className={`p-4 rounded-lg border transition-all ${
                          selectedAccount?.id === account.id
                            ? 'border-electric-blue bg-electric-blue/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-semibold">{account.challenge_type}</div>
                        <div className="text-sm text-white/60">${account.account_size.toLocaleString()}</div>
                        <div className={`text-xs mt-1 px-2 py-1 rounded ${
                          account.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          account.status === 'passed' ? 'bg-blue-500/20 text-blue-400' :
                          account.status === 'breached' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {account.status.toUpperCase()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-lg font-bold mb-4">Available Email Templates & Certificates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getEmailTemplates(selectedUser, userAccounts).map((template) => (
                  <EmailTemplateCard
                    key={template.id}
                    template={template}
                    user={selectedUser}
                    selectedAccount={selectedAccount}
                    onSend={async () => {
                      try {
                        const API_URL = import.meta.env.VITE_API_URL || '/api';
                        let endpoint = '';
                        let body: any = { user_id: selectedUser.id };

                        switch (template.id) {
                          case 'welcome':
                            endpoint = `${API_URL}/email/welcome`;
                            body = {
                              email: selectedUser.email,
                              name: selectedUser.full_name || selectedUser.email,
                              accountId: 'WELCOME-' + Date.now()
                            };
                            break;
                          case 'challenge_started':
                            if (!selectedAccount) {
                              alert('Please select an account first');
                              return;
                            }
                            endpoint = `${API_URL}/email/challenge-started`;
                            body = {
                              user_id: selectedUser.id,
                              challenge_id: selectedAccount.id,
                              challenge_type: selectedAccount.challenge_type,
                              account_size: selectedAccount.account_size
                            };
                            break;
                          case 'challenge_passed':
                            if (!selectedAccount) {
                              alert('Please select an account first');
                              return;
                            }
                            endpoint = `${API_URL}/email/challenge-passed`;
                            body = {
                              user_id: selectedUser.id,
                              challenge_id: selectedAccount.id,
                              challenge_type: selectedAccount.challenge_type,
                              account_size: selectedAccount.account_size
                            };
                            break;
                          case 'breach_notification':
                            if (!selectedAccount) {
                              alert('Please select an account first');
                              return;
                            }
                            endpoint = `${API_URL}/email/breach-notification`;
                            body = {
                              user_id: selectedUser.id,
                              challenge_id: selectedAccount.id,
                              challenge_type: selectedAccount.challenge_type,
                              account_size: selectedAccount.account_size
                            };
                            break;
                          case 'payout_notification':
                            endpoint = `${API_URL}/email/payout`;
                            body = {
                              email: selectedUser.email,
                              name: selectedUser.full_name || selectedUser.email,
                              amount: '1,000.00',
                              transactionId: 'PAY-' + Date.now(),
                              arrivalTime: '1-3 business days'
                            };
                            break;
                          case 'welcome_certificate':
                            endpoint = `${API_URL}/email/welcome`;
                            body = {
                              email: selectedUser.email,
                              name: selectedUser.full_name || selectedUser.email,
                              accountId: 'WELCOME-' + Date.now()
                            };
                            break;
                          case 'challenge_certificate':
                            if (!selectedAccount) {
                              alert('Please select an account first');
                              return;
                            }
                            endpoint = `${API_URL}/certificates/challenge-started`;
                            body = {
                              user_id: selectedUser.id,
                              account_id: selectedAccount.id,
                              challenge_type: selectedAccount.challenge_type,
                              account_size: selectedAccount.account_size
                            };
                            break;
                        }

                        const res = await fetch(endpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body)
                        });

                        const data = await res.json();

                        if (data.success) {
                          alert(`✅ ${template.type === 'email' ? 'Email' : 'Certificate'} sent successfully!`);
                          loadCertificateData();
                        } else {
                          alert('❌ Failed: ' + data.error);
                        }
                      } catch (error: any) {
                        console.error('Error:', error);
                        alert(`❌ Failed to send ${template.type}: ${error.message}`);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Email History */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">📧 Email History</h3>
            {emailHistory.length > 0 ? (
              <div className="space-y-3">
                {emailHistory.map((email) => (
                  <div key={email.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {email.email_type === 'welcome' ? '🎉' :
                           email.email_type === 'challenge_started' ? '🚀' :
                           email.email_type === 'breach_notification' ? '⚠️' :
                           email.email_type === 'payout_notification' ? '💰' : '📧'}
                        </div>
                        <div>
                          <h4 className="font-bold capitalize">{email.email_type.replace('_', ' ')}</h4>
                          <p className="text-sm text-white/60">To: {email.recipient_email}</p>
                          <p className="text-xs text-white/40 mt-1">
                            Sent: {new Date(email.sent_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          email.status === 'sent' ? 'bg-neon-green/20 text-neon-green' :
                          email.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {email.status?.toUpperCase() || 'SENT'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📧</div>
                <p className="text-white/60">No emails sent yet</p>
              </div>
            )}
          </div>

          {/* Certificate History */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">🏆 Certificate History</h3>
            {sentHistory.length > 0 ? (
              <div className="space-y-3">
                {sentHistory.map((cert) => (
                  <div key={cert.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {cert.title?.includes('Welcome') ? '🎉' :
                           cert.title?.includes('Challenge Started') ? '🚀' :
                           cert.title?.includes('Passed') ? '🏆' : '📄'}
                        </div>
                        <div>
                          <h4 className="font-bold">{cert.title}</h4>
                          <p className="text-sm text-white/60">{cert.description || 'No description'}</p>
                          <p className="text-xs text-white/40 mt-1">
                            Generated: {new Date(cert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-neon-green/20 text-neon-green">
                          ✅ GENERATED
                        </span>
                        <span className="text-sm text-white/60">
                          Downloads: {cert.download_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <p className="text-white/60">No certificates generated yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailTemplateCard({ template, user, selectedAccount, onSend }: any) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (template.requiresAccount && !selectedAccount) {
      alert('Please select an account first');
      return;
    }

    setSending(true);
    try {
      await onSend();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10 hover:border-electric-blue/50 transition-all ${
      template.requiresAccount && !selectedAccount ? 'opacity-50' : ''
    }`}>
      <div className="text-6xl mb-4 text-center">{template.icon}</div>
      <h4 className="text-lg font-bold mb-2 text-center">{template.title}</h4>
      <p className="text-white/60 text-sm mb-4 text-center">{template.description}</p>
      {template.requiresAccount && (
        <div className="text-xs text-center mb-4 text-yellow-400">
          Requires account selection
        </div>
      )}
      <button
        onClick={handleSend}
        disabled={sending || (template.requiresAccount && !selectedAccount)}
        className="w-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? 'Sending...' : `Send ${template.type === 'email' ? 'Email' : 'Certificate'}`}
      </button>
    </div>
  );
}


function CompetitionsTab({ users }: { users: any[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCompetition = () => {
    setShowCreateModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <GradientText>Trading Competitions</GradientText>
          </h2>
          <p className="text-white/70">Create and manage trading competitions</p>
        </div>
        <button
          onClick={handleCreateCompetition}
          className="btn-gradient flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Competition</span>
        </button>
      </div>

      <div className="glass-card p-8 text-center">
        <Trophy size={64} className="mx-auto mb-4 text-white/30" />
        <h3 className="text-xl font-bold mb-2">No Competitions Yet</h3>
        <p className="text-white/60 mb-6">Create your first trading competition to engage your traders</p>
        <button
          onClick={handleCreateCompetition}
          className="btn-gradient"
        >
          Create First Competition
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-6">
              <GradientText>Create Trading Competition</GradientText>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Competition Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  placeholder="e.g., Monthly Trading Championship"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prize Pool</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none resize-none"
                  placeholder="Enter competition details and rules..."
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={() => {
                    alert('Competition creation functionality will be implemented with backend integration');
                    setShowCreateModal(false);
                  }}
                  className="flex-1 btn-gradient py-3"
                >
                  Create Competition
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserProfilesTab({ users, accounts }: { users: any[]; accounts: MT5Account[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [userCertificates, setUserCertificates] = useState<any[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      loadUserCompleteProfile(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUserCompleteProfile = async (userId: string) => {
    try {
      setLoading(true);

      // Load complete user profile from all databases
      const fetchUserProfile = async (db: any, dbName: string) => {
        if (!db) return null;
        try {
          const { data, error } = await db
            .from('user_profile')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error(`Error fetching profile from ${dbName}:`, error.message);
            return null;
          }
          return data;
        } catch (e) {
          console.error(`Exception fetching profile from ${dbName}:`, e);
          return null;
        }
      };

      const [primaryProfile, boltProfile, oldProfile] = await Promise.all([
        fetchUserProfile(supabaseAdmin, 'Primary DB'),
        fetchUserProfile(boltSupabase, 'Bolt DB'),
        fetchUserProfile(oldSupabase, 'Old DB')
      ]);

      // Merge profiles, preferring non-null values
      const mergedProfile = { ...primaryProfile, ...boltProfile, ...oldProfile };
      setUserProfile(mergedProfile);

      // Load user challenges from all databases
      const fetchUserChallenges = async (db: any, dbName: string) => {
        if (!db) return [];
        try {
          const { data, error } = await db
            .from('user_challenges')
            .select('*')
            .eq('user_id', userId)
            .order('purchase_date', { ascending: false });

          if (error) {
            console.error(`Error fetching challenges from ${dbName}:`, error.message);
            return [];
          }
          return data?.map((c: any) => ({ ...c, _db_source: dbName })) || [];
        } catch (e) {
          console.error(`Exception fetching challenges from ${dbName}:`, e);
          return [];
        }
      };

      const [primaryChallenges, boltChallenges, oldChallenges] = await Promise.all([
        fetchUserChallenges(supabase, 'PRIMARY'),
        fetchUserChallenges(boltSupabase, 'BOLT'),
        fetchUserChallenges(oldSupabase, 'OLD')
      ]);

      const allChallenges = [...primaryChallenges, ...boltChallenges, ...oldChallenges];
      setUserChallenges(allChallenges);

      // Load user certificates/downloads
      if (supabase) {
        const { data: certificates } = await supabase
          .from('downloads')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        setUserCertificates(certificates || []);
      }

      // Load user accounts (from the accounts prop, filtered by user)
      const userAccountsData = accounts.filter(acc => acc.user_id === userId);
      setUserAccounts(userAccountsData);

      // Load user analytics summary
      if (supabase && userAccountsData.length > 0) {
        const analyticsPromises = userAccountsData.map(async (account) => {
          try {
            const { data: analytics } = await supabase
              .from('mt5_analytics_cache')
              .select('*')
              .eq('challenge_id', account.account_id)
              .eq('is_valid', true)
              .maybeSingle();

            return analytics;
          } catch (error) {
            console.error('Error loading analytics for account:', account.account_id, error);
            return null;
          }
        });

        const analyticsResults = await Promise.all(analyticsPromises);
        const validAnalytics = analyticsResults.filter(a => a !== null);

        // Aggregate analytics
        if (validAnalytics.length > 0) {
          const totalTrades = validAnalytics.reduce((sum, a) => sum + (a.total_trades || 0), 0);
          const totalProfitLoss = validAnalytics.reduce((sum, a) => sum + (a.total_profit_loss || 0), 0);
          const avgWinRate = validAnalytics.reduce((sum, a) => sum + (a.win_rate || 0), 0) / validAnalytics.length;

          setUserAnalytics({
            total_trades: totalTrades,
            total_profit_loss: totalProfitLoss,
            avg_win_rate: avgWinRate,
            accounts_count: userAccountsData.length
          });
        }
      }

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-neon-green';
      case 'passed': return 'text-blue-400';
      case 'failed': return 'text-red-500';
      case 'breached': return 'text-red-600';
      case 'funded': return 'text-purple-400';
      default: return 'text-white/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '🟢';
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'breached': return '💀';
      case 'funded': return '💰';
      default: return '⚪';
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        <GradientText>User Profile 360°</GradientText>
      </h2>
      <p className="text-white/70 mb-8">Complete user information, trading history, and account details</p>

      <div className="glass-card p-8 mb-6">
        <h3 className="text-xl font-bold mb-4">Select User</h3>
        <SearchableUserDropdown
          onSelect={setSelectedUser}
          selectedUser={selectedUser}
          users={users}
        />
      </div>

      {selectedUser && (
        <div className="space-y-6">
          {/* User Overview */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{selectedUser.email}</h3>
              <div className="text-sm text-white/60">
                User ID: <span className="font-mono">{selectedUser.id.slice(0, 16)}...</span>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Full Name</div>
                <div className="font-bold">{userProfile?.first_name || userProfile?.last_name ?
                  `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() :
                  selectedUser.full_name || 'N/A'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Friendly ID</div>
                <div className="font-mono text-sm">{userProfile?.friendly_id || selectedUser.friendly_id || 'N/A'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Registered</div>
                <div className="font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Total Challenges</div>
                <div className="font-bold text-electric-blue">{userChallenges.length}</div>
              </div>
            </div>

            {/* Additional Profile Info */}
            {userProfile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {userProfile.phone && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-white/60 text-sm mb-1">Phone</div>
                    <div className="font-bold">{userProfile.phone}</div>
                  </div>
                )}
                {userProfile.country && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-white/60 text-sm mb-1">Country</div>
                    <div className="font-bold">{userProfile.country}</div>
                  </div>
                )}
                {userProfile.date_of_birth && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-white/60 text-sm mb-1">Date of Birth</div>
                    <div className="font-bold">{new Date(userProfile.date_of_birth).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Summary */}
            {userAnalytics && (
              <div className="bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 rounded-lg p-6 border border-electric-blue/20">
                <h4 className="text-lg font-bold mb-4 text-electric-blue">📊 Trading Analytics Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-white/60 text-sm">Total Trades</div>
                    <div className="text-xl font-bold">{userAnalytics.total_trades || 0}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Total P/L</div>
                    <div className={`text-xl font-bold ${userAnalytics.total_profit_loss >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                      {userAnalytics.total_profit_loss >= 0 ? '+' : ''}${userAnalytics.total_profit_loss?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Avg Win Rate</div>
                    <div className="text-xl font-bold">{userAnalytics.avg_win_rate?.toFixed(1) || 0}%</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Active Accounts</div>
                    <div className="text-xl font-bold">{userAnalytics.accounts_count || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Challenge History */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">🎯 Challenge History</h3>
            {loading ? (
              <div className="text-center py-8 text-white/60">Loading challenge history...</div>
            ) : userChallenges.length > 0 ? (
              <div className="space-y-4">
                {userChallenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getStatusIcon(challenge.status)}</span>
                        <div>
                          <div className="font-bold">{challenge.challenge_type || 'Unknown'} - ${parseFloat(challenge.account_size).toLocaleString()}</div>
                          <div className="text-sm text-white/60">ID: {challenge.id.slice(0, 8)} • DB: {challenge._db_source}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(challenge.status)} bg-current/20`}>
                        {challenge.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Purchased:</span>
                        <div className="font-semibold">{challenge.purchase_date ? new Date(challenge.purchase_date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Amount Paid:</span>
                        <div className="font-semibold">${parseFloat(challenge.amount_paid || 0).toFixed(2)}</div>
                      </div>
                      {challenge.trading_account_id && (
                        <div>
                          <span className="text-white/60">MT5 Login:</span>
                          <div className="font-mono text-xs">{challenge.trading_account_id}</div>
                        </div>
                      )}
                      {challenge.start_date && (
                        <div>
                          <span className="text-white/60">Started:</span>
                          <div className="font-semibold">{new Date(challenge.start_date).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>

                    {challenge.admin_note && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                        <div className="text-red-400 text-sm font-semibold">Admin Note:</div>
                        <div className="text-white/80 text-sm">{challenge.admin_note}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">No challenges found for this user</div>
            )}
          </div>

          {/* Active Accounts */}
          {userAccounts.length > 0 && (
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">💼 Active MT5 Accounts</h3>
              <div className="space-y-4">
                {userAccounts.map((account) => (
                  <div key={account.account_id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold">MT5: {account.mt5_login}</div>
                        <div className="text-sm text-white/60">{account.account_type} • ${parseFloat(account.account_size).toLocaleString()}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(account.status)} bg-current/20`}>
                        {account.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Server:</span>
                        <div className="font-mono text-xs">{account.mt5_server}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Current Balance:</span>
                        <div className="font-semibold">${Number(account.current_balance || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Credentials Sent:</span>
                        <div className="font-semibold">{account.is_sent ? '✅ Yes' : '❌ No'}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Created:</span>
                        <div className="font-semibold">{new Date(account.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates & Downloads */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">🏆 Certificates & Downloads</h3>
            {userCertificates.length > 0 ? (
              <div className="space-y-3">
                {userCertificates.map((cert) => (
                  <div key={cert.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {cert.document_type === 'certificate' ? '🏆' : '📄'}
                        </span>
                        <div>
                          <div className="font-bold">{cert.title}</div>
                          <div className="text-sm text-white/60">{cert.description || 'No description'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">Downloads: {cert.download_count || 0}</div>
                        <div className="text-xs text-white/40">{new Date(cert.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">No certificates or downloads found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ManualBreachTab({ users, accounts }: { users: any[]; accounts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [breachReason, setBreachReason] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'breached'>('active');

  const handleBreach = async () => {
    if (!selectedAccount || !breachReason) {
      alert('Please select an account and provide a reason for the breach.');
      return;
    }

    if (window.confirm(`Are you sure you want to breach account ${selectedAccount.mt5_login}? This action can be reverted later.`)) {
      try {
        const response = await api.breachAccount(selectedAccount.account_id, breachReason, selectedAccount._db_source);
        if (response.success) {
          alert('Account breached successfully.');
          setSelectedAccount(null);
          setBreachReason('');
          // Refresh the page to update the account list
          window.location.reload();
        } else {
          throw new Error(response.error || 'Failed to breach account.');
        }
      } catch (error: any) {
        console.error('Error breaching account:', error);
        alert(`Failed to breach account: ${error.message}`);
      }
    }
  };

  const handleUnbreach = async () => {
    if (!selectedAccount) {
      alert('Please select an account to unbreach.');
      return;
    }

    if (window.confirm(`Are you sure you want to unbreach account ${selectedAccount.mt5_login}? This will restore the account to active status.`)) {
      try {
        // Update the challenge status back to active
        let dbClient = supabase;
        if (selectedAccount._db_source === 'BOLT') dbClient = boltSupabase;
        else if (selectedAccount._db_source === 'OLD') dbClient = oldSupabase;

        if (!dbClient) {
          throw new Error(`Database client for ${selectedAccount._db_source} is not initialized`);
        }

        const { error } = await dbClient
          .from('user_challenges')
          .update({
            status: 'active',
            admin_note: null
          })
          .eq('id', selectedAccount.account_id);

        if (error) throw error;

        alert('Account unbreached successfully.');
        setSelectedAccount(null);
        // Refresh the page to update the account list
        window.location.reload();
      } catch (error: any) {
        console.error('Error unbreaching account:', error);
        alert(`Failed to unbreach account: ${error.message}`);
      }
    }
  };

  const userAccounts = useMemo(() => {
    if (!selectedUser) return [];
    return accounts?.filter((acc: any) => acc.user_id === selectedUser.id) || [];
  }, [selectedUser, accounts]);

  const activeAccounts = useMemo(() => {
    return userAccounts.filter((acc: any) => acc.status !== 'breached');
  }, [userAccounts]);

  const breachedAccounts = useMemo(() => {
    return userAccounts.filter((acc: any) => acc.status === 'breached');
  }, [userAccounts]);

  const currentAccounts = activeSubTab === 'active' ? activeAccounts : breachedAccounts;

  const filteredUserAccounts = useMemo(() => {
    if (searchTerm.length === 0) {
      return currentAccounts;
    }
    return currentAccounts.filter((acc: any) =>
      acc.mt5_login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, currentAccounts]);

  return (
    <div>
      <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={24} className="text-red-500" />
          <h2 className="text-2xl font-bold text-red-500">Manual Account Breach Management</h2>
        </div>
        <p className="text-white/70">Manage account breaches and reversals</p>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => {
            setActiveSubTab('active');
            setSelectedAccount(null);
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-semibold transition-all ${
            activeSubTab === 'active'
              ? 'border-b-2 border-electric-blue text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Active Accounts ({activeAccounts.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('breached');
            setSelectedAccount(null);
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-semibold transition-all ${
            activeSubTab === 'breached'
              ? 'border-b-2 border-red-500 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Breached Accounts ({breachedAccounts.length})
        </button>
      </div>

      <div className="glass-card p-8 mb-6">
        <h3 className="text-xl font-bold mb-4">Select User First</h3>
        <SearchableUserDropdown
          onSelect={(user) => {
            setSelectedUser(user);
            setSelectedAccount(null); // Reset selected account when user changes
            setSearchTerm(''); // Reset search term
          }}
          selectedUser={selectedUser}
          users={users}
        />
      </div>

      {selectedUser && (
        <div className="glass-card p-8 mb-6">
          <h3 className="text-xl font-bold mb-4">
            {activeSubTab === 'active' ? 'Active' : 'Breached'} Accounts for {selectedUser.email}
          </h3>

          {currentAccounts.length === 0 ? (
            <div className={`border rounded-lg p-6 text-center ${
              activeSubTab === 'active'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <AlertTriangle size={48} className={`mx-auto mb-3 ${
                activeSubTab === 'active' ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <h4 className={`font-bold mb-2 ${
                activeSubTab === 'active' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                No {activeSubTab === 'active' ? 'Active' : 'Breached'} Accounts Found
              </h4>
              <p className="text-white/60 text-sm">
                {activeSubTab === 'active'
                  ? 'This user has no active MT5 accounts to breach.'
                  : 'This user has no breached accounts to manage.'
                }
              </p>
            </div>
          ) : (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeSubTab} accounts...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none ${
                    activeSubTab === 'breached' ? 'focus:border-red-500' : 'focus:border-electric-blue'
                  }`}
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredUserAccounts.map((account: any) => (
                  <button
                    key={account.account_id}
                    onClick={() => setSelectedAccount(account)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                      selectedAccount?.account_id === account.account_id
                        ? activeSubTab === 'breached'
                          ? 'bg-red-500/20 border-red-500'
                          : 'bg-electric-blue/20 border-electric-blue'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{account.user_email}</div>
                        <div className="text-sm text-white/60">
                          MT5: {account.mt5_login} - ${parseFloat(account.account_size).toLocaleString()} - {account.account_type}
                        </div>
                      </div>
                      {account.status === 'breached' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-400 border-2 border-red-600/70">
                          ☠️ BREACHED
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedUser && (
        selectedAccount ? (
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">
              {activeSubTab === 'active' ? 'Breach' : 'Unbreach'} Account
            </h3>

            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-white/60 text-sm">User</div>
                  <div className="font-bold">{selectedAccount.user_email}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">MT5 Login</div>
                  <div className="font-bold">{selectedAccount.mt5_login}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Account Size</div>
                  <div className="font-bold">${parseFloat(selectedAccount.account_size).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Status</div>
                  <div className={`font-bold ${
                    selectedAccount.status === 'active' ? 'text-neon-green' :
                    selectedAccount.status === 'breached' ? 'text-red-500' : 'text-white/70'
                  }`}>
                    {selectedAccount.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {activeSubTab === 'active' ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-red-500">Breach This Account</h4>
                <p className="text-white/60 mb-4">Enter the reason for breaching the account:</p>
                <textarea
                  value={breachReason}
                  onChange={(e) => setBreachReason(e.target.value)}
                  placeholder="e.g., Exceeded max daily loss limit."
                  className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-red-500 focus:outline-none text-sm mb-4"
                />
                <button
                  onClick={handleBreach}
                  disabled={!breachReason.trim()}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Breach Account
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-green-500">Unbreach This Account</h4>
                <p className="text-white/60 mb-4">This will restore the account to active status and remove the breach reason.</p>
                <button
                  onClick={handleUnbreach}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-all"
                >
                  Unbreach Account
                </button>
              </div>
            )}
          </div>
        ) : (
          selectedUser && currentAccounts.length > 0 && (
            <div className="glass-card p-12 text-center">
              <AlertTriangle size={64} className="mx-auto mb-4 text-white/30" />
              <h3 className="text-xl font-bold mb-2">No Account Selected</h3>
              <p className="text-white/60">
                Select an account from the list above to {activeSubTab === 'active' ? 'breach' : 'unbreach'} it
              </p>
            </div>
          )
        )
      )}
    </div>
  );
}

function AffiliatesManagementTab({ users }: { users: any[] }) {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'assign'>('overview');

  // Assign tab state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [assigning, setAssigning] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadAffiliateData();
    // No need to load adminUsers anymore, we now use the users prop passed from parent
  }, [activeSubTab]);

  async function loadAffiliateData() {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      // Fetch affiliates
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (affiliatesError) throw affiliatesError;

      // Fetch payouts from correct table
      try {
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('payouts_affiliate')
          .select('*')
          .order('requested_at', { ascending: false });

        if (!payoutsError) {
          setPayouts(payoutsData || []);
        }
      } catch (e) {
        console.warn('payouts_affiliate table may not exist', e.message);
        setPayouts([]);
      }

      setAffiliates(affiliatesData || []);
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminUsers() {
    try {
      const response = await api.getAdminUsers();
      if (response.success) {
        // Admin users are now passed from parent component
      }
    } catch (error: any) {
      console.error('Error loading admin users:', error);
    }
  }

  async function handleAssignAffiliateCode() {
    if (!selectedUser || !affiliateCode.trim()) {
      alert('Please select a user and enter an affiliate code');
      return;
    }

    setAssigning(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      console.log('🚀 Assigning affiliate code to user...');

      const response = await fetch(`${apiUrl}/affiliates/admin/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          affiliate_code: affiliateCode.trim().toUpperCase(),
          commission_rate: commissionRate,
          admin_assigned: true
        })
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to assign affiliate code');
      }

      console.log('✅ Affiliate code assigned successfully:', result);

      alert(`✅ Affiliate code "${affiliateCode}" assigned successfully to ${selectedUser.email}!`);

      // Clear form first
      setSelectedUser(null);
      setAffiliateCode('');
      setCommissionRate(10);

      // Wait a brief moment for database consistency, then refresh
      setTimeout(() => {
        loadAffiliateData();
      }, 500);

    } catch (error: any) {
      console.error('❌ Error assigning affiliate code:', error);
      const errorMsg = error.message || 'Unknown error occurred';
      alert(`❌ Failed to assign affiliate code:\n\n${errorMsg}\n\nPlease check the console for details or contact support.`);
    } finally {
      setAssigning(false);
    }
  }

  async function handleSendNotification() {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await api.sendAffiliateNotification(selectedUser.id);

      if (response.success) {
        alert(`✅ Affiliate code notification sent successfully to ${selectedUser.email}!`);
      } else {
        throw new Error(response.error || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      alert(`❌ Failed to send notification: ${error.message}`);
    } finally {
      setSendingEmail(false);
    }
  }

  async function handlePayoutAction(payoutId: string, action: 'approve' | 'reject') {
    try {
      const newStatus = action === 'approve' ? 'processing' : 'rejected';

      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      const { error } = await supabase
        .from('payouts_affiliate')
        .update({
          status: newStatus,
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutId);

      if (error) throw error;

      alert(`Payout ${action}d successfully!`);
      loadAffiliateData();
    } catch (error) {
      console.error('Error updating payout:', error);
      alert('Failed to update payout');
    }
  }

  const filteredAffiliates = affiliates.filter(aff =>
    aff.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aff.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const totalEarnings = affiliates.reduce((sum, aff) => sum + (aff.total_earnings || 0), 0);
  const totalPaid = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            <GradientText>Affiliate Management</GradientText>
          </h2>
          <p className="text-white/60">Manage affiliates, assign codes, and handle payouts</p>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
              : 'bg-white/10 hover:bg-white/20 text-white/70'
          }`}
        >
          Overview & Payouts
        </button>
        <button
          onClick={() => setActiveSubTab('assign')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeSubTab === 'assign'
              ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
              : 'bg-white/10 hover:bg-white/20 text-white/70'
          }`}
        >
          Assign Affiliate Codes
        </button>
      </div>

      {activeSubTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="text-sm text-white/60 mb-2">Total Affiliates</div>
              <div className="text-3xl font-bold text-electric-blue">{affiliates.length}</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-sm text-white/60 mb-2">Pending Payouts</div>
              <div className="text-3xl font-bold text-yellow-400">{pendingPayouts.length}</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-sm text-white/60 mb-2">Total Earnings</div>
              <div className="text-3xl font-bold text-neon-green">${totalEarnings.toFixed(2)}</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-sm text-white/60 mb-2">Total Paid</div>
              <div className="text-3xl font-bold text-neon-purple">${totalPaid.toFixed(2)}</div>
            </div>
          </div>

          {/* Pending Payouts */}
          {pendingPayouts.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Pending Payout Requests</h3>
              <div className="space-y-4">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-yellow-500/30">
                    <div>
                      <div className="font-semibold">${payout.amount.toFixed(2)}</div>
                      <div className="text-sm text-white/60">
                        Affiliate: {payout.affiliates?.referral_code || 'Unknown'}
                      </div>
                      <div className="text-xs text-white/40">
                        Requested: {new Date(payout.requested_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePayoutAction(payout.id, 'approve')}
                        className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handlePayoutAction(payout.id, 'reject')}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affiliates List */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">All Affiliates</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  placeholder="Search by code or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-white/60">Loading affiliates...</div>
            ) : filteredAffiliates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold">Affiliate Code</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold">User</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold">Status</th>
                      <th className="text-right py-3 px-4 text-white/60 font-semibold">Referrals</th>
                      <th className="text-right py-3 px-4 text-white/60 font-semibold">Total Earnings</th>
                      <th className="text-right py-3 px-4 text-white/60 font-semibold">Available</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAffiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 font-mono text-sm">{affiliate.referral_code}</td>
                        <td className="py-3 px-4 text-sm">{affiliate.commission_rate}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            affiliate.status === 'active' ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {affiliate.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{affiliate.total_referrals || 0}</td>
                        <td className="py-3 px-4 text-right font-semibold text-neon-green">
                          ${(affiliate.total_earnings || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-electric-blue">
                          ${(affiliate.available_balance || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-white/60">
                          {new Date(affiliate.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <Users size={64} className="mx-auto mb-4 opacity-30" />
                <p>No affiliates found</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeSubTab === 'assign' && (
        <div className="space-y-6">
          {/* Assign Affiliate Code */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">
              <GradientText>Assign New Affiliate Code</GradientText>
            </h3>
            <p className="text-white/60 mb-6">Select a user and assign them an affiliate code with custom commission rate</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Selection */}
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4">Select User</h4>
                <SearchableUserDropdown
                  onSelect={setSelectedUser}
                  selectedUser={selectedUser}
                  users={users.filter(user => !affiliates.some(aff => aff.user_id === user.id))}
                />
                {selectedUser && (
                  <div className="mt-4 p-4 bg-electric-blue/10 border border-electric-blue/30 rounded-lg">
                    <div className="font-semibold">{selectedUser.email}</div>
                    <div className="text-sm text-white/60">{selectedUser.full_name}</div>
                  </div>
                )}
              </div>

              {/* Affiliate Code Setup */}
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4">Affiliate Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Affiliate Code *</label>
                    <input
                      type="text"
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                      placeholder="Enter unique code (e.g., JOHN25)"
                      className="w-full px-4 py-3 bg-deep-space border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none font-mono"
                    />
                    <p className="text-xs text-white/60 mt-1">Must be unique, letters and numbers only</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-deep-space border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                    />
                    <p className="text-xs text-white/60 mt-1">Percentage of referral purchases</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center space-x-4 pt-6 border-t border-white/10 mt-6">
              <button
                onClick={handleSendNotification}
                disabled={!selectedUser || sendingEmail}
                className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Send size={18} />
                <span>{sendingEmail ? 'Sending...' : 'Send Notification Email'}</span>
              </button>
              <button
                onClick={handleAssignAffiliateCode}
                disabled={!selectedUser || !affiliateCode.trim() || assigning}
                className="btn-gradient disabled:opacity-50 flex items-center space-x-2"
              >
                <span>{assigning ? 'Assigning...' : 'Assign Affiliate Code'}</span>
              </button>
            </div>
          </div>

          {/* Users Without Affiliate Codes */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Recent Users (No Affiliate Code)</h3>
            <p className="text-white/60 mb-6">Users who can be assigned affiliate codes</p>

            {users.filter(user =>
              !affiliates.some(aff => aff.user_id === user.id)
            ).length === 0 ? (
              <div className="text-center py-8 text-white/60">
                All users already have affiliate codes assigned
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.filter(user =>
                  !affiliates.some(aff => aff.user_id === user.id)
                ).slice(0, 10).map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                      selectedUser?.id === user.id
                        ? 'border-electric-blue bg-electric-blue/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{user.email}</div>
                        <div className="text-sm text-white/60">{user.full_name || 'No name'}</div>
                      </div>
                      <div className="text-sm text-white/60">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserDetailsTab({ users, accounts }: { users: any[]; accounts: MT5Account[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByAddOn, setFilterByAddOn] = useState<'all' | 'with-addon' | 'without-addon'>('all');

  useEffect(() => {
    if (selectedUser) {
      loadUserDetails(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUserDetails = async (userId: string) => {
    try {
      setLoading(true);

      // Load user details from competition_user_details table
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { data: details, error } = await supabase
        .from('competition_user_details')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading user details:', error);
      }

      // Map the database fields to the expected format
      const mappedDetails = details ? {
        id: details.id,
        user_id: details.user_id,
        full_name: details.full_name || '',
        email: details.email || '',
        phone: details.phone || '',
        country: details.country || '',
        why_join_competition: details.why_join_competition || '',
        why_hire_me: details.why_hire_me || '',
        experience_level: details.experience_level || '',
        instagram_link: details.instagram,
        twitter_link: details.twitter,
        youtube_link: details.youtube,
        linkedin_link: details.linkedin,
        facebook_link: details.facebook,
        other_social_link: details.other_social,
        video_url: details.video_intro_url,
        video_description: details.video_description || '',
        written_introduction: details.written_intro,
        screenshot_urls: details.proof_screenshots || [],
        trading_experience: details.trading_experience || '',
        preferred_markets: details.preferred_markets || '',
        risk_tolerance: details.risk_tolerance || '',
        available_hours: details.available_hours || '',
        additional_notes: details.additional_notes || '',
        created_at: details.submitted_at,
        updated_at: details.updated_at
      } : null;

      setUserDetails(mappedDetails);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.friendly_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterByAddOn === 'with-addon') {
      filtered = filtered.filter(user => {
        const userAccount = accounts.find(acc => acc.user_id === user.id);
        return userAccount && userAccount.account_size > 100000; // Assuming add-on accounts are larger
      });
    } else if (filterByAddOn === 'without-addon') {
      filtered = filtered.filter(user => {
        const userAccount = accounts.find(acc => acc.user_id === user.id);
        return !userAccount || userAccount.account_size <= 100000;
      });
    }

    return filtered;
  }, [users, accounts, searchTerm, filterByAddOn]);

  const getUserAccount = (userId: string) => {
    return accounts.find(acc => acc.user_id === userId);
  };

  const hasAddOn = (userId: string) => {
    const account = getUserAccount(userId);
    return account && account.account_size > 100000; // Assuming add-on accounts are larger
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <GradientText>User Details Management</GradientText>
          </h2>
          <p className="text-white/60">View and manage user-submitted details, social media links, and competition profiles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterByAddOn('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterByAddOn === 'all'
                  ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setFilterByAddOn('with-addon')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterByAddOn === 'with-addon'
                  ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              With Add-on ({users.filter(u => hasAddOn(u.id)).length})
            </button>
            <button
              onClick={() => setFilterByAddOn('without-addon')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterByAddOn === 'without-addon'
                  ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              Without Add-on ({users.filter(u => !hasAddOn(u.id)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Users ({filteredUsers.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => {
            const account = getUserAccount(user.id);
            const userHasAddOn = hasAddOn(user.id);

            return (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                  selectedUser?.id === user.id
                    ? 'border-electric-blue bg-electric-blue/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold">{user.email}</div>
                      <div className="text-sm text-white/60 flex items-center gap-2">
                        <span>{user.full_name || 'N/A'}</span>
                        <span>•</span>
                        <span>ID: {user.friendly_id}</span>
                        {account && (
                          <>
                            <span>•</span>
                            <span>${Number(account.account_size).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {userHasAddOn && (
                      <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded text-xs font-bold">
                        ADD-ON
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      userDetails ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {userDetails ? 'DETAILS' : 'NO DETAILS'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Details */}
      {selectedUser && (
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{selectedUser.email}</h3>
            <div className="flex items-center gap-2">
              {hasAddOn(selectedUser.id) && (
                <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-lg text-sm font-bold">
                  HAS ADD-ON
                </span>
              )}
              <span className="text-sm text-white/60">
                User ID: {selectedUser.id.slice(0, 16)}...
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/60">Loading user details...</div>
          ) : userDetails ? (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-lg font-bold mb-4 text-electric-blue">📋 Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 text-sm">Full Name:</span>
                      <div className="font-semibold">{userDetails.full_name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Email:</span>
                      <div className="font-semibold">{userDetails.email || selectedUser.email}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Phone:</span>
                      <div className="font-semibold">{userDetails.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Country:</span>
                      <div className="font-semibold">{userDetails.country || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-lg font-bold mb-4 text-neon-purple">🎯 Competition Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 text-sm">Why Join Competition:</span>
                      <div className="font-semibold mt-1">{userDetails.why_join_competition || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Why Hire Me:</span>
                      <div className="font-semibold mt-1">{userDetails.why_hire_me || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Experience Level:</span>
                      <div className="font-semibold">{userDetails.experience_level || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-neon-green">🔗 Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userDetails.instagram_link && (
                    <a
                      href={userDetails.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg hover:from-pink-500/30 hover:to-purple-500/30 transition-all"
                    >
                      <span className="text-2xl">📷</span>
                      <div>
                        <div className="font-semibold">Instagram</div>
                        <div className="text-sm text-white/60">View Profile</div>
                      </div>
                    </a>
                  )}
                  {userDetails.twitter_link && (
                    <a
                      href={userDetails.twitter_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all"
                    >
                      <span className="text-2xl">🐦</span>
                      <div>
                        <div className="font-semibold">Twitter</div>
                        <div className="text-sm text-white/60">View Profile</div>
                      </div>
                    </a>
                  )}
                  {userDetails.linkedin_link && (
                    <a
                      href={userDetails.linkedin_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-all"
                    >
                      <span className="text-2xl">💼</span>
                      <div>
                        <div className="font-semibold">LinkedIn</div>
                        <div className="text-sm text-white/60">View Profile</div>
                      </div>
                    </a>
                  )}
                  {userDetails.youtube_link && (
                    <a
                      href={userDetails.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <span className="text-2xl">📺</span>
                      <div>
                        <div className="font-semibold">YouTube</div>
                        <div className="text-sm text-white/60">View Channel</div>
                      </div>
                    </a>
                  )}
                  {userDetails.tiktok_link && (
                    <a
                      href={userDetails.tiktok_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-all"
                    >
                      <span className="text-2xl">🎵</span>
                      <div>
                        <div className="font-semibold">TikTok</div>
                        <div className="text-sm text-white/60">View Profile</div>
                      </div>
                    </a>
                  )}
                  {userDetails.other_social_link && (
                    <a
                      href={userDetails.other_social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-500/20 rounded-lg hover:bg-gray-500/30 transition-all"
                    >
                      <span className="text-2xl">🔗</span>
                      <div>
                        <div className="font-semibold">Other</div>
                        <div className="text-sm text-white/60">View Profile</div>
                      </div>
                    </a>
                  )}
                </div>
                {(!userDetails.instagram_link && !userDetails.twitter_link && !userDetails.linkedin_link &&
                  !userDetails.youtube_link && !userDetails.tiktok_link && !userDetails.other_social_link) && (
                  <div className="text-center py-8 text-white/60">
                    No social media links provided
                  </div>
                )}
              </div>

              {/* Screenshots */}
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-orange-400">📸 Screenshots (Proof of Following)</h4>
                {userDetails.screenshot_urls && userDetails.screenshot_urls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userDetails.screenshot_urls.map((url: string, index: number) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4">
                        <img
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                        <div className="text-sm text-white/60">Screenshot {index + 1}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    No screenshots uploaded
                  </div>
                )}
              </div>

              {/* Video Introduction */}
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-red-400">🎬 Video Introduction</h4>
                {userDetails.video_url ? (
                  <div className="max-w-2xl">
                    <video
                      controls
                      className="w-full rounded-lg"
                      poster="/video-poster.png"
                    >
                      <source src={userDetails.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="mt-4">
                      <h5 className="font-semibold mb-2">Why I should win & Why you should hire me:</h5>
                      <p className="text-white/80">{userDetails.video_description || 'No description provided'}</p>
                    </div>
                  </div>
                ) : userDetails.written_introduction ? (
                  <div className="max-w-2xl">
                    <h5 className="font-semibold mb-2">Written Introduction (Why I should win & Why you should hire me):</h5>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-white/80 whitespace-pre-wrap">{userDetails.written_introduction}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    No video or written introduction provided
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-cyber-purple">📝 Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-white/60 text-sm">Trading Experience:</span>
                    <div className="font-semibold mt-1">{userDetails.trading_experience || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Preferred Markets:</span>
                    <div className="font-semibold mt-1">{userDetails.preferred_markets || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Risk Tolerance:</span>
                    <div className="font-semibold mt-1">{userDetails.risk_tolerance || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Available Hours:</span>
                    <div className="font-semibold mt-1">{userDetails.available_hours || 'N/A'}</div>
                  </div>
                </div>
                {userDetails.additional_notes && (
                  <div className="mt-4">
                    <span className="text-white/60 text-sm">Additional Notes:</span>
                    <div className="font-semibold mt-1 bg-black/20 rounded-lg p-3">
                      {userDetails.additional_notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Submission Info */}
              <div className="bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 rounded-lg p-6 border border-electric-blue/20">
                <h4 className="text-lg font-bold mb-4 text-electric-blue">📊 Submission Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-white/60 text-sm">Submitted At:</span>
                    <div className="font-semibold">
                      {userDetails.created_at ? new Date(userDetails.created_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Last Updated:</span>
                    <div className="font-semibold">
                      {userDetails.updated_at ? new Date(userDetails.updated_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Status:</span>
                    <div className="font-semibold text-neon-green">COMPLETED</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-xl font-bold mb-2">No Details Submitted Yet</h4>
              <p className="text-white/60">This user hasn't submitted their competition details yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function generateEmailHTML(account: MT5Account) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0066FF, #7B2EFF); padding: 40px 20px; text-align: center; color: white;">
        <h1>Your MT5 Account is Ready!</h1>
      </div>
      <div style="padding: 40px 20px; background: #f9f9f9;">
        <h2>Account Details:</h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #0066FF;">
          <p><strong>Login:</strong> ${account.mt5_login}</p>
          <p><strong>Password:</strong> ${account.mt5_password}</p>
          <p><strong>Server:</strong> ${account.mt5_server}</p>
          <p><strong>Account Type:</strong> ${account.account_type}</p>
          <p><strong>Balance:</strong> $${account.current_balance}</p>
        </div>
        <p style="margin-top: 20px;">Download MT5: <a href="https://www.metatrader5.com/en/download">Click Here</a></p>
      </div>
    </div>
  `;
}
