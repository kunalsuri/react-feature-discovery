#!/bin/bash

# React Feature Discovery - Installation Script
# This script installs the tool from GitHub

set -e

echo "🚀 Installing React Feature Discovery..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -f "dist/cli.js" ]; then
    echo "❌ Build failed. dist/cli.js not found."
    exit 1
fi

echo "✅ Build successful"

# Ask if user wants to link globally
read -p "Do you want to link this tool globally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔗 Linking globally..."
    npm link
    echo "✅ Tool linked! You can now use 'rfd' command anywhere."
else
    echo "ℹ️  Tool installed locally. Run with: node $(pwd)/dist/cli.js"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Usage:"
echo "  rfd --help                    # Show help"
echo "  rfd --root ./src              # Analyze a directory"
echo "  rfd --format markdown,json    # Generate multiple formats"
echo ""
echo "For more information, see README.md"
