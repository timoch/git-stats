#!/bin/bash

# Test runner for git-stats CLI tool
set -e

CLI_PATH="../../dist/cli.js"
TEST_DIR="temp-repo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Starting git-stats tests${NC}"

# Clean up any existing test directory
if [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
fi

# Create a temporary git repository for testing
mkdir "$TEST_DIR"
cd "$TEST_DIR"

echo -e "${BLUE}📦 Setting up temporary git repository${NC}"

# Initialize git repo
git init
git config user.name "Alice Developer"
git config user.email "alice@example.com"

# Create some test files and commits
echo "console.log('Hello World');" > app.js
echo "# Test Project" > README.md
git add .
git commit -m "Initial commit with basic files"

# Add more content as Alice
echo "function greet(name) { return 'Hello ' + name; }" >> app.js
echo "const utils = require('./utils');" >> app.js
git add app.js
git commit -m "Add greeting function"

# Switch to different author
git config user.name "Bob Coder" 
git config user.email "bob@example.com"

# Bob makes changes
echo "module.exports = { helper: () => 'help' };" > utils.js
echo "## Installation" >> README.md
echo "npm install" >> README.md
git add .
git commit -m "Add utils module and installation docs"

# Bob makes more changes
echo "function goodbye(name) { return 'Goodbye ' + name; }" >> app.js
git add app.js
git commit -m "Add goodbye function"

# Alice makes final changes
git config user.name "Alice Developer"
git config user.email "alice@example.com"
echo "console.log(greet('World'));" >> app.js
echo "console.log(goodbye('World'));" >> app.js
git add app.js
git commit -m "Use greeting functions"

echo -e "${BLUE}✅ Test repository created with sample commits${NC}"

# Test 1: Basic functionality - all commits
echo -e "${BLUE}🔍 Test 1: Show all commits${NC}"
node "$CLI_PATH" --since="1 week ago"

echo ""
echo -e "${BLUE}🔍 Test 2: Show only Alice's commits${NC}"
node "$CLI_PATH" --since="1 week ago" --author="Alice"

echo ""
echo -e "${BLUE}🔍 Test 3: JSON output format${NC}"
node "$CLI_PATH" --since="1 week ago" --format=json

echo ""
echo -e "${BLUE}🔍 Test 4: Show today's commits (should be all since we just created them)${NC}"
node "$CLI_PATH"

# Clean up
cd ..
rm -rf "$TEST_DIR"

echo -e "${GREEN}✅ All tests completed successfully!${NC}"