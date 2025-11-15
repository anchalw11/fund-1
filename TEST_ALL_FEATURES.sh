#!/bin/bash

# Fund8r New Features Testing Script
# This script tests all the newly implemented features

BASE_URL="http://localhost:5000/api"
FRONTEND_URL="http://localhost:5173"

echo "=========================================="
echo "🚀 Fund8r Feature Testing Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local data=$4

  echo -n "Testing: $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$url")
  else
    response=$(curl -s -w "%{http_code}" -o /tmp/response.txt -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
  fi

  if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    cat /tmp/response.txt | head -c 200
    echo ""
  else
    echo -e "${RED}✗ FAILED (HTTP $response)${NC}"
    ((FAILED++))
    cat /tmp/response.txt
    echo ""
  fi
  echo ""
}

echo "=========================================="
echo "1. Testing Health Check"
echo "=========================================="
test_endpoint "Backend Health" "$BASE_URL/../health"

echo "=========================================="
echo "2. Testing Subscription System"
echo "=========================================="
test_endpoint "Get Subscription Pricing" "$BASE_URL/subscriptions/pricing"

echo "=========================================="
echo "3. Testing Badge System"
echo "=========================================="
test_endpoint "Get Badge Leaderboard" "$BASE_URL/badges/leaderboard"

echo "=========================================="
echo "4. Testing Affiliate System"
echo "=========================================="

# Create test user ID
TEST_USER_ID="test-user-$(date +%s)"

test_endpoint "Create Affiliate Account" \
  "$BASE_URL/affiliates/create" \
  "POST" \
  "{\"user_id\":\"$TEST_USER_ID\"}"

echo "=========================================="
echo "5. Testing Mini Challenge System"
echo "=========================================="

test_endpoint "Create Mini Challenge" \
  "$BASE_URL/mini-challenges/create" \
  "POST" \
  "{\"user_id\":\"$TEST_USER_ID\"}"

test_endpoint "Get User Mini Challenges" \
  "$BASE_URL/mini-challenges/user/$TEST_USER_ID"

echo "=========================================="
echo "6. Testing Promotional System"
echo "=========================================="

test_endpoint "Get User Promotions" \
  "$BASE_URL/promotions/user/$TEST_USER_ID"

echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  echo ""
  echo "✅ Your Fund8r backend is fully operational!"
  echo ""
  echo "Next steps:"
  echo "1. Open your browser: $FRONTEND_URL"
  echo "2. Navigate to /dashboard for affiliate section"
  echo "3. Navigate to /mini-challenge to test mini challenges"
  echo "4. Check IMPLEMENTATION_SUMMARY.md for full documentation"
else
  echo -e "${RED}⚠️  Some tests failed. Check the errors above.${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Make sure backend is running: curl $BASE_URL/../health"
  echo "2. Check backend logs: tail -f backend/server.log"
  echo "3. Verify database migrations ran successfully"
fi

echo ""
echo "=========================================="
echo "🔗 Important URLs"
echo "=========================================="
echo "Frontend: $FRONTEND_URL"
echo "Backend API: $BASE_URL"
echo "Mini Challenge: $FRONTEND_URL/mini-challenge"
echo "Affiliate Dashboard: $FRONTEND_URL/dashboard (scroll to affiliate section)"
echo ""
echo "=========================================="
echo "📚 Documentation"
echo "=========================================="
echo "Quick Start: QUICK_START_NEW_FEATURES.md"
echo "Full Documentation: IMPLEMENTATION_SUMMARY.md"
echo ""

# Cleanup
rm -f /tmp/response.txt
