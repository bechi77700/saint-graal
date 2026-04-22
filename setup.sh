#!/bin/bash
set -e

echo "🏆 Saint Graal — Setup"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
fi

echo "✓ Node $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup .env if needed
if [ ! -f .env ] || grep -q "your_anthropic_api_key_here" .env; then
  echo ""
  echo "⚠️  Add your Anthropic API key to .env:"
  echo "   ANTHROPIC_API_KEY=sk-ant-..."
fi

# Init database
echo "Initializing database..."
npx prisma db push

echo ""
echo "✅ Ready! Run: npm run dev"
echo "   Open: http://localhost:3000"
