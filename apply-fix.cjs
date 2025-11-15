const { Client } = require('pg');

const connectionString = 'postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA@db.cjjobdopkkbwexfxwosb.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function applyFix() {
  try {
    await client.connect();
    const res = await client.query('ALTER TABLE public.ticket_messages ADD COLUMN is_admin BOOLEAN DEFAULT false;');
    console.log(res);
    await client.end();
  } catch (err) {
    console.error('Error executing SQL:', err);
  }
}

applyFix();
