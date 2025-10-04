#!/bin/bash

echo "🚀 Deploying DataMantri Demo to GitHub"
echo "======================================="
echo ""

# Get GitHub username
echo "📝 Please enter your GitHub username:"
read GITHUB_USERNAME

echo ""
echo "Setting up remote repository..."

cd "/Users/sunny.agarwal/Projects/DataMantri - Cursor copy/demo-frontend"

# Add remote
git remote add origin "https://github.com/$GITHUB_USERNAME/datamantri-demo.git"

# Push to GitHub
echo ""
echo "📤 Pushing code to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🌐 Your repository: https://github.com/$GITHUB_USERNAME/datamantri-demo"
echo ""
echo "🔗 Next step: Connect this repo to Netlify"
echo "   Go to: https://app.netlify.com/start"

