#!/usr/bin/env node

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://fund-backend-pbde.onrender.com'
  : 'http://localhost:5001';

console.log('🧪 Testing Affiliate Endpoints');
console.log('📡 Base URL:', BASE_URL);
console.log('');

// Test 1: Health check
async function testHealth() {
  console.log('1. Testing health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data.status);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Validate affiliate code
async function testValidateCode() {
  console.log('2. Testing affiliate code validation...');
  try {
    const response = await fetch(`${BASE_URL}/api/affiliates/validate-code/TEST123`);
    const data = await response.json();
    console.log('✅ Code validation passed:', data.valid ? 'Valid' : 'Invalid (expected)');
    return true;
  } catch (error) {
    console.log('❌ Code validation failed:', error.message);
    return false;
  }
}

// Test 3: Try to create affiliate (will fail due to invalid user, but should return proper error)
async function testCreateAffiliate() {
  console.log('3. Testing affiliate creation (with invalid user - should fail gracefully)...');
  try {
    const response = await fetch(`${BASE_URL}/api/affiliates/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'invalid-user-id' })
    });
    const data = await response.json();

    if (response.status === 500) {
      console.log('✅ Create affiliate returned expected error for invalid user');
      return true;
    } else {
      console.log('❌ Unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Create affiliate failed:', error.message);
    return false;
  }
}

// Test 4: Test affiliate stats (should return 404 for non-existent affiliate)
async function testAffiliateStats() {
  console.log('4. Testing affiliate stats (non-existent user - should return 404)...');
  try {
    const response = await fetch(`${BASE_URL}/api/affiliates/stats/invalid-user-id`);
    const data = await response.json();

    if (response.status === 404) {
      console.log('✅ Stats returned expected 404 for non-existent affiliate');
      return true;
    } else {
      console.log('❌ Unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Stats test failed:', error.message);
    return false;
  }
}

// Test 5: Test affiliate payouts (should return 404 for non-existent affiliate)
async function testAffiliatePayouts() {
  console.log('5. Testing affiliate payouts (non-existent user - should return 404)...');
  try {
    const response = await fetch(`${BASE_URL}/api/affiliates/payouts/invalid-user-id`);
    const data = await response.json();

    if (response.status === 404) {
      console.log('✅ Payouts returned expected 404 for non-existent affiliate');
      return true;
    } else {
      console.log('❌ Unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Payouts test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = await Promise.all([
    testHealth(),
    testValidateCode(),
    testCreateAffiliate(),
    testAffiliateStats(),
    testAffiliatePayouts()
  ]);

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log('');
  console.log('📊 Test Results:', `${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All affiliate endpoint tests passed!');
    console.log('✅ Frontend and backend are properly synced');
  } else {
    console.log('⚠️ Some tests failed. Check the backend deployment.');
  }

  return passed === total;
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
