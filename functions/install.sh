#!/bin/bash

# Medicine Reminder - Cloud Functions Setup Script
# This script installs all required dependencies

echo "🔥 Medicine Reminder - Cloud Functions Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. You have version $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "⚠️  Firebase CLI is not installed."
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed"
else
    echo "✅ Firebase CLI installed: $(firebase --version)"
fi

echo ""
echo "📦 Installing function dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Login to Firebase: firebase login"
echo "2. Initialize project: firebase init"
echo "3. Deploy functions: npm run deploy"
echo ""