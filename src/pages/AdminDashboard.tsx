import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminAuth from '../components/AdminAuth';
import GradientText from '../components/ui/GradientText';
import { Users, MessageSquare, Settings, BarChart, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://fund-backend-pbde.onrender.com/api/accounts/all-users');
        const result = await response.json();
        if (result.success) {
          const uniqueUsers = Array.from(new Map(result.data.map((user: any) => [user.user_id, user])).values());
          setUsers(uniqueUsers);
        } else {
          console.error('Failed to fetch users:', result.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  return (
    <AdminAuth>
      <div className="min-h-screen bg-deep-space">
        <Navbar />
        <div className="pt-40 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">
              <GradientText>Admin Dashboard</GradientText>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div
                onClick={() => navigate('/admin/mt5')}
                className="glass-card p-6 cursor-pointer hover:border-electric-blue transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">MT5 Accounts</h3>
                    <p className="text-sm text-gray-400">Manage trading accounts</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/support')}
                className="glass-card p-6 cursor-pointer hover:border-neon-green transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-neon-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Support Tickets</h3>
                    <p className="text-sm text-gray-400">Handle user queries</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/challenges')}
                className="glass-card p-6 cursor-pointer hover:border-cyber-purple transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyber-purple/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-cyber-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Challenges</h3>
                    <p className="text-sm text-gray-400">Manage challenges</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/competition-profiles')}
                className="glass-card p-6 cursor-pointer hover:border-neon-orange transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neon-orange/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-neon-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Competition Profiles</h3>
                    <p className="text-sm text-gray-400">Manage participants</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Total Users</h3>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loader-spinner"></div>
            ) : (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6">All Users ({users.length})</h2>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.user_id} className="bg-white/5 p-4 rounded-lg">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                      <p><strong>User ID:</strong> {user.friendly_id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </AdminAuth>
  );
}
