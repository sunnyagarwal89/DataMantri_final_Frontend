#!/bin/bash

echo "🎯 DataMantri Demo Frontend"
echo "============================"
echo ""
echo "Starting interactive product demo..."
echo ""

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting demo server on port 3000..."
echo ""
echo "✨ Features:"
echo "   • Complete UI with mock data"
echo "   • No backend required"
echo "   • Safe for demonstrations"
echo ""
echo "🌐 Opening demo at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo "============================"
echo ""

npm run dev

