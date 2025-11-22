import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Helper function to create a Supabase client safely
// If env vars are missing, it creates a mock client to prevent crashes
const createSafeClient = (url, key, name, options = {}) => {
  if (!url || !key) {
    console.error(`⚠️ Supabase config for "${name}" is missing URL or key. Using a mock client.`);
    return {
      from: (table) => ({
        select: async () => {
          console.warn(`Mock Supabase call to "${name}.${table}"`);
          return { data: [], error: new Error(`Mock client for ${name}: Missing config.`) };
        },
      }),
      rpc: async () => {
        return { data: [], error: new Error(`Mock client for ${name}: Missing config.`) };
      }
    };
  }
  console.log(`✅ Supabase client created for "${name}"`);
  return createClient(url, key, options);
};


// PRIMARY DATABASE (Using CORRECT database where users are stored)
const supabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';
export const supabase = createSafeClient(supabaseUrl, supabaseServiceKey, 'PRIMARY', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// OLD DATABASE (Legacy - for migration)
const oldSupabaseUrl = 'https://mvgcwqmsawopumuksqmz.supabase.co';
const oldSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Z2N3cW1zYXdvcHVtdWtzcW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4OTk0NjAsImV4cCI6MjA0NDQ3NTQ2MH0.qnT8kGxI0fkPBPdqIRkNXlkqTQfcVKwLLtHhPRa0Uqc';
export const oldSupabase = createSafeClient(oldSupabaseUrl, oldSupabaseKey, 'OLD', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storageKey: 'supabase-old-db'
  }
});

// NEW DATABASE (Production)
const newSupabaseUrl = 'https://sjccpdfdhoqjywuitjju.supabase.co';
const newSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2NwZGZkaG9xanl3dWl0amp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3NjU5NiwiZXhwIjoyMDc3MTUyNTk2fQ.sxI2LjZfzVvc4YSgTwDEifcRJOpcSsyVmNfqqkpEei0';
export const newSupabase = createSafeClient(newSupabaseUrl, newSupabaseKey, 'NEW', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storageKey: 'supabase-new-db'
  }
});

// BOLT DATABASE (Fallback)
const boltSupabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const boltSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';
export const boltSupabase = createSafeClient(boltSupabaseUrl, boltSupabaseKey, 'BOLT', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'supabase-bolt-db'
  }
});

console.log('✅ Database configuration loaded.');
