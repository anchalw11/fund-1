#!/bin/bash

echo "🔄 Redeploying Fund8r Backend to Render..."
echo "=========================================="

# Check if render-cli is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not installed. Install it first:"
    echo "   npm install -g render-cli"
    echo "   or visit: https://render.com/docs/cli"
    exit 1
fi

# Check if logged in to Render
if ! render whoami &> /dev/null; then
    echo "❌ Not logged in to Render. Please login first:"
    echo "   render login"
    exit 1
fi

# Get the service ID (you'll need to replace this with your actual service ID)
SERVICE_ID="fund-backend-pbde"

echo "🚀 Triggering deployment for service: $SERVICE_ID"

# Trigger deployment
render deploy $SERVICE_ID --wait

if [ $? -eq 0 ]; then
    echo "✅ Backend redeployed successfully!"
    echo "🌐 Your backend should be available at: https://fund-backend-pbde.onrender.com"
    echo ""
    echo "🧪 Test the verification endpoint:"
    echo "   curl -X POST https://fund-backend-pbde.onrender.com/api/verification/send-code \\"
    echo "        -H 'Content-Type: application/json' \\"
    echo "        -d '{\"email\":\"test@example.com\"}'"
else
    echo "❌ Deployment failed. Check the Render dashboard for details."
    exit 1
fi
