import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const connectionString = 'postgresql://postgres.cjjobdopkkbwexfxwosb:Sanjay@123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  console.log('Connected to database\n');

  // Check policies on user_profile
  console.log('=== USER_PROFILE POLICIES ===');
  const policiesQuery = `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE tablename = 'user_profile'
    ORDER BY policyname;
  `;
  
  const policies = await client.query(policiesQuery);
  console.log('Found', policies.rows.length, 'policies:');
  policies.rows.forEach(p => {
    console.log(`\nPolicy: ${p.policyname}`);
    console.log(`  Command: ${p.cmd}`);
    console.log(`  USING: ${p.qual}`);
    console.log(`  WITH CHECK: ${p.with_check}`);
  });

  // Check if admin_roles table exists
  console.log('\n\n=== CHECKING ADMIN_ROLES TABLE ===');
  const tableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_roles'
    );
  `);
  console.log('admin_roles table exists:', tableCheck.rows[0].exists);

  await client.end();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
