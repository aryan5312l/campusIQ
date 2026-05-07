#!/bin/bash
set -e

echo "Installing Puppeteer browsers..."
cd backend
npm install
npx puppeteer browsers install chrome

echo "Build complete!"
