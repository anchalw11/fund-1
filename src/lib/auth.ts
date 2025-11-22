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

  try {
    console.log('🔄 Attempting signup for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          country: country || '',
          email: email
        }
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
      if (error.message?.includes('already registered')) {
        return { success: false, error: 'User already exists. Please login instead.' };
      }
      return { success: false, error: error.message || 'Signup failed' };
    }

    if (!data.user) {
      console.error('❌ No user data returned from signup');
      return { success: false, error: 'Signup failed - no user data' };
    }

    console.log('✅ User created successfully:', data.user.id);

    // If we get here, signup worked! Skip profile creation entirely
    // The profile will be created manually when first needed, or can be deferred

    return {
      success: true,
      user: data.user,
      autoVerified: true,
      message: 'Account created successfully!'
    };

  } catch (error: any) {
    console.error('💥 Unexpected error during signup:', error);
    return { success: false, error: error.message || 'Unexpected error occurred' };
  }
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
