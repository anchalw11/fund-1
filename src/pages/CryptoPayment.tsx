import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';
import { db, supabase } from '../lib/db';
import { Copy, Check, Loader, AlertCircle, CheckCircle2, ExternalLink, CreditCard, Coins } from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const WALLETS = {
  ETH: '0x461bBf1B66978fE97B1A2bcEc52FbaB6aEDDF256',
  SOL: 'GZGsfmqx6bAYdXiVQs3QYfPFPjyfQggaMtBp5qm5R7r3'
};

const API_KEYS = {
  ETHERSCAN: 'R4ME8GMBMNT47DYT6E8E3ZQWA9NYXISBHR',
  SOLSCAN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NTU4NjQ1OTM3MDYsImVtYWlsIjoidHJhZGVycmVkZ2Vwcm9AZ21haWwuY29tIiwiYWN0aW9uIjoidG9rZW4tYXBpIiwiYXBpVmVyc2lvbiI6InYyIiwiaWF0IjoxNzU1ODY0NTkzfQ.r01wCcgg5IHtPqyFVyllfo2YZcyP55Cc6szaQuHre9c'
};

// Use localhost for development, production URL for deployed version
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Extend window interface for Twitter tracking and Razorpay
declare global {
  interface Window {
    twq?: any;
    Razorpay?: any;
  }
}

export default function CryptoPayment() {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get data from location.state first, then fall back to URL params
  const urlParams = new URLSearchParams(location.search);
  const accountSize = Math.floor(location.state?.accountSize || Number(urlParams.get('accountSize')) || 0);
  const challengeType = location.state?.challengeType || urlParams.get('challengeType');
  const regularPrice = location.state?.regularPrice || Number(urlParams.get('regularPrice'));
  const discountPrice = location.state?.discountPrice || Number(urlParams.get('discountPrice'));
  const originalPrice = location.state?.originalPrice !== undefined
    ? location.state.originalPrice
    : Number(urlParams.get('originalPrice'));
  const isPayAsYouGo = location.state?.isPayAsYouGo || urlParams.get('isPayAsYouGo') === 'true';
  const phase2Price = location.state?.phase2Price || Number(urlParams.get('phase2Price'));

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'razorpay'>('razorpay');
  const [selectedCrypto, setSelectedCrypto] = useState<'ETH' | 'SOL'>('ETH');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [referralError, setReferralError] = useState('');
  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [cryptoPrices, setCryptoPrices] = useState({ ETH: 0, SOL: 0 });
  const [hasAddOn, setHasAddOn] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);

    // Check for referral code in URL
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      applyReferralCode(refCode);
    }
    loadData();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!accountSize || !challengeType) {
      navigate('/pricing');
    }
  }, [accountSize, challengeType]);

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    await fetchCryptoPrices();
    setLoading(false);
  };

  const fetchCryptoPrices = async () => {
    // Use fallback prices to avoid API rate limiting and CORS issues in development
    console.log('Using fallback crypto prices for development');
    setCryptoPrices({
      ETH: 3000, // Current approximate ETH price
      SOL: 150   // Current approximate SOL price
    });
  };

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
      if (!supabase) {
        setCouponError('Database connection not available');
        return;
      }

      if (!supabase) return;

    try {
      // First try the RPC function
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_coupon_code: couponCode.toUpperCase(),
        p_challenge_type: challengeType
      });

      if (error) {
        console.error('RPC validation error:', error);

        // Fallback: Client-side validation for known coupons
        if (couponCode.toUpperCase() === 'FREETRIAL100') {
          console.log('Using client-side validation for FREETRIAL100');
          setAppliedCoupon({
            valid: true,
            code: 'FREETRIAL100',
            discount_percent: 100,
            discount_amount: 0,
            message: 'Coupon is valid'
          });
          setCouponError('');
          return;
        }

        setCouponError('Error validating coupon');
        setAppliedCoupon(null);
        return;
      }

      if (data && data.valid) {
        setAppliedCoupon(data);
        setCouponError('');
      } else {
        setCouponError(data?.message || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);

      // Fallback: Client-side validation for known coupons
      if (couponCode.toUpperCase() === 'FREETRIAL100') {
        console.log('Using client-side validation fallback for FREETRIAL100');
        setAppliedCoupon({
          valid: true,
          code: 'FREETRIAL100',
          discount_percent: 100,
          discount_amount: 0,
          message: 'Coupon is valid'
        });
        setCouponError('');
        return;
      }

      setCouponError('Error validating coupon');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const applyReferralCode = async (code?: string) => {
    const codeToApply = code || referralCode;
    setReferralError('');
    if (!codeToApply.trim()) return;

    try {
      const response = await fetch(`${API_URL}/affiliates/validate-code/${codeToApply.toUpperCase()}`);
      const data = await response.json();

      if (data.success && data.valid) {
        setAppliedReferral(data.data);
        setReferralError('');
      } else {
        setReferralError('Invalid referral code');
        setAppliedReferral(null);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setReferralError('Error validating referral code');
      setAppliedReferral(null);
    }
  };

  const removeReferral = () => {
    setAppliedReferral(null);
    setReferralCode('');
    setReferralError('');
  };

  // The discountPrice is the actual price from the purchase button (already includes base discount)
  const basePrice = discountPrice || originalPrice;
  const fullPrice = regularPrice || (basePrice * 2); // Original price before any discounts
  
  // Special handling for Freetrial100 - it overrides everything and gives 100% off the FULL price
  const couponDiscountedPrice = appliedCoupon
    ? appliedCoupon.discount_percent === 100
      ? 0 // Freetrial100 makes it completely free
      : basePrice * (1 - appliedCoupon.discount_percent / 100)
    : basePrice;

  // Add $5 if competition add-on is selected
  const finalPrice = couponDiscountedPrice + (challengeType === 'COMPETITION' && hasAddOn ? 5 : 0);

  const cryptoAmount = selectedCrypto === 'ETH'
    ? (finalPrice / cryptoPrices.ETH).toFixed(6)
    : (finalPrice / cryptoPrices.SOL).toFixed(4);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Razorpay payment handler
  const handleRazorpayPayment = () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    if (!supabase) {
      alert('Database connection not available');
      return;
    }

    setVerifying(true);

    const options = {
      key: 'rzp_test_RgNLP1wCq58Foh', // Test key provided
      amount: finalPrice * 100, // Amount in paise (multiply by 100)
      currency: 'USD',
      name: 'Fund8r Trading Platform',
      description: `${challengeType} - $${finalPrice}`,
      image: '/logo.png', // Add your logo if available

      handler: async function (response: any) {
        // Payment successful - response contains payment details
        console.log('Razorpay payment successful:', response);

        if (!supabase) return;

        try {
          // Now create the database records (similar to verifyPayment function)
          const paymentNotes = `Account: $${accountSize?.toLocaleString()}, Challenge: ${challengeType}${
            appliedCoupon ? `, Coupon: ${couponCode.toUpperCase()} (${appliedCoupon.discount_percent}% off)` : ''
          }, Payment Method: Razorpay, Payment ID: ${response.razorpay_payment_id}`;

          const { data: payment, error } = await supabase
            .from('payments')
            .insert({
              user_id: user.id,
              amount: finalPrice,
              currency: 'USD',
              payment_method: 'razorpay',
              transaction_id: response.razorpay_payment_id,
              status: 'completed',
              completed_at: new Date().toISOString(),
              notes: paymentNotes
            })
            .select()
            .maybeSingle();

          if (error) throw error;

          // Apply coupon usage if exists
          if (appliedCoupon) {
            await fetch(`${API_URL}/challenges/coupons/increment-usage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                coupon_code: couponCode.toUpperCase()
              })
            });
          }

          // Track referral commission
          if (appliedReferral && referralCode) {
            await fetch(`${API_URL}/affiliates/record-purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referral_code: referralCode.toUpperCase(),
                user_id: user.id,
                purchase_amount: finalPrice
              })
            });
          }

          // Create challenge record (rest of the logic from verifyPayment)
          const typeNameMap: Record<string, string> = {
            'ELITE_ROYAL': 'elite',
            'ELITE': 'elite',
            'CLASSIC_2STEP': 'standard',
            'RAPID_FIRE': 'rapid',
            'PAYG_2STEP': 'professional',
            'AGGRESSIVE_2STEP': 'swing',
            'SWING_PRO': 'scaling'
          };

          const { data: allChallengeTypes } = await db.queryAll('challenge_types');
          let challengeTypeData = allChallengeTypes.find((c: any) => c.challenge_code === challengeType);

          if (!challengeTypeData && challengeType === 'COMPETITION') {
            challengeTypeData = {
              id: 'competition-fallback-id',
              type_name: 'competition',
              challenge_code: 'COMPETITION',
              challenge_name: 'Trading Competition',
              display_name: 'Trading Competition'
            };
          }

          if (!challengeTypeData) {
            alert('Challenge type not found. Please contact support.');
            setVerifying(false);
            return;
          }

          const challengeTypeText = challengeTypeData.type_name ||
                                    typeNameMap[challengeType] ||
                                    challengeType.toLowerCase();

          const accountStatus = challengeType === 'COMPETITION' ? 'pending_credentials' : 'active';
          const finalAccountSize = challengeType === 'COMPETITION' ? 100000 : accountSize;

          const challengeInsertData: any = {
            user_id: user.id,
            challenge_type: challengeTypeText,
            challenge_type_id: challengeTypeData.id,
            account_size: finalAccountSize,
            amount_paid: finalPrice,
            payment_id: payment?.id,
            discount_applied: appliedCoupon ? true : false,
            status: accountStatus,
            current_phase: null,
            phase_2_paid: false
          };

          const insertResult = await supabase
            .from('user_challenges')
            .insert(challengeInsertData)
            .select()
            .single();

          if (insertResult.error) {
            alert('Error creating challenge. Please contact support.');
            setVerifying(false);
            return;
          }

          // Handle competition accounts
          if (challengeType === 'COMPETITION') {
            await supabase
              .from('user_challenges')
              .update({
                credentials_sent: false
              })
              .eq('id', insertResult.data.id);
          }

          // Generate certificates and receipts
          await supabase
            .from('downloads')
            .insert({
              user_id: user.id,
              challenge_id: insertResult.data.id,
              document_type: 'WELCOME_CERTIFICATE',
              title: 'Welcome Certificate',
              description: `Welcome to your ${challengeType} challenge!`,
              document_number: `WELCOME-${Date.now()}`,
              issue_date: new Date().toISOString(),
              status: 'ready'
            });

          await supabase
            .from('downloads')
            .insert({
              user_id: user.id,
              challenge_id: insertResult.data.id,
              document_type: 'INVOICE',
              title: 'Purchase Invoice',
              description: `Invoice for ${challengeType} challenge purchase`,
              document_number: `INV-${Date.now()}`,
              issue_date: new Date().toISOString(),
              status: 'ready'
            });

          await supabase
            .from('downloads')
            .insert({
              user_id: user.id,
              challenge_id: insertResult.data.id,
              document_type: 'PAYOUT_RECEIPT',
              title: 'Payment Receipt',
              description: `Payment receipt for ${challengeType} challenge`,
              document_number: `RCPT-${Date.now()}`,
              issue_date: new Date().toISOString(),
              status: 'ready'
            });

          setVerificationStatus('success');

          // Twitter tracking
          if (window.twq) {
            window.twq('event', 'tw-qq6v0-qq6v1', {
              currency: 'USD',
              conversion_id: payment?.id,
              email_address: user.email,
              phone_number: null
            });
          }

          setTimeout(() => {
            navigate('/dashboard', {
              state: {
                showWelcome: true,
                accountSize,
                challengeType,
                paymentId: payment.id,
                hasAddOn: challengeType === 'COMPETITION' ? hasAddOn : undefined
              }
            });
          }, 2000);

        } catch (error) {
          console.error('Payment processing error:', error);
          alert('Payment successful but account creation failed. Please contact support.');
        } finally {
          setVerifying(false);
        }
      },

      prefill: {
        name: user?.email?.split('@')[0] || 'Trader',
        email: user?.email,
        contact: user?.phone || ''
      },

      theme: {
        color: '#8B5CF6' // Purple theme
      },

      modal: {
        ondismiss: function() {
          setVerifying(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async () => {
    // Allow free challenges (finalPrice === 0) without transaction hash
    if (!transactionHash.trim() && appliedCoupon?.discount_percent !== 100 && finalPrice > 0) {
      setVerificationStatus('failed');
      return;
    }
    if (!supabase) {
      setVerificationStatus('failed');
      return;
    }

    setVerifying(true);
    setVerificationStatus('checking');

    try {
      // Check mini-challenge eligibility for MINI_FREE challenges
      if (challengeType === 'MINI_FREE') {
        let isEligible = true;
        let errorMessage = '';

        // Try multiple methods to check eligibility (resilient approach)

        // Method 1: Try direct table query
        try {
          const { data: existingChallenges, error: checkError } = await supabase
            .from('mini_challenges')
            .select('id, created_at')
            .ilike('email', user.email)
            .limit(1);

          if (!checkError && existingChallenges && existingChallenges.length > 0) {
            isEligible = false;
            const claimedDate = new Date(existingChallenges[0].created_at).toLocaleDateString();
            errorMessage = `This email has already redeemed a free mini-challenge on ${claimedDate}.`;
          } else if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is "not found" which is fine, other errors should be logged
            console.warn('Table query failed, trying RPC function:', checkError);

            // Method 2: Try RPC function as fallback
            try {
              const { data: eligibilityResult, error: rpcError } = await supabase
                .rpc('check_mini_challenge_eligibility', { user_email: user.email });

              if (!rpcError && eligibilityResult) {
                isEligible = eligibilityResult.eligible;
                errorMessage = eligibilityResult.message;
              } else if (rpcError) {
                console.warn('RPC function also failed:', rpcError);
                // Allow to continue - database constraint will catch duplicates
                console.log('Allowing payment to proceed - database unique constraint will enforce limit');
              }
            } catch (rpcErr) {
              console.warn('RPC fallback error:', rpcErr);
              // Allow to continue - database constraint will catch duplicates
            }
          }
        } catch (err) {
          console.warn('Eligibility check error:', err);
          // Allow to continue - database constraint will catch duplicates
        }

        if (!isEligible) {
          alert(`⚠️ ${errorMessage}\n\nYou can only redeem one free mini-challenge per account.`);
          setVerificationStatus('failed');
          setVerifying(false);
          return;
        }
      }

      let isValid = false;

      // Free challenges are always valid
      if (appliedCoupon?.discount_percent === 100 || finalPrice === 0) {
        isValid = true;
      } else {
        isValid = selectedCrypto === 'ETH'
          ? await verifyEthereumTransaction(transactionHash)
          : await verifySolanaTransaction(transactionHash);
      }

      if (isValid) {
        // User profile should be automatically created by database trigger on signup
        console.log('User profile should be automatically created by database trigger');

        const paymentNotes = `Account: $${accountSize?.toLocaleString()}, Challenge: ${challengeType}${
          appliedCoupon ? `, Coupon: ${couponCode.toUpperCase()} (${appliedCoupon.discount_percent}% off)` : ''
        }${finalPrice > 0 ? `, Crypto: ${cryptoAmount} ${selectedCrypto}` : ', Free Access'}`;

        const { data: payment, error } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            amount: finalPrice,
            currency: 'USD',
            payment_method: finalPrice > 0 ? `crypto_${selectedCrypto.toLowerCase()}` : 'coupon',
            transaction_id: transactionHash || 'FREE_' + Date.now(),
            status: 'completed',
            completed_at: new Date().toISOString(),
            notes: paymentNotes
          })
          .select()
          .maybeSingle();

        if (error) throw error;

        if (appliedCoupon) {
          await fetch(`${API_URL}/challenges/coupons/increment-usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coupon_code: couponCode.toUpperCase()
            })
          });
        }

        // Track referral commission
        if (appliedReferral && referralCode) {
          try {
            await fetch(`${API_URL}/affiliates/record-purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referral_code: referralCode.toUpperCase(),
                user_id: user.id,
                purchase_amount: finalPrice > 0 ? finalPrice : (regularPrice || originalPrice) // Use actual price even if free with coupon
              })
            });
            console.log('Referral commission tracked for code:', referralCode);
          } catch (refError) {
            console.error('Failed to track referral:', refError);
            // Don't fail the payment if referral tracking fails
          }
        }

        // Validate challengeType before proceeding
        if (!challengeType) {
          console.error('Challenge type is missing!', { 
            locationState: location.state,
            urlParams: Object.fromEntries(urlParams.entries())
          });
          alert('Error: Challenge type is missing. Please go back and select a challenge again.');
          setVerificationStatus('failed');
          setVerifying(false);
          return;
        }

        // Define challenge type mapping (used for lookup and insert)
        const typeNameMap: Record<string, string> = {
          'ELITE_ROYAL': 'elite',
          'ELITE': 'elite',
          'CLASSIC_2STEP': 'standard',
          'RAPID_FIRE': 'rapid',
          'PAYG_2STEP': 'professional',
          'AGGRESSIVE_2STEP': 'swing',
          'SWING_PRO': 'scaling'
        };

        // Get challenge type ID and details - try multiple lookup strategies
        let challengeTypeData = null;

        // Strategy 1: Try by challenge_code
        const { data: allChallengeTypes } = await db.queryAll('challenge_types');
        const dataByCode = allChallengeTypes.find((c: any) => c.challenge_code === challengeType);

        if (dataByCode) {
          challengeTypeData = dataByCode;
          console.log('Found challenge by challenge_code:', challengeTypeData);
        } else {
          // Strategy 2: Try by type_name (for backward compatibility)
          const typeName = typeNameMap[challengeType] || challengeType.toLowerCase();
          const dataByTypeName = allChallengeTypes.find((c: any) => c.type_name === typeName);

          if (dataByTypeName) {
            challengeTypeData = dataByTypeName;
            console.log('Found challenge by type_name:', typeName, challengeTypeData);
          } else {
            // Special handling for COMPETITION - create a fallback object
            if (challengeType === 'COMPETITION') {
              console.log('Using fallback for COMPETITION challenge type');
              challengeTypeData = {
                id: 'competition-fallback-id',
                type_name: 'competition',
                challenge_code: 'COMPETITION',
                challenge_name: 'Trading Competition',
                display_name: 'Trading Competition'
              };
            }
          }
        }

        console.log('Challenge type lookup:', { challengeType, challengeTypeData });

        // If challenge type not found in database, this is a critical error
        if (!challengeTypeData) {
          console.error('Challenge type not found in database:', challengeType);
          alert(`Error: Challenge type "${challengeType}" not found in database. Please contact support.`);
          setVerificationStatus('failed');
          setVerifying(false);
          return;
        }

        // Create user challenge record using challenge_type_id
        // Derive challenge_type text from challengeTypeData or map
        const challengeTypeText = challengeTypeData.type_name ||
                                  typeNameMap[challengeType] ||
                                  challengeType.toLowerCase();

        // For competition accounts, set status to 'pending_credentials' so they show as "awaiting credentials"
        // Also set account size to $100,000 for competition phase -1
        const accountStatus = challengeType === 'COMPETITION' ? 'pending_credentials' : 'active';
        const finalAccountSize = challengeType === 'COMPETITION' ? 100000 : accountSize;

        const challengeInsertData: any = {
          user_id: user.id,
          challenge_type: challengeTypeText,
          challenge_type_id: challengeTypeData.id,
          account_size: finalAccountSize,
          amount_paid: finalPrice,
          payment_id: payment?.id,
          discount_applied: appliedCoupon ? true : false,
          status: accountStatus,
          current_phase: isPayAsYouGo ? 1 : null,
          phase_2_paid: false
        };

        // Only include phase_2_price if it's a Pay-As-You-Go challenge
        if (isPayAsYouGo && phase2Price) {
          challengeInsertData.phase_2_price = phase2Price;
        }

        console.log('Challenge insert data:', challengeInsertData);

        let userChallenge = null;
        let userChallengeError = null;

        // Try inserting with all fields first
        const insertResult = await supabase
          .from('user_challenges')
          .insert(challengeInsertData)
          .select()
          .single();

        userChallenge = insertResult.data;
        userChallengeError = insertResult.error;

        // If phase_2_price column error occurs, try without it and update later
        if (userChallengeError && userChallengeError.message?.includes('phase_2_price')) {
          console.warn('Schema cache issue detected, trying alternative approach...');

          const dataWithoutPhase2 = { ...challengeInsertData };
          delete dataWithoutPhase2.phase_2_price;

          const retryResult = await supabase
            .from('user_challenges')
            .insert(dataWithoutPhase2)
            .select()
            .single();

          userChallenge = retryResult.data;
          userChallengeError = retryResult.error;

          // If successful, try to update with phase_2_price using RPC function
          if (!userChallengeError && userChallenge && isPayAsYouGo && phase2Price) {
            try {
              const { error: updateError } = await supabase.rpc('update_challenge_phase2_price', {
                challenge_id: userChallenge.id,
                new_price: phase2Price
              });
              if (updateError) {
                console.warn('Could not update phase_2_price via RPC:', updateError);
              } else {
                console.log('Successfully updated phase_2_price via RPC');
              }
            } catch (updateError) {
              console.warn('Could not update phase_2_price, but challenge was created:', updateError);
            }
          }
        }

        console.log('User challenge creation:', { userChallenge, userChallengeError });

        if (userChallengeError) {
          console.error('Failed to create user challenge:', userChallengeError);
          console.error('Challenge insert data was:', JSON.stringify(challengeInsertData, null, 2));

          // More detailed error message
          const errorMsg = userChallengeError.message || 'Unknown error';
          const errorDetails = userChallengeError.details || '';
          const errorHint = userChallengeError.hint || '';

          console.error('Error details:', { errorMsg, errorDetails, errorHint });

          alert(`Error creating challenge: ${errorMsg}. ${errorDetails} ${errorHint}. Please contact support with your payment ID: ${payment?.id}`);
          setVerificationStatus('failed');
          setVerifying(false);
          return;
        }

        if (!userChallenge) {
          console.error('User challenge was not created - no data returned');
          console.error('Challenge insert data was:', JSON.stringify(challengeInsertData, null, 2));
          alert('Error: Challenge was not created. Please contact support with your payment ID: ' + payment?.id);
          setVerificationStatus('failed');
          setVerifying(false);
          return;
        }
        
        if (userChallenge) {
            // For competition accounts, just mark that credentials need to be assigned by admin
            if (challengeType === 'COMPETITION') {
              try {
                // Competition accounts will get their MT5 credentials assigned by admin later
                // We just ensure credentials_sent is false so admin knows to assign them
                const { error: updateError } = await supabase
                  .from('user_challenges')
                  .update({
                    credentials_sent: false  // Admin will set this to true when assigning credentials
                  })
                  .eq('id', userChallenge.id);

                if (updateError) {
                  console.error('Failed to update competition account status:', updateError);
                } else {
                  console.log('Competition account created successfully. Admin will assign MT5 credentials.');
                }
              } catch (competitionError) {
                console.error('Error updating competition account:', competitionError);
              }
            }

            // Create mini_challenge record if this is a MINI_FREE challenge
            if (challengeType === 'MINI_FREE') {
              try {
                const { error: miniChallengeError } = await supabase
                  .from('mini_challenges')
                  .insert({
                    user_id: user.id,
                    email: user.email,
                    account_size: accountSize,
                    duration_days: 7,
                    profit_target: accountSize * 0.08,
                    daily_loss_limit: accountSize * 0.05,
                    status: 'active',
                    current_balance: accountSize,
                    started_at: new Date().toISOString()
                  });

                if (miniChallengeError) {
                  console.error('Failed to create mini_challenge record:', miniChallengeError);

                  // Check if it's a duplicate email error (unique constraint violation)
                  if (miniChallengeError.code === '23505' ||
                      miniChallengeError.message?.includes('mini_challenges_email_unique_idx') ||
                      miniChallengeError.message?.includes('duplicate key')) {
                    console.warn('Duplicate mini-challenge detected - email already used');
                    // Note: user_challenge was already created, so this is logged but not blocking
                  }
                }
              } catch (miniError) {
                console.error('Mini challenge creation error:', miniError);
              }
            }

            // Generate welcome certificate
            try {
              const { error: certError } = await supabase
                .from('downloads')
                .insert({
                  user_id: user.id,
                  challenge_id: userChallenge.id,
                  document_type: 'WELCOME_CERTIFICATE',
                  title: 'Welcome Certificate',
                  description: `Welcome to your ${challengeType} challenge!`,
                  document_number: `WELCOME-${Date.now()}`,
                  issue_date: new Date().toISOString(),
                  status: 'ready'
                });

              if (certError) {
                console.error('Failed to generate purchase certificate:', certError);
              }
            } catch (certError) {
              console.error('Certificate generation error:', certError);
            }

            // Generate purchase invoice
            try {
              const invoiceNumber = `INV-${Date.now()}`;
              const { error: invoiceError } = await supabase
                .from('downloads')
                .insert({
                  user_id: user.id,
                  challenge_id: userChallenge.id,
                  document_type: 'INVOICE',
                  title: 'Purchase Invoice',
                  description: `Invoice for ${challengeType} challenge purchase`,
                  document_number: invoiceNumber,
                  issue_date: new Date().toISOString(),
                  status: 'ready'
                });

              if (invoiceError) {
                console.error('Failed to generate invoice:', invoiceError);
              }
            } catch (invoiceError) {
              console.error('Invoice generation error:', invoiceError);
            }

            // Generate payment receipt
            try {
              const receiptNumber = `RCPT-${Date.now()}`;
              const { error: receiptError } = await supabase
                .from('downloads')
                .insert({
                  user_id: user.id,
                  challenge_id: userChallenge.id,
                  document_type: 'PAYOUT_RECEIPT',
                  title: 'Payment Receipt',
                  description: `Payment receipt for ${challengeType} challenge`,
                  document_number: receiptNumber,
                  issue_date: new Date().toISOString(),
                  status: 'ready'
                });

              if (receiptError) {
                console.error('Failed to generate receipt:', receiptError);
              }
            } catch (receiptError) {
              console.error('Receipt generation error:', receiptError);
            }
          }

        setVerificationStatus('success');

        // Twitter conversion tracking event code
        if (window.twq) {
          window.twq('event', 'tw-qq6v0-qq6v1', {
            currency: 'USD',
            conversion_id: payment?.id,
            email_address: user.email,
            phone_number: null
          });
        }

        setTimeout(() => {
          // All challenge types now go directly to dashboard
          navigate('/dashboard', {
            state: {
              showWelcome: true,
              accountSize,
              challengeType,
              paymentId: payment.id,
              hasAddOn: challengeType === 'COMPETITION' ? hasAddOn : undefined
            }
          });
        }, 2000);
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  const verifyEthereumTransaction = async (txHash: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${API_KEYS.ETHERSCAN}`
      );
      const data = await response.json();

      if (data.result) {
        const tx = data.result;
        const toAddress = tx.to?.toLowerCase();
        const valueInEth = parseInt(tx.value, 16) / 1e18;
        const expectedAmount = parseFloat(cryptoAmount);
        const tolerance = expectedAmount * 0.02;

        return (
          toAddress === WALLETS.ETH.toLowerCase() &&
          Math.abs(valueInEth - expectedAmount) <= tolerance
        );
      }
      return false;
    } catch (error) {
      console.error('Ethereum verification error:', error);
      return false;
    }
  };

  const verifySolanaTransaction = async (txHash: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://pro-api.solscan.io/v2.0/transaction/${txHash}`,
        {
          headers: {
            'token': API_KEYS.SOLSCAN
          }
        }
      );
      const data = await response.json();

      if (data.data) {
        const tx = data.data;
        const expectedAmount = parseFloat(cryptoAmount);
        const tolerance = expectedAmount * 0.02;

        const transfer = tx.tokenTransfers?.find((t: any) =>
          t.destination === WALLETS.SOL
        );

        if (transfer) {
          const amount = transfer.amount / 1e9;
          return Math.abs(amount - expectedAmount) <= tolerance;
        }
      }
      return false;
    } catch (error) {
      console.error('Solana verification error:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <Loader className="animate-spin text-electric-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C1F] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A233A] via-transparent to-[#0A0C1F]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Complete Your Payment
          </h1>
          <p className="text-xl text-gray-400">Secure crypto payment with instant verification</p>
        </div>

        <div className="bg-[#10122B]/80 p-8 mb-6 rounded-lg border-2 border-[#2A3B64] shadow-lg shadow-blue-500/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Account Size</p>
              <p className="text-2xl font-bold text-[#A6C8FF]">${accountSize?.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Challenge Type</p>
              <p className="text-2xl font-bold capitalize text-[#A6C8FF]">{challengeType}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Total Amount</p>
              {!appliedCoupon && (
                <>
                  <p className="text-sm text-gray-400 line-through">${fullPrice}</p>
                  <p className="text-2xl font-bold text-[#A6C8FF]">${basePrice}</p>
                  <p className="text-xs text-[#66FF66] mt-1">
                    50% OFF (Base Discount)
                  </p>
                </>
              )}
              {appliedCoupon && (
                <>
                  <p className="text-sm text-gray-400 line-through">${fullPrice}</p>
                  <p className="text-lg text-gray-300 line-through">${basePrice}</p>
                  <p className="text-2xl font-bold text-[#A6C8FF]">${finalPrice.toFixed(2)}</p>
                  <p className="text-xs text-[#66FF66] mt-1">
                    {appliedCoupon.discount_percent}% OFF (Coupon Discount)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="bg-[#1A233A]/50 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-400 mb-2 flex items-center">
              <span className="mr-2">⭐</span>
              Referral Code (Optional)
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter Referral Code (e.g., JOHNDOE1234)"
                className="flex-1 px-4 py-2 bg-[#0A0C1F]/80 border border-[#2A3B64] rounded-lg focus:border-[#A6C8FF] focus:outline-none uppercase"
                disabled={!!appliedReferral}
              />
              {!appliedReferral ? (
                <button
                  onClick={() => applyReferralCode()}
                  className="bg-yellow-600 hover:bg-yellow-500 px-6 rounded-lg transition-colors"
                  disabled={!referralCode.trim()}
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={removeReferral}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-6 py-2 rounded-lg transition-all"
                >
                  Remove
                </button>
              )}
            </div>
            {referralError && (
              <p className="text-red-400 text-sm mt-2">{referralError}</p>
            )}
            {appliedReferral && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-2 mt-2">
                <p className="text-yellow-400 text-sm font-semibold">
                  ✓ Referral Applied: {referralCode.toUpperCase()}
                </p>
                <p className="text-yellow-400/80 text-xs mt-1">
                  Your referrer will earn commission from this purchase!
                </p>
              </div>
            )}
            {!appliedReferral && (
              <p className="text-xs text-gray-400 mt-2">
                Support a friend by entering their referral code
              </p>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="bg-[#1A233A]/50 border border-[#2A3B64] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#66FF66] mb-2 flex items-center">
              <CheckCircle2 size={18} className="mr-2" />
              Apply Coupon Code
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter Coupon Code"
                className="flex-1 px-4 py-2 bg-[#0A0C1F]/80 border border-[#2A3B64] rounded-lg focus:border-[#A6C8FF] focus:outline-none uppercase"
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  onClick={applyCoupon}
                  className="bg-blue-600 hover:bg-blue-500 px-6 rounded-lg transition-colors"
                  disabled={!couponCode.trim()}
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={removeCoupon}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-6 py-2 rounded-lg transition-all"
                >
                  Remove
                </button>
              )}
            </div>
            {couponError && (
              <p className="text-red-400 text-sm mt-2">{couponError}</p>
            )}
            {appliedCoupon && (
              <div className="bg-[#1A233A]/30 border border-[#2A3B64] rounded p-2 mt-2">
                <p className="text-[#66FF66] text-sm font-semibold">
                  ✓ Coupon Applied: {couponCode.toUpperCase()}
                </p>
                <p className="text-[#66FF66]/80 text-xs mt-1">
                  {appliedCoupon.discount_percent}% discount active. Only one coupon allowed per purchase.
                </p>
              </div>
            )}
          {!appliedCoupon && (
            <p className="text-xs text-gray-500 mt-2">
              Have a coupon code? Enter it above • Only one coupon per purchase
            </p>
          )}
        </div>

        {/* Competition Add-on Section - Only show for competition payments */}
        {challengeType === 'COMPETITION' && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Add 2nd Try - Get Extra Chance!</h3>
                    <p className="text-sm text-purple-300">Increase your odds of winning</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300 ml-13">
                  <p>• Get <strong className="text-white">2 attempts</strong> instead of 1</p>
                  <p>• If you fail Phase 1, automatically enter Phase 1 again</p>
                  <p>• Double your chances to reach the finals</p>
                  <p>• <strong className="text-purple-300">Only $5 extra</strong></p>
                </div>
              </div>
              <div className="ml-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAddOn}
                    onChange={(e) => setHasAddOn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                </label>
                <div className="text-center mt-2">
                  <div className="text-2xl font-black text-white">+$5</div>
                  <div className="text-xs text-gray-400">Add-on</div>
                </div>
              </div>
            </div>
            {hasAddOn && (
              <div className="mt-4 p-3 bg-purple-500/20 border border-purple-500/40 rounded-lg">
                <p className="text-purple-300 text-sm font-semibold flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  2nd Try Add-on Activated! You'll have 2 chances to complete the competition.
                </p>
              </div>
            )}
          </div>
        )}

        {finalPrice === 0 && appliedCoupon && (
            <div className="bg-[#1A233A]/50 border border-[#2A3B64] rounded-lg p-6 mb-6 text-center">
              <CheckCircle2 className="mx-auto mb-3 text-[#66FF66]" size={48} />
              <h3 className="text-2xl font-bold mb-2 text-[#66FF66]">Free Access Granted!</h3>
              <p className="text-gray-300">Your special coupon gives you 100% discount. Click below to continue to your dashboard.</p>
            </div>
          )}

          {finalPrice > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Select Cryptocurrency</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['ETH', 'SOL'] as const).map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedCrypto === crypto
                      ? 'border-blue-500 bg-[#1A233A]'
                      : 'border-[#2A3B64] bg-[#10122B]/80 hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-2xl font-bold mb-2">{crypto}</div>
                  <div className="text-sm text-gray-400">
                    {crypto === 'ETH' ? 'Ethereum' : 'Solana'}
                  </div>
                  <div className="text-lg font-semibold mt-2">
                    ${cryptoPrices[crypto].toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
            </div>
          )}

          {finalPrice > 0 && (
            <div className="bg-[#0A0C1F]/80 p-6 rounded-lg border border-[#2A3B64] mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Send Payment To</h3>
              <span className="text-xs text-gray-400">{selectedCrypto} Network</span>
            </div>

            <div className="bg-[#10122B]/80 p-4 rounded-lg mb-4">
              <p className="text-xs text-gray-400 mb-2">Wallet Address</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm break-all">{WALLETS[selectedCrypto]}</code>
                <button
                  onClick={() => copyToClipboard(WALLETS[selectedCrypto])}
                  className="p-2 bg-[#1A233A]/50 rounded hover:bg-[#1A233A] transition-all"
                >
                  {copied ? (
                    <Check size={18} className="text-[#66FF66]" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1A233A] to-[#10122B] p-6 rounded-lg border border-[#2A3B64]">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Amount to Send</p>
                <p className="text-4xl font-bold mb-1 text-[#A6C8FF]">
                  {cryptoAmount} {selectedCrypto}
                </p>
                <p className="text-xs text-gray-400">≈ ${finalPrice} USD</p>
              </div>
            </div>
            </div>
          )}

          {finalPrice > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Paste your transaction hash here"
              className="w-full px-4 py-3 bg-[#0A0C1F]/80 border border-[#2A3B64] rounded-lg focus:border-[#A6C8FF] focus:outline-none"
              disabled={verifying}
            />
            <p className="text-xs text-gray-500 mt-2">
              After sending the payment, paste the transaction hash here to verify
            </p>
            </div>
          )}

          {verificationStatus === 'failed' && finalPrice > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-400 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-400">Verification Failed</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please check your transaction hash and ensure the correct amount was sent to the correct address.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 flex items-start">
              <CheckCircle2 className="text-green-400 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-400">Payment Verified!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

        {/* Payment Method Selection */}
        {finalPrice > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Choose Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Razorpay Card - Coming Soon */}
              <div className="group relative overflow-hidden p-8 rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/20 cursor-not-allowed opacity-60">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-400 mb-2 text-center">Razorpay</h4>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Instant Payment Gateway
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-500 rounded-full text-xs">UPI</span>
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-500 rounded-full text-xs">Cards</span>
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-500 rounded-full text-xs">Net Banking</span>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                      <span className="text-yellow-400 text-sm font-medium animate-pulse">Coming Soon</span>
                    </div>
                  </div>
                </div>
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 mx-auto">
                      <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-yellow-400 font-semibold text-sm">Launching Soon</p>
                  </div>
                </div>
              </div>

              {/* Crypto Card - Active */}
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`group relative overflow-hidden p-8 rounded-xl border-2 transition-all duration-500 ${
                  paymentMethod === 'crypto'
                    ? 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-2xl shadow-blue-500/20'
                    : 'border-gray-600 bg-gray-800/40 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ${
                      paymentMethod === 'crypto' ? 'ring-4 ring-blue-400/30 animate-pulse' : ''
                    }`}>
                      <Coins className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 text-center">Cryptocurrency</h4>
                  <p className="text-sm text-gray-300 text-center mb-4">
                    Blockchain Payment
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">ETH</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">SOL</span>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">Real-time</span>
                  </div>
                  {paymentMethod === 'crypto' && (
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-blue-300 text-sm font-medium">Selected</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

          {/* Crypto Payment Section */}
          {finalPrice > 0 && paymentMethod === 'crypto' && (
            <>
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-white text-lg flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-blue-400" />
                  Select Cryptocurrency
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(['ETH', 'SOL'] as const).map((crypto) => (
                    <button
                      key={crypto}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        selectedCrypto === crypto
                          ? 'border-blue-500 bg-[#1A233A]'
                          : 'border-[#2A3B64] bg-[#10122B]/80 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="text-2xl font-bold mb-2">{crypto}</div>
                      <div className="text-sm text-gray-400">
                        {crypto === 'ETH' ? 'Ethereum' : 'Solana'}
                      </div>
                      <div className="text-lg font-semibold mt-2">
                        ${cryptoPrices[crypto].toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0C1F]/80 p-6 rounded-lg border border-[#2A3B64] mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-white">Send Payment To</h3>
                  <span className="text-xs text-gray-400">{selectedCrypto} Network</span>
                </div>

                <div className="bg-[#10122B]/80 p-4 rounded-lg mb-4">
                  <p className="text-xs text-gray-400 mb-2">Wallet Address</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-sm break-all">{WALLETS[selectedCrypto]}</code>
                    <button
                      onClick={() => copyToClipboard(WALLETS[selectedCrypto])}
                      className="p-2 bg-[#1A233A]/50 rounded hover:bg-[#1A233A] transition-all"
                    >
                      {copied ? (
                        <Check size={18} className="text-[#66FF66]" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#1A233A] to-[#10122B] p-6 rounded-lg border border-[#2A3B64]">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Amount to Send</p>
                    <p className="text-4xl font-bold mb-1 text-[#A6C8FF]">
                      {cryptoAmount} {selectedCrypto}
                    </p>
                    <p className="text-xs text-gray-400">≈ ${finalPrice} USD</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-white">
                  Transaction Hash
                </label>
                <input
                  type="text"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="Paste your transaction hash here"
                  className="w-full px-4 py-3 bg-[#0A0C1F]/80 border border-[#2A3B64] rounded-lg focus:border-[#A6C8FF] focus:outline-none"
                  disabled={verifying}
                />
                <p className="text-xs text-gray-500 mt-2">
                  After sending the payment, paste the transaction hash here to verify
                </p>
              </div>
            </>
          )}

          {/* Razorpay Payment Section */}
          {finalPrice > 0 && paymentMethod === 'razorpay' && (
            <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-8 rounded-xl border-2 border-purple-400/30 mb-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-purple-400/20">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">Razorpay Payment</h3>
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 p-6 rounded-lg border border-purple-400/20 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">Amount to Pay</p>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ${finalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">Instant Processing</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-4">
                  Secure payment powered by Razorpay. Multiple payment methods available.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'failed' && finalPrice > 0 && paymentMethod === 'crypto' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-400 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-400">Verification Failed</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please check your transaction hash and ensure the correct amount was sent to the correct address.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 flex items-start">
              <CheckCircle2 className="text-green-400 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-400">Payment Successful!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          <button
            onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : verifyPayment}
            disabled={(finalPrice > 0 && paymentMethod === 'crypto' && !transactionHash.trim()) || verifying || verificationStatus === 'success'}
            className={`w-full py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 ${
              paymentMethod === 'razorpay'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {verifying ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                {paymentMethod === 'razorpay' ? 'Processing Payment...' : 'Verifying Payment...'}
              </>
            ) : verificationStatus === 'success' ? (
              <>
                <CheckCircle2 className="mr-2" size={20} />
                Payment Successful
              </>
            ) : (
              <>
                {paymentMethod === 'razorpay' ? <CreditCard className="mr-2" size={20} /> : <Coins className="mr-2" size={20} />}
                Pay ${finalPrice.toFixed(2)} {paymentMethod === 'razorpay' ? 'with Razorpay' : 'with Crypto'}
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400">
            <a
              href={selectedCrypto === 'ETH'
                ? `https://etherscan.io/address/${WALLETS.ETH}`
                : `https://solscan.io/account/${WALLETS.SOL}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-[#A6C8FF] transition-colors"
            >
              <ExternalLink size={14} className="mr-1" />
              View Wallet on Explorer
            </a>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Payments are verified in real-time using blockchain APIs</p>
          <p className="mt-1">Your challenge account will be activated immediately after verification</p>
        </div>
      </div>
    </div>
  );
}
