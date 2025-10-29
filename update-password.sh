#!/bin/bash
# Update ClickHouse Cloud password

echo "🔑 Update ClickHouse Cloud Password"
echo "===================================="

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new_password>"
    echo "Example: $0 'myNewPassword123!'"
    exit 1
fi

NEW_PASSWORD="$1"

# Update .env file
if [ -f ".env" ]; then
    sed -i.bak "s/CLICKHOUSE_PASSWORD=.*/CLICKHOUSE_PASSWORD=\"$NEW_PASSWORD\"/" .env
    echo "✅ Updated .env file"
else
    echo "⚠️  .env file not found, creating one..."
    cat > .env << ENV_EOF
CLICKHOUSE_HOST=x3jprxadw6.eu-west-2.aws.clickhouse.cloud
CLICKHOUSE_PORT=8443
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD="$NEW_PASSWORD"
CLICKHOUSE_DATABASE=trade-finance-deck
CLICKHOUSE_SECURE=true
ENV_EOF
    echo "✅ Created .env file with new password"
fi

# Export for current session
export CLICKHOUSE_PASSWORD="$NEW_PASSWORD"

echo ""
echo "🧪 Testing connection with new password..."
python3 test-clickhouse-cloud.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! ClickHouse Cloud is now connected."
    echo "🚀 You can now run your data collection scripts:"
    echo "   python3 data-collection-script.py"
else
    echo ""
    echo "❌ Connection test failed. Please check the password and try again."
fi
EOF && chmod +x update-password.sh