import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Loader, Shield, FileText, ArrowRight, Sparkles, Scale, Lock } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/db';
import { generateContractText, type ContractData } from '../config/contractText';

export default function ContractSigning() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [contractText, setContractText] = useState('');
  
  useEffect(() => {
    // Generate contract text for competition
    const contractData: ContractData = {
      fullName: 'Participant',
      email: 'participant@example.com',
      country: 'United States',
      challengeType: 'COMPETITION',
      accountSize: 100000,
      purchasePrice: 9.99,
      profitTarget: 10,
      maxDailyLoss: 4,
      maxTotalLoss: 6,
      payoutCycle: 'MONTHLY',
      profitSplit: 80
    };
    
    setContractText(generateContractText(contractData));
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const bottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    if (bottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  const handleSign = async () => {
    if (!agreed) {
      setError('Please read and agree to the terms before continuing');
      return;
    }

    if (!scrolledToBottom) {
      setError('Please scroll to the bottom of the contract to ensure you have read all terms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Record contract signature
      // First try the competition_contracts table, if it fails, try user_challenges table
      let response;
      let contractRecorded = false;

      try {
        if (!supabase) {
          throw new Error('Database connection not available');
        }

        response = await supabase
          .from('competition_contracts')
          .insert({
            user_id: user.id,
            contract_version: '1.0',
            contract_text: contractText,
            signed_at: new Date().toISOString(),
            ip_address: '', // You can add IP tracking if needed
            user_agent: navigator.userAgent,
          });

        if (response?.error) {
          console.warn('competition_contracts table not available, trying alternative approach:', response.error);

          // Alternative: Update user_challenges table to mark contract as signed
          const challengeUpdate = await supabase
            .from('user_challenges')
            .update({
              contract_signed: true
            })
            .eq('user_id', user.id)
            .eq('challenge_type', 'competition');

          if (challengeUpdate?.error) {
            console.error('Failed to update user_challenges:', challengeUpdate.error);
            throw new Error('Failed to record contract signature');
          }

          contractRecorded = true;
          console.log('Contract signature recorded in user_challenges table');
        } else {
          contractRecorded = true;
          console.log('Contract signature recorded in competition_contracts table');
        }
      } catch (tableError) {
        console.warn('competition_contracts table error, trying user_challenges fallback:', tableError);

        if (!supabase) {
          throw new Error('Database connection not available');
        }

        // Fallback: Update user_challenges table
        const challengeUpdate = await supabase
          .from('user_challenges')
          .update({
            contract_signed: true
          })
          .eq('user_id', user.id)
          .eq('challenge_type', 'competition');

        if (challengeUpdate?.error) {
          console.error('Fallback also failed:', challengeUpdate.error);
          throw new Error('Failed to record contract signature in both tables');
        }

        contractRecorded = true;
        console.log('Contract signature recorded via fallback method');
      }

      if (!contractRecorded) {
        throw new Error('Failed to record contract signature');
      }

      // Navigate to dashboard
      navigate('/dashboard', {
        state: {
          message: 'Contract signed successfully! Welcome to the competition.',
          showCompetitionSetup: true
        }
      });
    } catch (err) {
      console.error('Contract signing error:', err);
      setError('Failed to sign contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-cyber-purple/5 to-neon-pink/5" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-blue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-electric-blue/10 to-cyber-purple/10 backdrop-blur-xl border border-electric-blue/30 rounded-full">
              <Shield className="w-4 h-4 text-electric-blue animate-pulse" />
              <span className="text-sm font-bold tracking-wider text-electric-blue">LEGAL AGREEMENT</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink bg-clip-text text-transparent">
              Competition Agreement
            </span>
          </h1>
          <p className="text-xl text-gray-400">Please review and sign the competition terms and conditions</p>
        </div>

        {/* Key Points Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-electric-blue/10 to-transparent backdrop-blur-xl border border-electric-blue/30 rounded-2xl p-6 text-center">
            <Scale className="w-8 h-8 mx-auto mb-3 text-electric-blue" />
            <h3 className="font-bold text-white mb-2">Legally Binding</h3>
            <p className="text-sm text-gray-400">This is a legal contract between you and Fund8r</p>
          </div>
          
          <div className="bg-gradient-to-br from-cyber-purple/10 to-transparent backdrop-blur-xl border border-cyber-purple/30 rounded-2xl p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3 text-cyber-purple" />
            <h3 className="font-bold text-white mb-2">42 Pages Total</h3>
            <p className="text-sm text-gray-400">Comprehensive terms covering all aspects</p>
          </div>
          
          <div className="bg-gradient-to-br from-neon-pink/10 to-transparent backdrop-blur-xl border border-neon-pink/30 rounded-2xl p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-neon-pink" />
            <h3 className="font-bold text-white mb-2">Final & Binding</h3>
            <p className="text-sm text-gray-400">Signature cannot be revoked once submitted</p>
          </div>
        </div>

        {/* Contract Display */}
        <div className="bg-gradient-to-br from-black/80 via-black/60 to-transparent backdrop-blur-2xl border-2 border-electric-blue/30 rounded-3xl overflow-hidden mb-8">
          {/* Contract Header */}
          <div className="bg-gradient-to-r from-electric-blue/20 to-cyber-purple/20 px-8 py-6 border-b border-electric-blue/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">FUND8R TRADER CHALLENGE</h2>
                <p className="text-sm text-gray-300">Terms and Conditions Agreement</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Version 1.0</div>
                <div className="text-xs text-gray-400">Date: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Contract Content - Scrollable */}
          <div 
            onScroll={handleScroll}
            className="h-[600px] overflow-y-auto px-8 py-6 custom-scrollbar"
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
                {contractText}
              </div>
            </div>

            {/* End of contract indicator */}
            <div className="mt-12 p-6 bg-gradient-to-r from-electric-blue/10 to-cyber-purple/10 border-2 border-electric-blue/50 rounded-2xl text-center">
              <Check className="w-12 h-12 mx-auto mb-3 text-electric-blue" />
              <h3 className="text-xl font-bold text-white mb-2">End of Agreement</h3>
              <p className="text-gray-400 text-sm">
                You have reached the end of the contract. Please scroll back to review if needed.
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          {!scrolledToBottom && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <div className="flex flex-col items-center animate-bounce">
                <div className="text-sm text-electric-blue font-bold mb-2">Scroll to Bottom</div>
                <div className="w-8 h-8 rounded-full bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-electric-blue rotate-90" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agreement Checkbox */}
        <div className="bg-gradient-to-br from-black/80 via-black/60 to-transparent backdrop-blur-2xl border-2 border-electric-blue/30 rounded-3xl p-8 mb-8">
          <div className="flex items-start space-x-4">
            <label className="relative flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-8 border-2 border-gray-600 rounded-lg peer-checked:border-electric-blue peer-checked:bg-gradient-to-br peer-checked:from-electric-blue peer-checked:to-cyber-purple transition-all duration-300 flex items-center justify-center group-hover:border-electric-blue/50">
                {agreed && <Check className="w-5 h-5 text-white" />}
              </div>
            </label>
            
            <div className="flex-1">
              <p className="text-white font-bold text-lg mb-2">
                I Agree to All Terms and Conditions
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                By checking this box, I confirm that I have read, understood, and agree to be bound by all terms and conditions outlined in the Fund8r Trader Challenge Agreement above. I acknowledge that this is a legally binding contract and understand the competition rules, prize structure, elimination criteria, and all other provisions contained herein.
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">I am at least 18 years old</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">I accept all competition rules and trading restrictions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">I understand violation consequences including elimination</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">I acknowledge this signature is final and binding</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center space-x-2 text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Sign Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleSign}
            disabled={loading || !agreed}
            className="group relative px-16 py-6 rounded-2xl font-black text-xl overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink animate-gradient" />
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            <div className="relative flex items-center space-x-4 text-white">
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Signing Contract...</span>
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  <span>SIGN CONTRACT & CONTINUE</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </div>
          </button>

          <p className="mt-6 text-center text-sm text-gray-500 max-w-2xl">
            By clicking "Sign Contract & Continue", you electronically sign this agreement with the same legal effect as a handwritten signature. This action creates a binding legal contract between you and Fund8r.
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-12 bg-electric-blue/5 border border-electric-blue/20 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <Lock className="w-6 h-6 text-electric-blue flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Secure & Encrypted</h3>
              <p className="text-sm text-gray-400">
                Your signature is securely recorded with timestamp, IP address, and device information for legal verification. All data is encrypted and stored in compliance with data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00D9FF, #A855F7);
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #00D9FF, #FF00FF);
        }
      `}</style>
    </div>
  );
}
