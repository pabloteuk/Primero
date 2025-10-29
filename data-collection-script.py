#!/usr/bin/env python3
"""
Automated Data Collection Script for Primero Trade Finance Platform

This script collects trade data from:
1. UN Comtrade Database API
2. ITC Trade Map (via web scraping)

Data is stored in ClickHouse for analysis and visualization.
"""

import asyncio
import aiohttp
import pandas as pd
import clickhouse_connect
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_collection.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
UN_COMTRADE_CONFIG = {
    'primary_key': '981ae9857dcd4788aada12fcdba5c8da',
    'secondary_key': '14aaf0a676fe40fa98772d42eee702a7',
    'base_url': 'https://comtradeapi.un.org'
}

CLICKHOUSE_CONFIG = {
    'host': os.getenv('CLICKHOUSE_HOST', 'localhost'),
    'port': int(os.getenv('CLICKHOUSE_PORT', '8123')),
    'username': os.getenv('CLICKHOUSE_USER', 'default'),
    'password': os.getenv('CLICKHOUSE_PASSWORD', 'K~IXCGmyOoWo1'),
    'database': os.getenv('CLICKHOUSE_DATABASE', 'trade-finance-deck'),
    'secure': os.getenv('CLICKHOUSE_SECURE', 'false').lower() == 'true'
}

class DataCollector:
    def __init__(self):
        self.client = None
        self.session = None

    async def initialize(self):
        """Initialize ClickHouse client and HTTP session"""
        try:
            self.client = clickhouse_connect.get_client(**CLICKHOUSE_CONFIG)
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=300)
            )
            logger.info("✅ Initialized data collection services")
        except Exception as e:
            logger.error(f"❌ Failed to initialize services: {e}")
            raise

    async def close(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
        if self.client:
            self.client.close()

    async def create_tables(self):
        """Create necessary ClickHouse tables"""
        try:
            # UN Comtrade table
            self.client.command("""
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
                    partner2_code String,
                    partner2_desc String,
                    partner2_iso String,
                    classification_code String,
                    classification_search_code String,
                    is_leaf_code Bool,
                    trade_flow_code String,
                    trade_flow_desc String,
                    customs_code String,
                    customs_desc String,
                    mot_code String,
                    mot_desc String,
                    qty_unit_code String,
                    qty_unit_abbr String,
                    qty String,
                    alt_qty_unit_code String,
                    alt_qty_unit_abbr String,
                    alt_qty String,
                    net_wgt String,
                    gross_wgt String,
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
                PARTITION BY toYYYYMM(toDate(period || '-01'))
                TTL toDate(period || '-01') + INTERVAL 10 YEARS
            """)

            # ITC Trade Map table
            self.client.command("""
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
                PARTITION BY year
            """)

            logger.info("✅ Created ClickHouse tables")
        except Exception as e:
            logger.error(f"❌ Failed to create tables: {e}")
            raise

    async def collect_un_comtrade_data(self, countries: List[str] = None, years: List[int] = None):
        """Collect data from UN Comtrade API"""
        if not countries:
            # Major trading countries
            countries = ['842', '156', '392', '276', '724', '250', '826', '410', '36', '76']

        if not years:
            years = [2021]  # Use 2021 as it has reliable data

        logger.info(f"🌍 Starting UN Comtrade data collection for {len(countries)} countries and {len(years)} years")

        total_collected = 0

        for country_code in countries:
            for year in years:
                try:
                    logger.info(f"📊 Collecting data for country {country_code}, year {year}")

                    # Rate limiting: wait 1 second between requests
                    await asyncio.sleep(1)

                    # Get final trade data
                    url = f"{UN_COMTRADE_CONFIG['base_url']}/data/v1/get/C/A/HS"
                    params = {
                        'reporterCode': country_code,
                        'period': str(year),
                        'flowCode': 'X',  # Exports
                        'maxRecords': 10,  # Start very small
                        'format': 'JSON'
                    }
                    logger.info(f"🔗 API URL: {url}")
                    logger.info(f"🔗 API params: {params}")

                    headers = {
                        'Ocp-Apim-Subscription-Key': UN_COMTRADE_CONFIG['primary_key']
                    }

                    async with self.session.get(url, params=params, headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()

                            if data.get('data'):
                                logger.info(f"✅ Got {len(data['data'])} records from UN Comtrade API")

                                # Debug: log first item structure
                                if data['data']:
                                    logger.info(f"🔍 Sample API response item keys: {list(data['data'][0].keys())}")
                                    logger.info(f"🔍 Sample API response item: {data['data'][0]}")

                                # Transform and insert data
                                records = []
                                for item in data['data']:
                                    # Helper function to convert None to empty string
                                    def none_to_empty(value):
                                        return '' if value is None else str(value)

                                    record = {
                                        'id': int(str(datetime.now().timestamp()).replace('.', '')) + len(records),
                                        'type_code': item.get('typeCode', ''),
                                        'freq_code': item.get('freqCode', ''),
                                        'cl_code': item.get('classificationCode', ''),
                                        'period': item.get('period', ''),
                                        'reporter_code': str(item.get('reporterCode', '')),
                                        'reporter_desc': none_to_empty(item.get('reporterDesc')),
                                        'reporter_iso': none_to_empty(item.get('reporterISO')),
                                        'partner_code': str(item.get('partnerCode', '')),
                                        'partner_desc': none_to_empty(item.get('partnerDesc')),
                                        'partner_iso': none_to_empty(item.get('partnerISO')),
                                        'partner2_code': str(item.get('partner2Code', '')),
                                        'partner2_desc': none_to_empty(item.get('partner2Desc')),
                                        'partner2_iso': none_to_empty(item.get('partner2ISO')),
                                        'classification_code': item.get('classificationCode', ''),
                                        'classification_search_code': item.get('classificationSearchCode', ''),
                                        'is_leaf_code': item.get('isOriginalClassification', False),
                                        'trade_flow_code': item.get('flowCode', ''),
                                        'trade_flow_desc': none_to_empty(item.get('flowDesc')),
                                        'customs_code': item.get('customsCode', ''),
                                        'customs_desc': none_to_empty(item.get('customsDesc')),
                                        'mot_code': str(item.get('motCode', '')),
                                        'mot_desc': none_to_empty(item.get('motDesc')),
                                        'qty_unit_code': str(item.get('qtyUnitCode', '')),
                                        'qty_unit_abbr': none_to_empty(item.get('qtyUnitAbbr')),
                                        'qty': str(item.get('qty', '')),
                                        'alt_qty_unit_code': str(item.get('altQtyUnitCode', '')),
                                        'alt_qty_unit_abbr': none_to_empty(item.get('altQtyUnitAbbr')),
                                        'alt_qty': str(item.get('altQty', '')),
                                        'net_wgt': str(item.get('netWgt', '')),
                                        'gross_wgt': str(item.get('grossWgt', '')),
                                        'trade_value_usd': int(item.get('primaryValue', 0)),
                                        'cif_value_usd': int(item.get('cifvalue', 0) or 0),
                                        'fob_value_usd': int(item.get('fobvalue', 0) or 0),
                                        'primary_value_usd': int(item.get('primaryValue', 0)),
                                        'legacy_estimation_flag': item.get('legacyEstimationFlag', 0) == 1,
                                        'is_reported': item.get('isReported', False),
                                        'is_aggregate': item.get('isAggregate', False),
                                        'published_date': datetime.now().date(),
                                        'data_source': 'un_comtrade_api'
                                    }
                                    records.append(record)

                                if records:
                                    logger.info(f"🔍 Sample processed record: {records[0]}")
                                    logger.info(f"🔍 Record types: {[(k, type(v).__name__) for k, v in records[0].items()]}")

                                    # Insert in batches - specify column names explicitly
                                    batch_size = 10000
                                    column_names = ['id', 'type_code', 'freq_code', 'cl_code', 'period', 'reporter_code', 'reporter_desc', 'reporter_iso', 'partner_code', 'partner_desc', 'partner_iso', 'partner2_code', 'partner2_desc', 'partner2_iso', 'classification_code', 'classification_search_code', 'is_leaf_code', 'trade_flow_code', 'trade_flow_desc', 'customs_code', 'customs_desc', 'mot_code', 'mot_desc', 'qty_unit_code', 'qty_unit_abbr', 'qty', 'alt_qty_unit_code', 'alt_qty_unit_abbr', 'alt_qty', 'net_wgt', 'gross_wgt', 'trade_value_usd', 'cif_value_usd', 'fob_value_usd', 'primary_value_usd', 'legacy_estimation_flag', 'is_reported', 'is_aggregate', 'published_date', 'data_source']

                                    for i in range(0, len(records), batch_size):
                                        batch = records[i:i + batch_size]
                                        # Extract values in the correct column order
                                        batch_values = [[record[col] for col in column_names] for record in batch]
                                        self.client.insert('trade_finance_deck.un_comtrade_trade_data', batch_values, column_names=column_names)

                                    total_collected += len(records)
                                    logger.info(f"✅ Inserted {len(records)} records for {country_code}-{year}")

                        else:
                            if response.status == 429:
                                logger.warning(f"❌ Rate limited for {country_code}-{year}. Waiting 30 seconds...")
                                await asyncio.sleep(30)
                            elif response.status == 500:
                                logger.warning(f"❌ Server error for {country_code}-{year}. Skipping...")
                            else:
                                logger.warning(f"❌ Failed to fetch data for {country_code}-{year}: HTTP {response.status}")

                    # Rate limiting - avoid overwhelming the API
                    await asyncio.sleep(2)

                except Exception as e:
                    logger.error(f"❌ Error collecting data for {country_code}-{year}: {e}")

        logger.info(f"✅ UN Comtrade collection completed. Total records: {total_collected}")

    async def collect_itc_trade_map_data(self):
        """Collect data from ITC Trade Map (placeholder for web scraping implementation)"""
        logger.info("🌐 Starting ITC Trade Map data collection")

        # Placeholder - implement web scraping logic here
        # This would involve:
        # 1. Selenium/Playwright for browser automation
        # 2. Navigating to ITC Trade Map
        # 3. Extracting trade data
        # 4. Storing in ClickHouse

        logger.info("⚠️ ITC Trade Map scraping not yet implemented")

    async def get_collection_stats(self):
        """Get statistics about collected data"""
        try:
            # UN Comtrade stats
            un_result = self.client.query("""
                SELECT
                    count(*) as total_records,
                    count(distinct reporter_code) as countries_count,
                    count(distinct partner_code) as partners_count,
                    sum(trade_value_usd) as total_value,
                    max(created_at) as last_updated
                FROM un_comtrade_trade_data
            """)

            # ITC stats
            itc_result = self.client.query("""
                SELECT
                    count(*) as total_records,
                    count(distinct country_code) as countries_count,
                    sum(trade_value_usd) as total_value,
                    max(collected_at) as last_updated
                FROM itc_trade_map_data
            """)

            return {
                'un_comtrade': un_result.result_rows[0] if un_result.result_rows else None,
                'itc_trademap': itc_result.result_rows[0] if itc_result.result_rows else None
            }
        except Exception as e:
            logger.error(f"❌ Failed to get collection stats: {e}")
            return None

async def main():
    """Main data collection function"""
    collector = DataCollector()

    try:
        # Initialize services
        await collector.initialize()
        await collector.create_tables()

        # Get current stats
        stats_before = await collector.get_collection_stats()
        logger.info(f"📊 Stats before collection: {stats_before}")

        # Collect UN Comtrade data
        await collector.collect_un_comtrade_data()

        # Collect ITC Trade Map data (placeholder)
        await collector.collect_itc_trade_map_data()

        # Get final stats
        stats_after = await collector.get_collection_stats()
        logger.info(f"📊 Stats after collection: {stats_after}")

        logger.info("🎉 Data collection completed successfully!")

    except Exception as e:
        logger.error(f"💥 Data collection failed: {e}")
        sys.exit(1)
    finally:
        await collector.close()

if __name__ == "__main__":
    asyncio.run(main())
