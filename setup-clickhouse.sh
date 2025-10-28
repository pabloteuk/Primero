#!/bin/bash

# Primero ClickHouse MCP Setup Script
echo "🚀 Setting up ClickHouse MCP for Primero Trade Finance Platform"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please install uv first:"
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. ClickHouse will need to be installed separately."
    echo "For local development, install Docker and run: npm run clickhouse:setup"
else
    echo "✅ Docker found. Starting ClickHouse..."
    npm run clickhouse:setup
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'ENV_EOF'
# ClickHouse MCP Configuration
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_SECURE=false
CLICKHOUSE_VERIFY=false
CLICKHOUSE_CONNECT_TIMEOUT=30
CLICKHOUSE_SEND_RECEIVE_TIMEOUT=300

# chDB (Embedded ClickHouse) Configuration
CHDB_ENABLED=true
CHDB_DATA_PATH=./chdb-data

# MCP Server Configuration
CLICKHOUSE_MCP_SERVER_TRANSPORT=stdio
CLICKHOUSE_MCP_BIND_HOST=127.0.0.1
CLICKHOUSE_MCP_BIND_PORT=8000

# Primero Platform Configuration
NODE_ENV=development
PORT=3001
VITE_API_URL=http://localhost:3001/api

# ClickHouse Database Name
CLICKHOUSE_DATABASE=primero_tradefinance
ENV_EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Install MCP dependencies
echo "📦 Installing MCP dependencies..."
uv pip install mcp-clickhouse

echo ""
echo "🎉 ClickHouse MCP Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Restart Cursor to activate MCP server"
echo "2. Start the platform: npm run dev"
echo "3. Test ClickHouse queries in Cursor chat"
echo ""
echo "🔧 Available Commands:"
echo "  npm run clickhouse:client    # Open ClickHouse CLI"
echo "  npm run clickhouse:start     # Start ClickHouse"
echo "  npm run clickhouse:stop      # Stop ClickHouse"
echo ""
echo "💡 Example Queries:"
echo "  'Show me the top 10 trade routes by value'"
echo "  'List all suppliers with risk scores above 40'"
echo "  'Analyze logistics performance trends'"
