#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    echo ".env file already exists. Backing it up to .env.backup"
    cp .env .env.backup
fi

# Create new .env file
cat > .env << EOL
# Database Configuration
DATABASE_URL="mongodb+srv://arnobt78:arnobt78@coderblog.w9j8jqn.mongodb.net/coderblog?retryWrites=true&w=majority&appName=coderblog"

# JWT Configuration
JWT_SECRET="714e618f63610534a8de1f215ca5d419ebe71895b1fe337038938d574cdf846241918490800f86f73d9716f37f39d5c16266d9d5e2cec21f1ac3a32c3be238816b94cf705cf7200c3d0b6c71daf406550339984ff9d1e5218b9b4288ba2c427241d81f92b8c790e8d7153edc902fb08fc46b725544d3078032975b93183b458795f4e900736f9e7e9a8629bd655c8e2c5e0c8d29baad597a6ebf8836353052563bd1adafd2c5202336f36ffe8a48df97fdd2c0fd590e938c165a94c9de51e9ea76565f2dc4b6f0867a866669805d5f35468ae2a2fa05a191e224882d6ac83551b9747220f5e2719a8bab7053eede7d6fa30ba47235f9bb14ee9832f0653c619d103603a8a8fda1c4b2d91addef818921cbf5e8c1db07fdf3dbcde6577499b26c15261afc7e1a4dcdc46f8965dea44064b5bab546ef36803ee0bf57600d57739cfcb7a000ebfe261fb916ef9c1ff26d05ea4a7d9782a9354d5b98afe15e03c91f2cd39c268da901b296103316e0bba8305a983dcace2ecfa66040b4dad58df604761311837c0e164907afbca033ec77371107e36ceb60e9fff84485e35e74a87e25c27014e11af8bd8b5e20644a0376629a0a2e8f5720add8204ba7b7c0c2c9d1b767c86cc749e403b98695115a8333c21e761b959a250499b2705da2be8814847250c595492579b1da1a3e79e923709ea84d846a1943ab3a929e47e008407dcf"

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173

# Backend URL (for frontend API calls)
BACKEND_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000

# Environment
NODE_ENV=development
PORT=5000
EOL

# Make the file readable only by the owner
chmod 600 .env

echo "Created new .env file with proper permissions"
echo "Note: The .env file contains sensitive information and is set to be readable only by you" 