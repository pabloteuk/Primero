#!/bin/bash
# ClickHouse Cloud Environment Configuration Template
# Copy this to your environment and update with your actual values

# ClickHouse Cloud connection details (get from ClickHouse Cloud console)
export CLICKHOUSE_URL="https://your-clickhouse-cloud-host:8443"
export CLICKHOUSE_HOST="your-clickhouse-cloud-host"
export CLICKHOUSE_PORT="8443"
export CLICKHOUSE_USER="default"
export CLICKHOUSE_PASSWORD="your_clickhouse_password"
export CLICKHOUSE_DATABASE="primero"

# ClickHouse Cloud specific settings
export CLICKHOUSE_SECURE="true"
export CLICKHOUSE_VERIFY="true"
export CLICKHOUSE_CONNECT_TIMEOUT="30"
export CLICKHOUSE_SEND_RECEIVE_TIMEOUT="300"

# UN Comtrade API Keys (if you have premium access)
export UN_COMTRADE_PRIMARY_KEY="981ae9857dcd4788aada12fcdba5c8da"
export UN_COMTRADE_SECONDARY_KEY="14aaf0a676fe40fa98772d42eee702a7"

# Backend configuration
export NODE_ENV="production"
export PORT="3001"

echo "ClickHouse Cloud environment variables set!"
echo "Update the placeholder values with your actual ClickHouse Cloud credentials."
