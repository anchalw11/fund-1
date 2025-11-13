#!/bin/bash

echo "🧪 Testing Fund8r Email System via API"
echo "========================================="
echo ""

# Test 1: Verification Code
echo "📧 Test 1: Verification Code"
curl -s -X POST http://localhost:5000/api/email/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@fund8r.com","name":"Test Trader"}' | jq '.'
echo ""
echo ""

# Test 2: Sign-in Code
echo "📧 Test 2: Sign-in Code"
curl -s -X POST http://localhost:5000/api/email/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@fund8r.com","name":"Test Trader","ipAddress":"192.168.1.1"}' | jq '.'
echo ""
echo ""

# Test 3: Welcome Email (if you want to test with real email, change this)
echo "📧 Test 3: Welcome Email with Certificate"
echo "To send to real email, run:"
echo 'curl -X POST http://localhost:5000/api/email/welcome -H "Content-Type: application/json" -d '"'"'{"email":"YOUR_EMAIL@gmail.com","name":"John Doe","accountId":"FX-2025-001"}'"'"
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "NOTE: To test actual email delivery:"
echo "1. Start the backend server: npm start"
echo "2. Replace YOUR_EMAIL@gmail.com with your actual email"
echo "3. Run the welcome email curl command above"
