#!/usr/bin/env python3
"""
Create ClickHouse Cloud database and tables
"""

import clickhouse_connect
import os

def main():
    config = {
        'host': os.getenv('CLICKHOUSE_HOST'),
        'port': int(os.getenv('CLICKHOUSE_PORT', '8443')),
        'username': os.getenv('CLICKHOUSE_USER', 'default'),
        'password': os.getenv('CLICKHOUSE_PASSWORD'),
        'database': 'default',  # Connect to default database first
        'secure': True
    }
    
    print("🔧 Creating ClickHouse Cloud database and tables...")
    
    try:
        client = clickhouse_connect.get_client(**config)
        print("✅ Connected to ClickHouse Cloud")
        
        # Create database
        client.command("CREATE DATABASE IF NOT EXISTS trade_finance_deck")
        print("✅ Database 'trade_finance_deck' created")

        # Create tables in the specific database
        tables_sql = [
            """
            CREATE TABLE IF NOT EXISTS trade_finance_deck.un_comtrade_trade_data (
                id UInt64,
                type_code String,
                freq_code String,
                cl_code String,
                period String,
                reporter_code String,
                reporter_desc String,
                reporter_iso String,
                partner_code String,
                partner_desc String,
                partner_iso String,
                classification_code String,
                classification_search_code String,
                is_leaf_code Bool,
                trade_flow_code String,
                trade_flow_desc String,
                customs_code String,
                customs_desc String,
                qty_unit_code String,
                qty_unit_abbr String,
                qty String,
                trade_value_usd UInt64,
                cif_value_usd UInt64,
                fob_value_usd UInt64,
                primary_value_usd UInt64,
                legacy_estimation_flag Bool,
                is_reported Bool,
                is_aggregate Bool,
                published_date Date,
                data_source String,
                created_at DateTime DEFAULT now(),
                updated_at DateTime DEFAULT now()
            ) ENGINE = MergeTree()
            ORDER BY (period, reporter_code, partner_code, classification_code, trade_flow_code)
            PARTITION BY toYYYYMM(toDate(concat(period, '-01-01')))
            ;
            """,
            """
            CREATE TABLE IF NOT EXISTS trade_finance_deck.itc_trade_map_data (
                id UInt64,
                country_code String,
                country_name String,
                partner_code String,
                partner_name String,
                product_code String,
                product_name String,
                trade_flow String,
                year UInt16,
                trade_value_usd UInt64,
                quantity UInt64,
                quantity_unit String,
                market_share Float64,
                growth_rate Float64,
                data_source String,
                collected_at DateTime DEFAULT now()
            ) ENGINE = MergeTree()
            ORDER BY (country_code, partner_code, product_code, year, trade_flow)
            PARTITION BY year;
            """
        ]
        
        for table_sql in tables_sql:
            client.command(table_sql)
            print(f"✅ Created table: {table_sql.split('(')[0].strip()}")
        
        # Test query
        result = client.query("SHOW TABLES")
        tables = [row[0] for row in result.result_rows]
        print(f"📊 Tables in database: {tables}")
        
        client.close()
        print("🎉 ClickHouse Cloud database setup complete!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to setup database: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
