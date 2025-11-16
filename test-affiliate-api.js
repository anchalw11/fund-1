#!/usr/bin/env node

// Test script to verify affiliate API endpoints are working
const API_BASE = 'https://fund-backend-pbde.onrender.com/api';

async function testAffiliateAPI() {
  console.log('🧪 Testing Affiliate API Endpoints');
  console.log('==================================\n');

  try {
    // Test 1: Check if backend is responding
    console.log('1️⃣ Testing backend connectivity...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is responding');
    } else {
      console.log('⚠️ Backend health check failed, but continuing...');
    }

    // Test 2: Test affiliate stats endpoint (this should work now)
    console.log('\n2️⃣ Testing affiliate stats endpoint...');
    // Using a known user ID from our earlier assignment
    const testUserId = '4df09102-aa79-454c-8518-e51f3b22efaa'; // risk.fund8r@gmail.com

    const statsResponse = await fetch(`${API_BASE}/affiliates/stats/${testUserId}`);
    console.log(`Stats endpoint status: ${statsResponse.status}`);

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Affiliate stats retrieved successfully!');
      console.log('📊 Stats data:', JSON.stringify(statsData, null, 2));
    } else {
      const errorText = await statsResponse.text();
      console.log('❌ Affiliate stats failed:', errorText);
    }

    // Test 3: Test affiliate create endpoint
    console.log('\n3️⃣ Testing affiliate create endpoint...');
    const createResponse = await fetch(`${API_BASE}/affiliates/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: testUserId })
    });

    console.log(`Create endpoint status: ${createResponse.status}`);

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Affiliate create successful!');
      console.log('📝 Create response:', JSON.stringify(createData, null, 2));
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Affiliate create failed:', errorText);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testAffiliateAPI();
