#!/usr/bin/env python3
"""
Test ClickHouse Cloud Connection with Real Credentials
Run this after updating your environment variables
"""

import clickhouse_connect
import os

def main():
    # Read from environment variables
    host = os.getenv('CLICKHOUSE_HOST')
    password = os.getenv('CLICKHOUSE_PASSWORD')
    database = os.getenv('CLICKHOUSE_DATABASE')
    port = int(os.getenv('CLICKHOUSE_PORT', '8443'))
    username = os.getenv('CLICKHOUSE_USER', 'default')

    if not host:
        print("❌ CLICKHOUSE_HOST environment variable not set")
        return False
    if not password:
        print("❌ CLICKHOUSE_PASSWORD environment variable not set")
        return False
    if not database:
        print("❌ CLICKHOUSE_DATABASE environment variable not set")
        return False
    
    config = {
        'host': host,
        'port': port,
        'username': username,
        'password': password,
        'database': database,
        'secure': True
    }
    
    print(f"🔍 Testing ClickHouse Cloud connection...")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Database: {database}")
    print(f"   Username: {username}")
    
    try:
        client = clickhouse_connect.get_client(**config)
        print("✅ Connection successful!")
        
        # Test basic query
        result = client.query('SELECT version() as version')
        version = result.result_rows[0][0]
        print(f"✅ ClickHouse version: {version}")
        
        # Create database if it doesn't exist
        try:
            client.command(f'CREATE DATABASE IF NOT EXISTS {database}')
            print(f"✅ Database '{database}' ready!")
        except:
            print(f"ℹ️ Database '{database}' already exists")
        
        # Switch to database
        client.command(f'USE {database}')
        
        # Show tables
        result = client.query('SHOW TABLES')
        tables = [row[0] for row in result.result_rows]
        print(f"📊 Tables in '{database}': {tables}")
        
        # Create sample table if it doesn't exist
        client.command('''
            CREATE TABLE IF NOT EXISTS test_table (
                id UInt64,
                name String,
                value Float64,
                created_at DateTime DEFAULT now()
            ) ENGINE = MergeTree()
            ORDER BY id
        ''')
        print("✅ Test table created/verified")
        
        # Insert test data
        client.insert('test_table', [
            [1, 'Test Record 1', 100.5, '2024-01-01 00:00:00'],
            [2, 'Test Record 2', 200.75, '2024-01-02 00:00:00']
        ])
        print("✅ Test data inserted")
        
        # Query test data
        result = client.query('SELECT * FROM test_table ORDER BY id')
        print("✅ Test query successful:")
        for row in result.result_rows:
            print(f"   {row}")
        
        client.close()
        print("🎉 ClickHouse Cloud is working perfectly!")
        print("🚀 Ready to run data collection scripts!")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Verify your ClickHouse Cloud service is running")
        print("   2. Check the connection string in ClickHouse Cloud console")
        print("   3. Ensure your IP is allowlisted if required")
        print("   4. Try with a different port (8123 for HTTP, 8443 for HTTPS)")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
