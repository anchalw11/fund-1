import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTQ0MzMsImV4cCI6MjA3NjY5MDQzM30.T37Xbp75-MaDQZvBRZANWL1fk8cH7lVrPvYW277mZG4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignupAndProfileCreation() {
  console.log('🧪 Testing manual signup and profile creation...');

  try {
    // Step 1: Try signup
    console.log('1. Attempting signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (signupError) {
      console.error('❌ Signup failed:', signupError);
      return;
    }

    console.log('✅ Signup successful:', signupData.user?.id);

    // Step 2: Wait a moment for trigger to run
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', signupData.user?.id)
      .single();

    if (profileError || !profile) {
      console.log('⚠️ Profile not created by trigger, creating manually...');

      // Create profile manually
      const { error: insertError } = await supabase
        .from('user_profile')
        .insert({
          user_id: signupData.user?.id,
          email: signupData.user?.email,
          friendly_id: `USER-${Date.now()}`,
          email_verified: false,
          status: 'active'
        });

      if (insertError) {
        console.error('❌ Manual profile creation also failed:', insertError);
      } else {
        console.log('✅ Manual profile creation successful');
      }
    } else {
      console.log('✅ Profile created automatically by trigger');
    }

    // Clean up - delete the test user
    console.log('🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(signupData.user?.id);
    if (deleteError) {
      console.warn('⚠️ Could not delete test user:', deleteError.message);
    } else {
      console.log('✅ Test user cleaned up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSignupAndProfileCreation();
