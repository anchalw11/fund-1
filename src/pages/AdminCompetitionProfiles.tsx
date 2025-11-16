import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminAuth from '../components/AdminAuth';
import GradientText from '../components/ui/GradientText';
import { 
  Search, 
  Filter, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Instagram,
  Twitter,
  Youtube,
  Video,
  FileText,
  Download,
  Eye,
  ChevronDown,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { supabase } from '../lib/db';

interface CompetitionProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  screenshot_urls: string[];
  screenshots_verified: boolean;
  video_url?: string;
  has_video: boolean;
  written_intro?: string;
  submission_date: string;
  approved: boolean;
  admin_notes?: string;
  contract_signed_at?: string;
  has_addon: boolean;
  addon_amount: number;
  total_tries: number;
  challenge_type?: string;
  account_size?: string;
  challenge_status?: string;
  registration_date: string;
}

interface CompetitionStats {
  total_participants: number;
  approved_participants: number;
  pending_approval: number;
  with_video: number;
  contracts_signed: number;
  addon_purchases: number;
  total_addon_revenue: number;
}

export default function AdminCompetitionProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<CompetitionProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<CompetitionProfile[]>([]);
  const [stats, setStats] = useState<CompetitionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [filterAddOn, setFilterAddOn] = useState<'all' | 'with' | 'without'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [selectedProfile, setSelectedProfile] = useState<CompetitionProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAndSortProfiles();
  }, [profiles, searchTerm, filterStatus, filterAddOn, sortBy]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      const { data, error } = await supabase
        .from('competition_user_profiles_view')
        .select('*');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      const { data, error } = await supabase
        .rpc('get_competition_stats');

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterAndSortProfiles = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.email?.toLowerCase().includes(search) ||
        p.first_name?.toLowerCase().includes(search) ||
        p.last_name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => 
        filterStatus === 'approved' ? p.approved : !p.approved
      );
    }

    // Add-on filter
    if (filterAddOn !== 'all') {
      filtered = filtered.filter(p => 
        filterAddOn === 'with' ? p.has_addon : !p.has_addon
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'status':
          return Number(b.approved) - Number(a.approved);
        case 'date':
        default:
          return new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime();
      }
    });

    setFilteredProfiles(filtered);
  };

  const updateProfileStatus = async (profileId: string, approved: boolean) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      const { error } = await supabase
        .from('competition_user_details')
        .update({ approved })
        .eq('id', profileId);

      if (error) throw error;
      
      await fetchProfiles();
      await fetchStats();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateAdminNotes = async (profileId: string, notes: string) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      const { error } = await supabase
        .from('competition_user_details')
        .update({ admin_notes: notes })
        .eq('id', profileId);

      if (error) throw error;
      await fetchProfiles();
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminAuth>
      <div className="min-h-screen bg-deep-space">
        <Navbar />
        <div className="pt-40 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <GradientText>Competition User Profiles</GradientText>
                </h1>
                <p className="text-gray-400">Manage and review competition participants</p>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-3 bg-electric-blue/20 border border-electric-blue rounded-lg hover:bg-electric-blue/30 transition-all"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 border-l-4 border-electric-blue">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-electric-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Participants</p>
                      <p className="text-2xl font-bold">{stats.total_participants}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-neon-green">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-neon-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Approved</p>
                      <p className="text-2xl font-bold">{stats.approved_participants}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-cyber-yellow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyber-yellow/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-cyber-yellow" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pending Approval</p>
                      <p className="text-2xl font-bold">{stats.pending_approval}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-neon-purple">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Add-on Revenue</p>
                      <p className="text-2xl font-bold">${stats.total_addon_revenue}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="glass-card p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-cyber-purple/20 border border-cyber-purple rounded-lg hover:bg-cyber-purple/30 transition-all flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Add-on Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Add-on Status</label>
                    <select
                      value={filterAddOn}
                      onChange={(e) => setFilterAddOn(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="with">With Add-on</option>
                      <option value="without">Without Add-on</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                    >
                      <option value="date">Submission Date</option>
                      <option value="name">Name</option>
                      <option value="status">Approval Status</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Profiles List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader-spinner"></div>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-400">No profiles found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="glass-card p-6 hover:border-electric-blue transition-all cursor-pointer"
                    onClick={() => setSelectedProfile(selectedProfile?.id === profile.id ? null : profile)}
                  >
                    {/* Profile Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-purple rounded-full flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{profile.first_name} {profile.last_name}</h3>
                          <p className="text-sm text-gray-400">{profile.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Add-on Badge */}
                        {profile.has_addon && (
                          <div className="px-3 py-1 bg-neon-purple/20 border border-neon-purple rounded-full text-sm">
                            <Award className="w-4 h-4 inline mr-1" />
                            2 Tries
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          profile.approved 
                            ? 'bg-neon-green/20 border border-neon-green' 
                            : 'bg-cyber-yellow/20 border border-cyber-yellow'
                        }`}>
                          {profile.approved ? (
                            <>
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 inline mr-1" />
                              Pending
                            </>
                          )}
                        </div>

                        {/* Expand Icon */}
                        <ChevronDown className={`w-5 h-5 transition-transform ${
                          selectedProfile?.id === profile.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedProfile?.id === profile.id && (
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                        {/* Social Media Links */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Social Media Links</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {profile.instagram_url && (
                              <a
                                href={profile.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500 rounded-lg hover:bg-pink-500/30 transition-all"
                              >
                                <Instagram className="w-4 h-4" />
                                Instagram
                              </a>
                            )}
                            {profile.twitter_url && (
                              <a
                                href={profile.twitter_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500 rounded-lg hover:bg-blue-500/30 transition-all"
                              >
                                <Twitter className="w-4 h-4" />
                                Twitter
                              </a>
                            )}
                            {profile.youtube_url && (
                              <a
                                href={profile.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg hover:bg-red-500/30 transition-all"
                              >
                                <Youtube className="w-4 h-4" />
                                YouTube
                              </a>
                            )}
                            {profile.tiktok_url && (
                              <a
                                href={profile.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500 rounded-lg hover:bg-cyan-500/30 transition-all"
                              >
                                <Video className="w-4 h-4" />
                                TikTok
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Screenshots */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            Proof Screenshots
                            {profile.screenshots_verified && (
                              <CheckCircle className="w-4 h-4 text-neon-green" />
                            )}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {profile.screenshot_urls?.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-square bg-white/5 rounded-lg border border-white/10 hover:border-electric-blue transition-all overflow-hidden"
                              >
                                <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>

                        {/* Video/Written Intro */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Introduction</h4>
                          {profile.has_video && profile.video_url ? (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <video src={profile.video_url} controls className="w-full max-w-2xl rounded-lg" />
                            </div>
                          ) : profile.written_intro ? (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <FileText className="w-5 h-5 text-gray-400 mb-2" />
                              <p className="text-gray-300 whitespace-pre-wrap">{profile.written_intro}</p>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No introduction provided</p>
                          )}
                        </div>

                        {/* Competition Details */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Competition Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-gray-400 mb-1">Challenge Type</p>
                              <p className="font-semibold">{profile.challenge_type || 'N/A'}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-gray-400 mb-1">Account Size</p>
                              <p className="font-semibold">{profile.account_size || 'N/A'}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-gray-400 mb-1">Total Tries</p>
                              <p className="font-semibold">{profile.total_tries}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-gray-400 mb-1">Add-on Amount</p>
                              <p className="font-semibold">${profile.addon_amount || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Timeline</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">Registered:</span>
                              <span>{formatDate(profile.registration_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">Submitted:</span>
                              <span>{formatDate(profile.submission_date)}</span>
                            </div>
                            {profile.contract_signed_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-neon-green" />
                                <span className="text-gray-400">Contract Signed:</span>
                                <span>{formatDate(profile.contract_signed_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Notes */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Admin Notes</h4>
                          <textarea
                            value={profile.admin_notes || ''}
                            onChange={(e) => {
                              const newProfiles = [...filteredProfiles];
                              const index = newProfiles.findIndex(p => p.id === profile.id);
                              newProfiles[index].admin_notes = e.target.value;
                              setFilteredProfiles(newProfiles);
                            }}
                            onBlur={(e) => updateAdminNotes(profile.id, e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none min-h-[100px]"
                            placeholder="Add internal notes about this participant..."
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t border-white/10">
                          {!profile.approved ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProfileStatus(profile.id, true);
                              }}
                              className="flex-1 px-6 py-3 bg-neon-green/20 border border-neon-green rounded-lg hover:bg-neon-green/30 transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Approve Participant
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProfileStatus(profile.id, false);
                              }}
                              className="flex-1 px-6 py-3 bg-red-500/20 border border-red-500 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              Revoke Approval
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </AdminAuth>
  );
}
