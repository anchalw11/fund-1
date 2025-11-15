import { createClient } from '@supabase/supabase-js';

// PRIMARY DATABASE (Supabase)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Primary Supabase credentials:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase-primary-db'
      },
      global: {
        headers: {
          'Prefer': 'return=representation'
        }
      }
    })
  : null;

// SERVICE ROLE CLIENT (bypasses RLS - use carefully!)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// BOLT DATABASE (Fallback)
const boltSupabaseUrl = import.meta.env.VITE_BOLT_SUPABASE_URL;
const boltSupabaseKey = import.meta.env.VITE_BOLT_SUPABASE_ANON_KEY;

export const boltSupabase = boltSupabaseUrl && boltSupabaseKey
  ? createClient(boltSupabaseUrl, boltSupabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'supabase-bolt-db'
      }
    })
  : null;

// OLD DATABASE (Legacy - for migration)
const oldSupabaseUrl = import.meta.env.VITE_OLD_SUPABASE_URL;
const oldSupabaseKey = import.meta.env.VITE_OLD_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_OLD_SUPABASE_ANON_KEY;

export const oldSupabase = oldSupabaseUrl && oldSupabaseKey
  ? createClient(oldSupabaseUrl, oldSupabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'supabase-old-db'
      }
    })
  : null;

// NEW DATABASE (Production)
const newSupabaseUrl = 'https://sjccpdfdhoqjywuitjju.supabase.co';
const newSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2NwZGZkaG9xanl3dWl0amp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY1OTYsImV4cCI6MjA3NzE1MjU5Nn0.Wc28cOvXMK0F_E1DSNyEP4jyKaOTaQNsriMS5fIzZZs';

export const newSupabase = createClient(newSupabaseUrl, newSupabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'supabase-new-db'
      }
    });

// BACKEND DATABASE (for auth.users access)
const backendSupabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const backendSupabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';

export const backendSupabase = createClient(backendSupabaseUrl, backendSupabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'supabase-backend-db'
      }
    });

export const db = {
  query: async (text: string, params: any[] = []) => {
    if (!supabase) {
      console.warn('Supabase not initialized - using fallback');
      return { rows: [] };
    }

    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: text,
        params: params,
      });

      if (error) throw error;
      return { rows: data || [] };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  queryAll: async (tableName: string) => {
    const clients = [supabase, newSupabase, oldSupabase].filter(Boolean);
    const results = await Promise.all(
      clients.map(client => client!.from(tableName).select('*'))
    );

    const allData = results.flatMap(result => result.data || []);
    return { data: allData, error: null };
  },
};
