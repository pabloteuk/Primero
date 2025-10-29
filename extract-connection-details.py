#!/usr/bin/env python3
"""
Extract ClickHouse Cloud connection details from connection string
"""

def extract_connection_details(connection_string):
    """Extract host, username, password, database from ClickHouse connection string"""
    
    # Remove clickhouse:// prefix
    if connection_string.startswith('clickhouse://'):
        connection_string = connection_string[13:]
    
    # Split at @ to separate credentials from host
    if '@' not in connection_string:
        print("❌ Invalid connection string format - missing @")
        return None
    
    credentials, rest = connection_string.split('@', 1)
    
    # Extract username and password
    if ':' not in credentials:
        print("❌ Invalid credentials format - missing :")
        return None
    
    username, password = credentials.split(':', 1)
    
    # Extract host, port, database
    if ':' not in rest:
        print("❌ Invalid host format - missing port")
        return None
    
    host_port, database = rest.split('/', 1) if '/' in rest else (rest, 'default')
    
    if ':' not in host_port:
        print("❌ Invalid host:port format")
        return None
    
    host, port = host_port.split(':', 1)
    
    try:
        port = int(port)
    except ValueError:
        print("❌ Invalid port number")
        return None
    
    return {
        'host': host,
        'port': port,
        'username': username,
        'password': password,
        'database': database
    }

def main():
    print("🔧 ClickHouse Cloud Connection String Parser")
    print("=" * 50)
    
    connection_string = input("Paste your ClickHouse connection string:\n")
    
    details = extract_connection_details(connection_string.strip())
    
    if details:
        print("\n✅ Extracted connection details:")
        print(f"Host: {details['host']}")
        print(f"Port: {details['port']}")
        print(f"Username: {details['username']}")
        print(f"Password: {details['password']}")
        print(f"Database: {details['database']}")
        
        print("\n📝 Environment variable commands:")
        print(f"export CLICKHOUSE_HOST=\"{details['host']}\"")
        print(f"export CLICKHOUSE_PORT=\"{details['port']}\"")
        print(f"export CLICKHOUSE_USER=\"{details['username']}\"")
        print(f"export CLICKHOUSE_PASSWORD=\"{details['password']}\"")
        print(f"export CLICKHOUSE_DATABASE=\"{details['database']}\"")
        
        print("\n🧪 To test the connection, run:")
        print("python3 test-clickhouse-cloud.py")
        
        return True
    else:
        print("\n❌ Failed to parse connection string")
        print("Expected format: clickhouse://username:password@host:port/database")
        return False

if __name__ == "__main__":
    main()
