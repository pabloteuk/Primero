#!/bin/bash
# Update ClickHouse Cloud environment variables

echo "🔧 Updating ClickHouse Cloud Environment Variables"
echo "=================================================="

# From ClickHouse Cloud MCP API
export CLICKHOUSE_HOST="x3jprxadw6.eu-west-2.aws.clickhouse.cloud"
export CLICKHOUSE_PORT="8443"
export CLICKHOUSE_USER="default"
export CLICKHOUSE_DATABASE="trade-finance-deck"
export CLICKHOUSE_SECURE="true"

# Password needs to be provided or reset
echo "✅ Connection details extracted:"
echo "   Host: $CLICKHOUSE_HOST"
echo "   Port: $CLICKHOUSE_PORT"  
echo "   User: $CLICKHOUSE_USER"
echo "   Database: $CLICKHOUSE_DATABASE"
echo "   Secure: $CLICKHOUSE_SECURE"
echo ""

# Check if password is set
if [ -z "$CLICKHOUSE_PASSWORD" ]; then
    echo "❌ CLICKHOUSE_PASSWORD not set"
    echo ""
    echo "To set the password, you have two options:"
    echo ""
    echo "Option 1 - If you know the password:"
    echo "export CLICKHOUSE_PASSWORD='your_actual_password_here'"
    echo ""
    echo "Option 2 - Reset password in ClickHouse Cloud console:"
    echo "1. Go to https://console.clickhouse.cloud"
    echo "2. Click on 'trade-finance-deck' service"
    echo "3. Go to 'Service actions' > 'Reset password'"
    echo "4. Set a new password and copy it here"
    echo ""
    echo "Then run: export CLICKHOUSE_PASSWORD='new_password_here'"
    echo ""
    exit 1
else
    echo "✅ Password is set (length: ${#CLICKHOUSE_PASSWORD})"
    echo ""
    echo "🧪 Testing connection..."
    python3 test-clickhouse-cloud.py
fi
EOF && chmod +x update-clickhouse-env.sh