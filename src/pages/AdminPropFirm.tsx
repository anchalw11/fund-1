import React, { useState, useEffect } from 'react';
import AdminAuth from '../components/AdminAuth';
import { supabase } from '../lib/db'; // Assuming you have a Supabase client instance exported

// Define types for our data
interface Trader {
  id: string;
  name: string;
  email: string;
  mt5_account_id: string;
  account_type: string;
  initial_balance: number;
  current_equity: number;
  status: 'Active' | 'Breached' | 'Terminated';
}

interface Breach {
  trader: string;
  accountId: string;
  challengeId: number;
  breach_type: string;
  breach_value: number;
  threshold_value: number;
  description: string;
}

const AdminPropFirm = () => {
  const [activeTab, setActiveTab] = useState('traders');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breachCheckResult, setBreachCheckResult] = useState<any>(null);
  const [isCheckingBreaches, setIsCheckingBreaches] = useState(false);
  const [selectedBreach, setSelectedBreach] = useState<Breach | null>(null);
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');

  // State for Email Center
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleOpenTerminationModal = (breach: Breach) => {
    setSelectedBreach(breach);
    setTerminationReason(breach.breach_type); // Pre-fill reason
    setIsTerminationModalOpen(true);
  };

  const handleTerminate = async () => {
    if (!selectedBreach || !terminationReason) {
      alert('Please select a reason.');
      return;
    }

    try {
      const response = await fetch('/api/prop-firm/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: selectedBreach.challengeId,
          reason: terminationReason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Account terminated successfully.');
        setIsTerminationModalOpen(false);
        // Refresh breach data
        handleRunBreachCheck();
      } else {
        alert(`Failed to terminate account: ${result.error}`);
      }
    } catch (err) {
      alert('An error occurred while terminating the account.');
      console.error(err);
    }
  };

  const handleRunBreachCheck = async () => {
    setIsCheckingBreaches(true);
    setBreachCheckResult(null);
    try {
      const response = await fetch('/api/prop-firm/run-breach-check', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        setBreachCheckResult(result);
      } else {
        setError(result.error || 'Failed to run breach check.');
      }
    } catch (err) {
      setError('An error occurred while running the breach check.');
      console.error(err);
    }
    setIsCheckingBreaches(false);
  };

  useEffect(() => {
    const fetchTraders = async () => {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError('Supabase client is not initialized.');
        setLoading(false);
        return;
      }
      
      // Fetch users who have MT5 accounts
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          mt5_accounts (
            account_id,
            balance,
            equity,
            account_type
          )
        `)
        .not('mt5_accounts', 'is', null);

      if (error) {
        console.error('Error fetching traders:', error);
        setError('Failed to fetch trader data. Please check the console for details.');
        setTraders([]);
      } else if (data) {
        const formattedTraders: Trader[] = data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          mt5_account_id: user.mt5_accounts[0]?.account_id || 'N/A',
          account_type: user.mt5_accounts[0]?.account_type || 'Unknown',
          initial_balance: user.mt5_accounts[0]?.balance || 0, // Assuming initial balance is the current balance for now
          current_equity: user.mt5_accounts[0]?.equity || 0,
          status: 'Active', // Default status, will be dynamic later
        }));
        setTraders(formattedTraders);
      }
      setLoading(false);
    };

    fetchTraders();
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch('/api/prop-firm/email-templates');
      const result = await response.json();
      if (result.success) {
        setEmailTemplates(result.data);
      } else {
        console.error('Failed to fetch email templates:', result.error);
      }
    } catch (err) {
      console.error('An error occurred while fetching email templates:', err);
    }
  };

  const renderTradersTab = () => {
    if (loading) {
      return <div className="text-center p-8">Loading traders...</div>;
    }

    if (error) {
      return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (traders.length === 0) {
      return <div className="text-center p-8">No traders with MT5 accounts found.</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead>
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">MT5 Account</th>
              <th className="p-3 text-left">Account Type</th>
              <th className="p-3 text-left">Equity</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader) => (
              <tr key={trader.id} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="p-3">{trader.name}</td>
                <td className="p-3">{trader.email}</td>
                <td className="p-3">{trader.mt5_account_id}</td>
                <td className="p-3">{trader.account_type}</td>
                <td className="p-3">${trader.current_equity.toLocaleString()}</td>
                <td className="p-3">
                  <span className="px-2 py-1 text-sm rounded-full bg-green-500 text-white">
                    {trader.status}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-blue-400 hover:text-blue-300">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBreachesTab = () => {
    return (
        <div>
            <div className="mb-4">
                <button
                    onClick={handleRunBreachCheck}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-500"
                    disabled={isCheckingBreaches}
                >
                    {isCheckingBreaches ? 'Checking...' : 'Run Breach Check'}
                </button>
            </div>

            {error && <div className="text-red-500 bg-red-900 border border-red-700 p-4 rounded mb-4">{error}</div>}

            {breachCheckResult && (
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-2">Breach Check Complete</h3>
                    <p className="text-gray-300 mb-4">{breachCheckResult.message}</p>
                    {breachCheckResult.data.breaches_found > 0 && (
                        <div>
                            <h4 className="font-bold mb-2">Detected Breaches:</h4>
                            <ul className="space-y-2">
                                {breachCheckResult.data.breach_details.map((breach: Breach, index: number) => (
                                    <li key={index} className="bg-red-900 border border-red-700 p-3 rounded flex justify-between items-center">
                                      <div>
                                        <p><strong>Trader:</strong> {breach.trader} (Account: {breach.accountId})</p>
                                        <p><strong>Breach Type:</strong> {breach.breach_type}</p>
                                        <p><strong>Value:</strong> {breach.breach_value.toFixed(2)}% (Threshold: {breach.threshold_value}%)</p>
                                        <p><strong>Description:</strong> {breach.description}</p>
                                      </div>
                                      <button
                                        onClick={() => handleOpenTerminationModal(breach)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition duration-300"
                                      >
                                        Terminate
                                      </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {isTerminationModalOpen && selectedBreach && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Terminate Account</h2>
                  <p className="mb-4">Are you sure you want to terminate the account for <strong>{selectedBreach.trader}</strong> ({selectedBreach.accountId})?</p>
                  
                  <div className="mb-4">
                    <label htmlFor="terminationReason" className="block text-sm font-medium text-gray-300 mb-2">Termination Reason</label>
                    <select
                      id="terminationReason"
                      value={terminationReason}
                      onChange={(e) => setTerminationReason(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3"
                    >
                      <option value="Max Daily Loss">Max Daily Loss</option>
                      <option value="Max Total Loss">Max Total Loss</option>
                      <option value="Consistency Violation">Consistency Violation</option>
                      <option value="Terms Violation">Terms Violation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button onClick={() => setIsTerminationModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                      Cancel
                    </button>
                    <button onClick={handleTerminate} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Confirm Termination
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
  };

  const handleSendEmail = async () => {
    if (!selectedTraderId || !selectedTemplateId) {
      alert('Please select a trader and a template.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/prop-firm/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedTraderId,
          templateId: selectedTemplateId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Email sent successfully!');
        setSelectedTraderId('');
        setSelectedTemplateId('');
        setEmailSubject('');
        setEmailBody('');
      } else {
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (err) {
      alert('An error occurred while sending the email.');
      console.error(err);
    }
    setIsSendingEmail(false);
  };

  useEffect(() => {
    if (selectedTraderId && selectedTemplateId) {
      const trader = traders.find(t => t.id === selectedTraderId);
      const template = emailTemplates.find(t => t.id === selectedTemplateId);

      if (trader && template) {
        let subject = template.subject;
        let body = template.body;

        const replacements: { [key: string]: any } = {
          '{trader_name}': trader.name,
          '{account_id}': trader.mt5_account_id,
          '{initial_balance}': trader.initial_balance,
          '{current_equity}': trader.current_equity,
          '{breach_reason}': 'N/A', // Placeholder for now
          '{company_name}': 'Fund8r',
        };

        for (const key in replacements) {
          subject = subject.replace(new RegExp(key, 'g'), replacements[key]);
          body = body.replace(new RegExp(key, 'g'), replacements[key]);
        }
        
        setEmailSubject(subject);
        setEmailBody(body);
      }
    } else {
      setEmailSubject('');
      setEmailBody('');
    }
  }, [selectedTraderId, selectedTemplateId, traders, emailTemplates]);

  const renderEmailsTab = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Controls */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Email Composer</h3>
          
          <div className="mb-4">
            <label htmlFor="traderSelect" className="block text-sm font-medium text-gray-300 mb-2">Select Trader</label>
            <select
              id="traderSelect"
              value={selectedTraderId}
              onChange={(e) => setSelectedTraderId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3"
            >
              <option value="">-- Select a Trader --</option>
              {traders.map(trader => (
                <option key={trader.id} value={trader.id}>{trader.name} ({trader.email})</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-300 mb-2">Select Template</label>
            <select
              id="templateSelect"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3"
            >
              <option value="">-- Select a Template --</option>
              {emailTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.template_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSendEmail}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-300 disabled:bg-gray-500"
            disabled={isSendingEmail || !selectedTraderId || !selectedTemplateId}
          >
            {isSendingEmail ? 'Sending...' : 'Send Email'}
          </button>
        </div>

        {/* Right Side: Preview */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Email Preview</h3>
          {selectedTraderId && selectedTemplateId ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">Subject</label>
                <div className="mt-1 p-3 bg-gray-700 rounded">{emailSubject}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Body</label>
                <div className="mt-1 p-3 bg-gray-700 rounded whitespace-pre-wrap h-64 overflow-y-auto">{emailBody}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 pt-16">
              <p>Select a trader and a template to see a preview.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminAuth>
      <div className="bg-gray-900 text-white min-h-screen">
        {/* The main tab content will be rendered by AdminMT5.tsx */}
        {/* This component only needs to render the content for the 'propfirm' tab */}
        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold mb-4">Prop Firm Dashboard</h1>
          
          {/* Sub-tabs for this section */}
          <div className="border-b border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('traders')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'traders' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`} >
                Traders
              </button>
              <button onClick={() => setActiveTab('breaches')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'breaches' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`} >
                Breach Detection
              </button>
               <button onClick={() => setActiveTab('emails')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'emails' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`} >
                Email Center
              </button>
            </nav>
          </div>

          <div>
            {activeTab === 'traders' && renderTradersTab()}
            {activeTab === 'breaches' && renderBreachesTab()}
            {activeTab === 'emails' && renderEmailsTab()}
          </div>
        </div>
      </div>
    </AdminAuth>
  );
};

export default AdminPropFirm;
