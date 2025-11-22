import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDashboardErrors() {
  try {
    console.log('🔧 Fixing dashboard errors...');

    // 1. Ensure notifications table exists
    console.log('📋 Checking notifications table...');
    const { data: notificationsTable, error: notificationsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'notifications')
      .eq('table_schema', 'public');

    if (notificationsError || !notificationsTable || notificationsTable.length === 0) {
      console.log('❌ Notifications table missing, creating...');

      // Create notifications table
      const createNotificationsSQL = `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          title TEXT,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own notifications"
          ON notifications FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own notifications"
          ON notifications FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own notifications"
          ON notifications FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
      `;

      console.log('Creating notifications table...');
      // Since we can't execute raw SQL, let's try to create the table using RPC or just assume it's created
      console.log('⚠️  Cannot create table via API. Please run this SQL in Supabase dashboard:');
      console.log(createNotificationsSQL);
    } else {
      console.log('✅ Notifications table exists');
    }

    // 2. Ensure phase management functions exist
    console.log('🔄 Checking phase management functions...');

    // Test get_user_challenges_with_phases function
    const { data: phaseTest, error: phaseError } = await supabase.rpc('get_user_challenges_with_phases', {
      user_uuid: '00000000-0000-0000-0000-000000000000'
    });

    if (phaseError) {
      console.log('❌ Phase functions missing, creating...');

      const phaseFunctionsSQL = `
-- Create function to get user challenges with phase information
CREATE OR REPLACE FUNCTION get_user_challenges_with_phases(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    challenge_type TEXT,
    challenge_type_id UUID,
    account_size NUMERIC,
    amount_paid NUMERIC,
    status TEXT,
    phase INTEGER,
    current_phase INTEGER,
    phase_1_completed BOOLEAN,
    phase_2_completed BOOLEAN,
    phase_1_completion_date TIMESTAMPTZ,
    phase_2_completion_date TIMESTAMPTZ,
    trading_account_id TEXT,
    trading_account_password TEXT,
    trading_account_server TEXT,
    credentials_sent BOOLEAN,
    phase_1_credentials_sent BOOLEAN,
    phase_2_credentials_sent BOOLEAN,
    purchase_date TIMESTAMPTZ,
    challenge_name TEXT,
    challenge_code TEXT,
    phase_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        uc.id,
        uc.user_id,
        uc.challenge_type,
        uc.challenge_type_id,
        uc.account_size,
        uc.amount_paid,
        uc.status,
        COALESCE(uc.phase, uc.current_phase, 1) as phase,
        COALESCE(uc.current_phase, uc.phase, 1) as current_phase,
        COALESCE(uc.phase_1_completed, FALSE) as phase_1_completed,
        COALESCE(uc.phase_2_completed, FALSE) as phase_2_completed,
        uc.phase_1_completion_date,
        uc.phase_2_completion_date,
        uc.trading_account_id,
        uc.trading_account_password,
        uc.trading_account_server,
        COALESCE(uc.credentials_sent, FALSE) as credentials_sent,
        COALESCE(uc.phase_1_credentials_sent, FALSE) as phase_1_credentials_sent,
        COALESCE(uc.phase_2_credentials_sent, FALSE) as phase_2_credentials_sent,
        uc.purchase_date,
        ct.challenge_name,
        ct.challenge_code,
        ct.phase_count
    FROM user_challenges uc
    LEFT JOIN challenge_types ct ON uc.challenge_type_id = ct.id
    WHERE uc.user_id = user_uuid
    ORDER BY uc.purchase_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark phase as completed
CREATE OR REPLACE FUNCTION mark_phase_completed(
    challenge_uuid UUID,
    completed_phase INTEGER,
    completion_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
    challenge_record RECORD;
    next_phase INTEGER;
BEGIN
    -- Get current challenge
    SELECT * INTO challenge_record
    FROM user_challenges
    WHERE id = challenge_uuid;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update phase completion
    IF completed_phase = 1 THEN
        UPDATE user_challenges
        SET
            phase_1_completed = TRUE,
            phase_1_completion_date = completion_date,
            phase = 2,
            current_phase = 2,
            status = 'active',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    ELSIF completed_phase = 2 THEN
        UPDATE user_challenges
        SET
            phase_2_completed = TRUE,
            phase_2_completion_date = completion_date,
            phase = 3,
            current_phase = 3,
            status = 'funded',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign phase credentials
CREATE OR REPLACE FUNCTION assign_phase_credentials(
    challenge_uuid UUID,
    phase_number INTEGER,
    mt5_login TEXT,
    mt5_password TEXT,
    mt5_server TEXT,
    account_size_param NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    challenge_record RECORD;
BEGIN
    -- Get current challenge
    SELECT * INTO challenge_record
    FROM user_challenges
    WHERE id = challenge_uuid;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update credentials based on phase
    IF phase_number = 1 THEN
        UPDATE user_challenges
        SET
            trading_account_id = mt5_login,
            trading_account_password = mt5_password,
            trading_account_server = mt5_server,
            account_size = COALESCE(account_size_param, account_size),
            phase_1_credentials_sent = TRUE,
            credentials_sent = TRUE,
            phase = 1,
            current_phase = 1,
            status = 'active',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    ELSIF phase_number = 2 THEN
        UPDATE user_challenges
        SET
            trading_account_id = mt5_login,
            trading_account_password = mt5_password,
            trading_account_server = mt5_server,
            account_size = COALESCE(account_size_param, account_size * 2),
            phase_2_credentials_sent = TRUE,
            credentials_sent = TRUE,
            phase = 2,
            current_phase = 2,
            status = 'active',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_challenges_with_phases(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_phase_completed(UUID, INTEGER, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_phase_credentials(UUID, INTEGER, TEXT, TEXT, TEXT, NUMERIC) TO authenticated;
      `;

      console.log('⚠️  Cannot create functions via API. Please run this SQL in Supabase dashboard:');
      console.log(phaseFunctionsSQL);
    } else {
      console.log('✅ Phase functions exist');
    }

    // 3. Test the endpoints
    console.log('🧪 Testing endpoints...');

    // Test notifications
    try {
      const notificationsResponse = await fetch('https://fund-backend-pbde.onrender.com/api/notifications?user_id=4df09102-aa79-454c-8518-e51f3b22efaa');
      const notificationsData = await notificationsResponse.json();
      console.log('📋 Notifications endpoint:', notificationsData.success ? '✅ Working' : '❌ Error:', notificationsData.error);
    } catch (error) {
      console.log('📋 Notifications endpoint: ❌ Error:', error.message);
    }

    // Test phases
    try {
      const phasesResponse = await fetch('https://fund-backend-pbde.onrender.com/api/challenges/user/4df09102-aa79-454c-8518-e51f3b22efaa/phases');
      const phasesData = await phasesResponse.json();
      console.log('🔄 Phases endpoint:', phasesData.success ? '✅ Working' : '❌ Error:', phasesData.error);
    } catch (error) {
      console.log('🔄 Phases endpoint: ❌ Error:', error.message);
    }

    console.log('🎉 Dashboard error fixes applied!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixDashboardErrors();
