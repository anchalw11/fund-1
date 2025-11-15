import { supabase } from './db';
import { sendWelcomeEmail } from '../services/emailService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email,
    first_name: user.user_metadata?.first_name || '',
    last_name: user.user_metadata?.last_name || '',
    email_verified: user.email_confirmed_at !== null
  };
}

export async function signUp(email: string, password: string, firstName: string, lastName: string, country?: string) {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });

  // Check if user already exists
  if (error?.message?.includes('already registered')) {
    return { success: false, error: 'User already exists. Please login instead.' };
  }

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Signup failed' };
  }

  // User profile is automatically created by database trigger (auto_create_user_profile)
  console.log('✅ User profile will be created automatically by database trigger');

  // Send verification code via backend API (REQUIRED - but allow in development if email fails)
  let verificationSent = false;
  let verificationError = '';
  let verificationCode = '';

  try {
    console.log('Attempting to send verification code to:', email);
    console.log('API URL:', `${API_URL}/verification/send-code`);

    const response = await fetch(`${API_URL}/verification/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
      mode: 'cors',
      credentials: 'include'
    });

    console.log('Verification API response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('Verification API result:', result);

      if (result.success) {
        console.log('✅ Verification code sent successfully');
        verificationSent = true;
        verificationCode = result.code || '';
      } else {
        console.error('❌ Verification code not sent:', result.message || result.error);
        verificationError = result.message || result.error || 'Failed to send verification code';
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Verification email request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      verificationError = `Server error: ${response.status} ${response.statusText}`;
    }
  } catch (error: any) {
    console.error('❌ Error sending verification code:', error.message);
    verificationError = error.message || 'Network error occurred';
  }

  // Skip email verification - auto-verify users
  console.log('✅ User auto-verified - skipping email verification step');

  return {
    success: true,
    user: data.user,
    autoVerified: true,
    message: 'Account created successfully!'
  };
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Login failed' };
  }

  // Send sign-in notification email (non-blocking)
  try {
    const name = `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim() || 'User';

    fetch(`${API_URL}/email/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.user.email,
        name: name,
        ipAddress: 'Web Login'
      })
    }).catch(err => {
      console.warn('Failed to send sign-in email (non-critical):', err);
    });
  } catch (err) {
    console.warn('Error sending sign-in email:', err);
  }

  return { success: true, user: data.user };
}

export async function signOut() {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  const { error } = await supabase.auth.signOut();
  return { success: !error, error: error?.message };
}

export async function getSession() {
  if (!supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}
