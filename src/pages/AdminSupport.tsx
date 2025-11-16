import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Clock, CheckCircle, XCircle, User, Calendar, Tag, AlertCircle, ArrowLeft } from 'lucide-react';
import AdminAuth from '../components/AdminAuth';
import { api } from '../lib/api';
import { supabase } from '../lib/db';

export default function AdminSupport() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!supabase) return;
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        setAdminId(user.data.user.id);
      }
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    fetchAllTickets();
  }, [filter]);

  const fetchAllTickets = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]);
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    if (!supabase) return;
    try {
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
      const API_URL = import.meta.env.VITE_API_URL || 'https://fund-backend-pbde.onrender.com';
      const messagesResponse = await fetch(`${API_URL}/api/support/tickets/${ticketId}/messages`);
      const messagesResult = await messagesResponse.json();

      const messages = messagesResult.success ? messagesResult.data : [];
      setSelectedTicket({ ...ticket, messages });
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      console.log('Sending admin message to ticket:', selectedTicket.id);

      // Use backend API (uses service role, bypasses PostgREST completely)
      const API_URL = import.meta.env.VITE_API_URL || 'https://fund-backend-pbde.onrender.com';
      const response = await fetch(`${API_URL}/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          is_admin: true,
          user_id: null,
          admin_id: adminId
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      console.log('Message sent successfully:', result.data);

      // Send email notification to user
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://fund-backend-pbde.onrender.com';
        await fetch(`${API_URL}/api/support/send-reply-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedTicket.user_email,
            name: selectedTicket.user_name,
            ticketId: selectedTicket.id,
            subject: selectedTicket.subject,
            message: newMessage
          })
        }).catch(err => console.warn('Email notification failed:', err));
      } catch (emailError) {
        console.warn('Failed to send email notification:', emailError);
      }

      setNewMessage('');
      setTimeout(() => {
        fetchTicketDetails(selectedTicket.id);
        fetchAllTickets();
      }, 500);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Error: ' + (error?.message || 'Unknown error'));
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    if (!supabase) return;
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating status:', error);
      } else {
        fetchAllTickets();
        if (selectedTicket?.id === ticketId) {
          fetchTicketDetails(ticketId);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-500/20 text-gray-400',
      normal: 'bg-blue-500/20 text-blue-400',
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400'
    };
    return styles[priority as keyof typeof styles] || styles.normal;
  };

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gradient-to-br from-space-black via-deep-purple to-space-black">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
                <p className="text-gray-400">Manage and respond to user support requests</p>
              </div>
              <div className="flex gap-2">
                {['all', 'open', 'pending', 'resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      filter === status
                        ? 'bg-electric-blue text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No tickets found</div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => fetchTicketDetails(ticket.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-electric-blue/20 border-2 border-electric-blue'
                        : 'bg-white/5 border-2 border-white/10 hover:border-electric-blue/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="font-semibold text-white">{ticket.subject}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{ticket.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{ticket.user_email || 'User'}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.category && (
                        <>
                          <Tag className="w-3 h-3 ml-2" />
                          <span className="capitalize">{ticket.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="bg-white/5 rounded-xl border-2 border-white/10 h-[calc(100vh-200px)] flex flex-col">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{selectedTicket.user_email || 'User'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                          className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${getPriorityBadge(selectedTicket.priority)}`}>
                        {selectedTicket.priority} priority
                      </span>
                      {selectedTicket.category && (
                        <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400">
                          {selectedTicket.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <User className="w-4 h-4" />
                        <span className="font-semibold">User</span>
                        <span className="text-xs text-gray-500">
                          {new Date(selectedTicket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg p-4 ${
                          msg.is_admin
                            ? 'bg-green-500/10 border border-green-500/30 ml-8'
                            : 'bg-blue-500/10 border border-blue-500/30 mr-8'
                        }`}
                      >
                        <div className={`flex items-center gap-2 mb-2 ${msg.is_admin ? 'text-green-400' : 'text-blue-400'}`}>
                          <User className="w-4 h-4" />
                          <span className="font-semibold">{msg.is_admin ? 'Admin' : 'User'}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border-t border-white/10">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                        placeholder="Type your response..."
                        className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-electric-blue focus:outline-none"
                      />
                      <button
                        onClick={sendAdminMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-purple text-white rounded-lg hover:shadow-lg hover:shadow-electric-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl border-2 border-white/10 h-[calc(100vh-200px)] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a ticket to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}
