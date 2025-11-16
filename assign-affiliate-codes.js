#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class AffiliateCodeAssigner {
  generateAffiliateCode(userId) {
    const hash = crypto.createHash('sha256').update(userId + Date.now()).digest('hex');
    return hash.substring(0, 10).toUpperCase();
  }

  async getAllUsers() {
    try {
      console.log('📋 Fetching all users from auth.users...');
      const { data: users, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;

      // Transform the data to match our expected format
      const transformedUsers = users.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }));

      console.log(`✅ Found ${transformedUsers.length} users`);
      return transformedUsers;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  async getExistingAffiliates() {
    try {
      console.log('📋 Checking existing affiliates...');
      const { data: affiliates, error } = await supabase
        .from('affiliates')
        .select('user_id, referral_code');

      if (error) {
        console.warn('⚠️ Affiliates table might not exist yet:', error.message);
        return [];
      }

      console.log(`✅ Found ${affiliates.length} existing affiliates`);
      return affiliates;
    } catch (error) {
      console.warn('⚠️ Error checking existing affiliates:', error.message);
      return [];
    }
  }

  async createAffiliate(userId, affiliateCode) {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: userId,
          referral_code: affiliateCode,
          commission_rate: 10,
          total_referrals: 0,
          total_earnings: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`❌ Error creating affiliate for user ${userId}:`, error);
      throw error;
    }
  }

  async assignCodesToAllUsers() {
    try {
      console.log('🚀 Starting affiliate code assignment process...\n');

      // Get all users
      const users = await this.getAllUsers();

      // Get existing affiliates
      const existingAffiliates = await this.getExistingAffiliates();
      const existingUserIds = new Set(existingAffiliates.map(a => a.user_id));

      // Filter users who don't have affiliate codes yet
      const usersWithoutCodes = users.filter(user => !existingUserIds.has(user.id));

      console.log(`📊 Summary:`);
      console.log(`   Total users: ${users.length}`);
      console.log(`   Existing affiliates: ${existingAffiliates.length}`);
      console.log(`   Users needing codes: ${usersWithoutCodes.length}\n`);

      if (usersWithoutCodes.length === 0) {
        console.log('✅ All users already have affiliate codes!');
        return;
      }

      console.log('🔄 Assigning affiliate codes to users...\n');

      let successCount = 0;
      let errorCount = 0;

      for (const user of usersWithoutCodes) {
        try {
          const affiliateCode = this.generateAffiliateCode(user.id);
          await this.createAffiliate(user.id, affiliateCode);

          console.log(`✅ ${user.email} → ${affiliateCode}`);
          successCount++;
        } catch (error) {
          console.log(`❌ ${user.email} → Failed`);
          errorCount++;
        }
      }

      console.log(`\n📊 Assignment Results:`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);
      console.log(`   📈 Success Rate: ${((successCount / usersWithoutCodes.length) * 100).toFixed(1)}%\n`);

      if (successCount > 0) {
        console.log('🎉 Affiliate codes have been assigned to all users!');
        console.log('📋 Users can now access their affiliate codes in the dashboard.');
      }

    } catch (error) {
      console.error('💥 Fatal error during assignment:', error);
      process.exit(1);
    }
  }

  async verifyAssignments() {
    try {
      console.log('🔍 Verifying affiliate code assignments...\n');

      // Get users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const users = authUsers.users.map(user => ({
        id: user.id,
        email: user.email
      }));

      const { data: affiliates, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('user_id, referral_code');

      if (affiliatesError) throw affiliatesError;

      const affiliateMap = new Map(affiliates.map(a => [a.user_id, a.referral_code]));

      console.log('📋 Current Affiliate Code Assignments:');
      console.log('=' .repeat(60));

      let assignedCount = 0;
      for (const user of users) {
        const code = affiliateMap.get(user.id);
        if (code) {
          console.log(`${(user.email || 'unknown').padEnd(30)} → ${code}`);
          assignedCount++;
        } else {
          console.log(`${(user.email || 'unknown').padEnd(30)} → NO CODE ASSIGNED`);
        }
      }

      console.log('=' .repeat(60));
      console.log(`📊 Total Users: ${users.length}`);
      console.log(`✅ With Codes: ${assignedCount}`);
      console.log(`❌ Without Codes: ${users.length - assignedCount}`);

      if (assignedCount === users.length) {
        console.log('\n🎉 All users have affiliate codes!');
      } else {
        console.log(`\n⚠️ ${users.length - assignedCount} users still need codes.`);
      }

    } catch (error) {
      console.error('❌ Error during verification:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const assigner = new AffiliateCodeAssigner();

  try {
    console.log('🎯 FUND8R Affiliate Code Assignment Tool');
    console.log('=======================================\n');

    // Check command line arguments
    const command = process.argv[2];

    if (command === 'verify') {
      await assigner.verifyAssignments();
    } else {
      await assigner.assignCodesToAllUsers();
      console.log('\n🔍 Running verification...');
      await assigner.verifyAssignments();
    }

    console.log('\n✨ Process completed successfully!');

  } catch (error) {
    console.error('\n💥 Process failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
