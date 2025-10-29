#!/usr/bin/env python3
"""
ClickHouse Connection Diagnostic Script
Tests various connection scenarios for ClickHouse Cloud
"""

import clickhouse_connect
import os
import sys

def test_connection(config, description):
    """Test a specific connection configuration"""
    print(f"\n🔍 Testing: {description}")
    print(f"   Host: {config.get('host', 'N/A')}")
    print(f"   Port: {config.get('port', 'N/A')}")
    print(f"   Database: {config.get('database', 'N/A')}")
    print(f"   Secure: {config.get('secure', False)}")
    
    try:
        client = clickhouse_connect.get_client(**config)
        
        # Test basic connectivity
        result = client.query('SELECT version() as version')
        version = result.result_rows[0][0]
        print(f"   ✅ Connected! ClickHouse version: {version}")
        
        # Test database access
        result = client.query('SHOW DATABASES')
        databases = [row[0] for row in result.result_rows]
        print(f"   ✅ Databases available: {len(databases)}")
        
        # Check for our target database
        target_db = config.get('database', 'default')
        if target_db in databases:
            print(f"   ✅ Target database '{target_db}' exists!")
            
            # Try to use it and show tables
            client.command(f'USE {target_db}')
            result = client.query('SHOW TABLES')
            tables = [row[0] for row in result.result_rows]
            print(f"   📊 Tables in '{target_db}': {tables}")
        else:
            print(f"   ⚠️ Target database '{target_db}' not found")
            print(f"   💡 Available databases: {databases}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Failed: {str(e)[:100]}...")
        return False

def main():
    print("🔧 ClickHouse Connection Diagnostic")
    print("=" * 50)
    
    # Test scenarios
    scenarios = [
        {
            'config': {
                'host': 'localhost',
                'port': 8123,
                'username': 'default',
                'password': 'K~IXCGmyOoWo1',
                'database': 'trade-finance-deck',
                'secure': False
            },
            'description': 'Local ClickHouse (current config)'
        },
        {
            'config': {
                'host': 'localhost',
                'port': 8443,
                'username': 'default',
                'password': 'K~IXCGmyOoWo1',
                'database': 'trade-finance-deck',
                'secure': True
            },
            'description': 'Local ClickHouse with SSL'
        }
    ]
    
    # Add scenarios based on environment variables
    if os.getenv('CLICKHOUSE_HOST') and os.getenv('CLICKHOUSE_HOST') != 'localhost':
        scenarios.append({
            'config': {
                'host': os.getenv('CLICKHOUSE_HOST'),
                'port': int(os.getenv('CLICKHOUSE_PORT', '8443')),
                'username': os.getenv('CLICKHOUSE_USER', 'default'),
                'password': os.getenv('CLICKHOUSE_PASSWORD', 'K~IXCGmyOoWo1'),
                'database': os.getenv('CLICKHOUSE_DATABASE', 'trade-finance-deck'),
                'secure': True
            },
            'description': 'ClickHouse Cloud (from env vars)'
        })
    
    success_count = 0
    
    for scenario in scenarios:
        if test_connection(scenario['config'], scenario['description']):
            success_count += 1
    
    print(f"\n" + "=" * 50)
    print(f"📊 Results: {success_count}/{len(scenarios)} connections successful")
    
    if success_count == 0:
        print("\n❌ No connections successful!")
        print("🔍 Troubleshooting steps:")
        print("   1. Check if ClickHouse is running locally:")
        print("      - macOS: brew services start clickhouse")
        print("      - Or check if you have ClickHouse Cloud instance")
        print("   2. For ClickHouse Cloud:")
        print("      - Go to https://console.clickhouse.cloud")
        print("      - Find your service connection details")
        print("      - Update CLICKHOUSE_HOST with your cloud URL")
        print("   3. Verify credentials in environment variables")
        return 1
    else:
        print(f"\n✅ Found {success_count} working connection(s)!")
        print("🚀 Ready to run data collection!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
