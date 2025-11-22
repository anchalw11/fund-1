/*
  Run Affiliate Code Assignment Script

  This script executes the SQL to assign affiliate codes to all users.
  Run with: node run-affiliate-assignment.js
*/

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAffiliateAssignment() {
    console.log('🚀 Starting affiliate code assignment for all users...\n');

    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync('ASSING_AFFILIATE_CODES_TO_ALL_USERS.sql', 'utf8');

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: sqlContent
        });

        if (error) {
            // If exec_sql doesn't exist, try direct execution
            console.log('⚠️  exec_sql function not available, trying alternative method...');

            // Split the SQL into individual statements if needed
            const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        // For DO blocks, we need to execute them differently
                        if (statement.trim().startsWith('DO $$')) {
                            console.log('📝 Executing DO block for affiliate assignment...');
                            // This would need to be executed as raw SQL
                            const { error: execError } = await supabase.rpc('exec_raw_sql', {
                                sql: statement
                            });

                            if (execError) {
                                console.error('❌ Error executing DO block:', execError.message);
                                // Try manual user-by-user assignment as fallback

                                await assignAffiliateCodesManually();
                                return;
                            }
                        }
                    } catch (stmtError) {
                        console.error('❌ Error executing statement:', stmtError.message);
                    }
                }
            }
        }

        console.log('✅ Affiliate codes assignment completed!');

        // Run verification
        await runVerification();

    } catch (error) {
        console.error('❌ Error running affiliate assignment:', error.message);
        console.log('\n🔄 Falling back to manual assignment...');
        await assignAffiliateCodesManually();
    }
}

// Manual assignment function as fallback
async function assignAffiliateCodesManually() {
    console.log('🛠️  Running manual affiliate code assignment...\n');

    try {
        // Get all users without affiliate codes
        const { data: users, error } = await supabase
            .from('user_profile')
            .select(`
                user_id,
                first_name,
                last_name,
                friendly_id
            `)
            .eq('user_id', null, false); // Get all

        if (error) throw error;

        let assignedCount = 0;

        // Get auth users for emails
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const userEmailMap = new Map();
        authUsers.users.forEach(user => {
            userEmailMap.set(user.id, user.email);
        });

        // Process users who don't have affiliate codes
        for (const user of users || []) {
            // Check if user already has affiliate code
            const { data: existing } = await supabase
                .from('affiliates')
                .select('id')
                .eq('user_id', user.user_id)
                .single();

            if (existing) continue; // Skip if already has code

            // Generate affiliate code
            let generatedCode = '';

            if (user.first_name && user.last_name) {
                generatedCode = (user.first_name.substring(0, 3) + user.last_name.substring(0, 3)).toUpperCase();
            } else if (user.friendly_id) {
                generatedCode = user.friendly_id.substring(0, 6).toUpperCase();
            } else {
                const email = userEmailMap.get(user.user_id);
                if (email) {
                    generatedCode = email.split('@')[0].substring(0, 6).toUpperCase();
                } else {
                    generatedCode = 'USER' + Date.now().toString().slice(-4);
                }
            }

            // Clean and ensure uniqueness
            generatedCode = generatedCode.replace(/[^A-Z0-9]/g, '');
            if (generatedCode.length < 3) generatedCode += 'USR';

            // Add random digits
            generatedCode += (1000 + Math.floor(Math.random() * 9000)).toString();

            // Check uniqueness
            let isUnique = false;
            let attempts = 0;
            while (!isUnique && attempts < 10) {
                const { data: check } = await supabase
                    .from('affiliates')
                    .select('id')
                    .eq('affiliate_code', generatedCode)
                    .single();

                if (!check) {
                    isUnique = true;
                } else {
                    // Add random letter and retry
                    generatedCode = generatedCode.substring(0, generatedCode.length - 4) +
                                   String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                                   (1000 + Math.floor(Math.random() * 9000)).toString();
                    attempts++;
                }
            }

            // Insert affiliate record
            const { error: insertError } = await supabase
                .from('affiliates')
                .insert({
                    user_id: user.user_id,
                    affiliate_code: generatedCode,
                    commission_rate: 10.00,
                    total_referrals: 0,
                    total_earnings: 0,
                    available_balance: 0,
                    status: 'active'
                });

            if (insertError) {
                console.error(`❌ Failed to create affiliate for user ${user.user_id}:`, insertError.message);
            } else {
                console.log(`✅ Created affiliate code "${generatedCode}" for user ${user.user_id}`);
                assignedCount++;
            }
        }

        console.log(`\n🎉 Manual assignment completed! Created ${assignedCount} affiliate codes.`);

        // Run verification
        await runVerification();

    } catch (error) {
        console.error('❌ Error in manual assignment:', error.message);
    }
}

async function runVerification() {
    console.log('\n🔍 Verifying affiliate code assignment...\n');

    try {
        // Get statistics
        const { data: totalUsers } = await supabase
            .from('user_profile')
            .select('user_id', { count: 'exact' });

        const { data: affiliateUsers } = await supabase
            .from('affiliates')
            .select('user_id', { count: 'exact' });

        const { data: recentCodes } = await supabase
            .from('affiliates')
            .select(`
                affiliate_code,
                commission_rate,
                total_earnings,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        console.log('📊 Assignment Statistics:');
        console.log(`   Total Users: ${(totalUsers || []).length}`);
        console.log(`   Users with Codes: ${(affiliateUsers || []).length}`);
        console.log(`   Success Rate: ${((affiliateUsers || []).length / Math.max((totalUsers || []).length, 1) * 100).toFixed(1)}%`);

        console.log('\n🎯 Recent Affiliate Codes:');
        (recentCodes || []).forEach((code, index) => {
            console.log(`   ${index + 1}. ${code.affiliate_code} (${code.commission_rate}% commission)`);
        });

    } catch (error) {
        console.error('❌ Error running verification:', error.message);
    }
}

// Run the main function
runAffiliateAssignment().catch(console.error);
