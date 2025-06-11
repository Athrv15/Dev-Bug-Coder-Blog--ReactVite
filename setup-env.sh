#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    echo ".env file already exists. Backing it up to .env.backup"
    cp .env .env.backup
fi

# Create new .env file
cat > .env << EOL
# Database Configuration
DATABASE_URL="your-mongodb-link"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"

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
