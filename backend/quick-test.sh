#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║    🦁 FUND8R EMAIL SYSTEM QUICK TEST 🦁          ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if email is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./quick-test.sh YOUR_EMAIL@gmail.com${NC}"
    echo ""
    echo "Example:"
    echo "  ./quick-test.sh john.doe@gmail.com"
    echo ""
    exit 1
fi

EMAIL=$1
echo -e "${BLUE}📧 Testing with email: ${EMAIL}${NC}"
echo ""

# Test 1: Verification Code
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 1: Verification Code Email${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/email/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test Trader\"}")

echo "Response: $RESPONSE"
echo ""
sleep 2

# Test 2: Welcome Email with Certificate
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 2: Welcome Email + Futuristic Certificate${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test Trader\",\"accountId\":\"FX-2025-ELITE-001\"}")

echo "Response: $RESPONSE"
echo ""
sleep 2

# Test 3: Passing Certificate
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 3: Passing Achievement Certificate${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/email/passing \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test Trader\",\"phase\":\"Phase 1 - Elite Evaluation\",\"profit\":\"15.5%\",\"drawdown\":\"3.2%\"}")

echo "Response: $RESPONSE"
echo ""
sleep 2

# Test 4: Payout Notification
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 4: Payout Notification Certificate${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/email/payout \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test Trader\",\"amount\":\"5,000.00\",\"transactionId\":\"PAY-2025-ELITE-001\"}")

echo "Response: $RESPONSE"
echo ""

# Summary
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ ALL TESTS COMPLETE!               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📬 Check your inbox at: ${EMAIL}${NC}"
echo ""
echo -e "${YELLOW}What to expect:${NC}"
echo "  🦁 Verification code email (6-digit code)"
echo "  🦁 Welcome email with futuristic certificate (PNG)"
echo "  🦁 Passing achievement certificate"
echo "  🦁 Payout notification certificate"
echo ""
echo -e "${YELLOW}Design features:${NC}"
echo "  ✨ Cyberpunk dark theme (purple, blue, gold)"
echo "  ✨ Glowing lion logo"
echo "  ✨ Neon borders and effects"
echo "  ✨ Hexagonal tech patterns"
echo "  ✨ 1920x1080 certificates"
echo ""
echo -e "${GREEN}Emails should arrive within 30 seconds!${NC}"
echo -e "${YELLOW}(Check spam folder if not in inbox)${NC}"
echo ""
