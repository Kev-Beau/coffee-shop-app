#!/bin/bash
echo "🔍 Checking Vercel deployment status..."
echo ""
npx vercel ls | head -20
echo ""
echo "📊 Latest deployment:"
npx vercel ls | head -7 | tail -1
