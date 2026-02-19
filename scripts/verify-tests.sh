#!/bin/bash

# Playwright Test Verification Script
# This script helps verify that Playwright is set up correctly

set -e

echo "🎭 Playwright Test Verification"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Check if npm is installed
echo ""
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check if Playwright is installed
echo ""
echo "🎭 Checking Playwright..."
if npm list @playwright/test &> /dev/null; then
    PW_VERSION=$(npm list @playwright/test --depth=0 | grep @playwright/test | sed 's/.*@//')
    echo -e "${GREEN}✓ Playwright installed: $PW_VERSION${NC}"
else
    echo -e "${RED}✗ Playwright not installed${NC}"
    echo -e "${YELLOW}Run: npm install --cache /tmp/npm-cache --save-dev @playwright/test${NC}"
    exit 1
fi

# Check if browsers are installed
echo ""
echo "🌐 Checking Playwright browsers..."
if npx playwright --version &> /dev/null; then
    echo -e "${GREEN}✓ Playwright CLI available${NC}"
else
    echo -e "${RED}✗ Playwright CLI not available${NC}"
    exit 1
fi

# Check test files
echo ""
echo "📁 Checking test files..."
if [ -d "e2e" ]; then
    TEST_COUNT=$(find e2e -name "*.spec.ts" 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ E2E test directory found${NC}"
    echo -e "  Test files: $TEST_COUNT"
else
    echo -e "${YELLOW}⚠ E2E test directory not found${NC}"
fi

# Check config file
echo ""
echo "⚙️  Checking configuration..."
if [ -f "playwright.config.ts" ]; then
    echo -e "${GREEN}✓ playwright.config.ts found${NC}"
else
    echo -e "${RED}✗ playwright.config.ts not found${NC}"
    exit 1
fi

# Check package.json scripts
echo ""
echo "📜 Checking npm scripts..."
if grep -q '"test"' package.json; then
    echo -e "${GREEN}✓ Test scripts found in package.json${NC}"
else
    echo -e "${YELLOW}⚠ No test scripts in package.json${NC}"
fi

# Summary
echo ""
echo "==============================="
echo -e "${GREEN}✓ Setup verification complete!${NC}"
echo ""
echo "Quick commands to get started:"
echo "  npm test                    - Run all tests"
echo "  npm run test:bottom-nav     - Run bottom navigation tests"
echo "  npm run test:headed         - Run tests with visible browser"
echo "  npm run test:debug          - Debug tests step-by-step"
echo ""
echo "For more information, see TESTING.md"
echo ""
