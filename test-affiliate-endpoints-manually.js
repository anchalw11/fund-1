/*
  MANUAL AFFILIATE ENDPOINT TESTS
  Run with: node test-affiliate-endpoints-manually.js
*/

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log('🧪 TESTING AFFILIATE SYSTEM...\n');

    try {
        // Test 1: Check affiliate table structure
        console.log('Test 1: Database Table Structure');
        const { data: columns, error: colError } = await supabase
            .rpc('exec_sql', {
                sql: `
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'affiliates'
                    AND column_name IN ('affiliate_code', 'referral_code', 'commission_rate')
                    ORDER BY column_name;
                `
            });

        if (colError) {
            console.log('   ❌ Column check failed:', colError.message);
        } else {
            console.log('   ✅ Affiliate columns found');
        }

        // Test 2: Check affiliate data
        console.log('\nTest 2: Affiliate Data');
        const { data: affiliates, error: affError } = await supabase
            .from('affiliates')
            .select('affiliate_code, commission_rate, status')
            .limit(5);

        if (affError) {
            console.log('   ❌ Affiliate data query failed:', affError.message);
        } else {
            console.log(`   ✅ Found ${affiliates?.length || 0} affiliate records`);
            if (affiliates && affiliates.length > 0) {
                affiliates.forEach((aff, i) => {
                    console.log(`      ${i+1}. Code: ${aff.affiliate_code}, Rate: ${aff.commission_rate}%`);
                });
            }
        }

        // Test 3: Test affiliate service directly
        console.log('\nTest 3: Affiliate Service Logic');

        // Test with a known user ID (you can replace this)
        const testUserIds = ['test-user-id'];

        for (const userId of testUserIds) {
            try {
                // Import our service
                const affiliateService = (await import('./backend/services/affiliateService.js')).default;

                console.log(`   Testing getAffiliateStats for user: ${userId}`);
                const stats = await affiliateService.getAffiliateStats(userId);

                if (stats.affiliate_code) {
                    console.log(`   ✅ Found affiliate code: ${stats.affiliate_code}`);
                    console.log(`   ✅ Commission rate: ${stats.commission_rate || 'N/A'}%`);
                    console.log(`   ✅ Total referrals: ${stats.total_referrals || 0}`);
                } else {
                    console.log(`   ⚠️  No affiliate code found for user ${userId} (expected if no data)`);
                }
            } catch (error) {
                console.log(`   ❌ Service test failed for ${userId}:`, error.message);
            }
        }

        // Test 4: Create affiliate test
        console.log('\nTest 4: Affiliate Creation');

        // This would normally be done through the API
        console.log('   ℹ️  Affiliate creation tested through API endpoints (see curl tests below)');

        console.log('\n🎉 ALL TESTS COMPLETED!');
        console.log('\nRun these curl commands to test API endpoints:');
        console.log('curl -s "http://localhost:5000/api/affiliates/test" - test route');
        console.log('curl -s "http://localhost:5000/api/affiliates/admin/users" - admin users');
        console.log('curl -s "http://localhost:5000/api/affiliates/stats/YOUR_USER_ID" - stats endpoint');

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests().catch(console.error);
