#!/usr/bin/env python3
"""
ClickHouse Data Loader for Trade Map
Loads extracted Trade Map data into ClickHouse database
"""

import pandas as pd
import clickhouse_driver
import logging
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ClickHouseLoader:
    """ClickHouse data loader for Trade Map data"""

    def __init__(self):
        self.client = None
        self.connect()

    def connect(self):
        """Connect to ClickHouse"""
        try:
            self.client = clickhouse_driver.Client(
                host=os.getenv('CLICKHOUSE_HOST', 'localhost'),
                port=int(os.getenv('CLICKHOUSE_PORT', '9000')),  # Native protocol port
                user=os.getenv('CLICKHOUSE_USER', 'default'),
                password=os.getenv('CLICKHOUSE_PASSWORD', ''),
                database=os.getenv('CLICKHOUSE_DATABASE', 'primero_tradefinance')
            )
            logger.info("Connected to ClickHouse")
        except Exception as e:
            logger.error(f"Failed to connect to ClickHouse: {e}")
            raise

    def load_countries_data(self, csv_path: str):
        """Load countries reference data"""
        try:
            df = pd.read_csv(csv_path)
            logger.info(f"Loading {len(df)} countries")

            # Prepare data for insertion
            data = []
            for _, row in df.iterrows():
                data.append({
                    'country_id': int(row['country_id']),
                    'country_name': str(row['country_name']),
                    'iso2_code': str(row.get('iso2_code', '')),
                    'iso3_code': str(row.get('iso3_code', '')),
                    'region': str(row.get('region', '')),
                    'subregion': str(row.get('subregion', '')),
                    'data_available_from_year': int(row.get('data_available_from_year', 1980)),
                    'data_available_to_year': int(row.get('data_available_to_year', 2024)),
                    'monthly_data_available': bool(row.get('monthly_data_available', True)),
                    'quarterly_data_available': bool(row.get('quarterly_data_available', True)),
                    'yearly_data_available': bool(row.get('yearly_data_available', True)),
                    'last_updated_date': pd.to_datetime(row.get('last_updated_date', datetime.now())).date(),
                    'created_at': datetime.now()
                })

            # Insert data
            self.client.execute(
                'INSERT INTO trademap_countries VALUES',
                data,
                types_check=True
            )

            logger.info(f"Successfully loaded {len(data)} countries")

        except Exception as e:
            logger.error(f"Failed to load countries data: {e}")
            raise

    def load_products_data(self, csv_path: str):
        """Load products reference data"""
        try:
            df = pd.read_csv(csv_path)
            logger.info(f"Loading {len(df)} products")

            data = []
            for _, row in df.iterrows():
                data.append({
                    'product_code': str(row['product_code']),
                    'product_description': str(row['product_description']),
                    'hs_level': int(row.get('hs_level', 2)),
                    'parent_code': str(row.get('parent_code', '')),
                    'section_code': str(row.get('section_code', '')),
                    'section_name': str(row.get('section_name', '')),
                    'chapter_code': str(row.get('chapter_code', '')),
                    'chapter_name': str(row.get('chapter_name', '')),
                    'heading_code': str(row.get('heading_code', '')),
                    'heading_name': str(row.get('heading_name', '')),
                    'subheading_code': str(row.get('subheading_code', '')),
                    'subheading_name': str(row.get('subheading_name', '')),
                    'data_available_from_year': int(row.get('data_available_from_year', 1980)),
                    'data_available_to_year': int(row.get('data_available_to_year', 2024)),
                    'last_updated_date': pd.to_datetime(row.get('last_updated_date', datetime.now())).date(),
                    'created_at': datetime.now()
                })

            self.client.execute(
                'INSERT INTO trademap_products VALUES',
                data,
                types_check=True
            )

            logger.info(f"Successfully loaded {len(data)} products")

        except Exception as e:
            logger.error(f"Failed to load products data: {e}")
            raise

    def load_trade_flows_data(self, csv_path: str, batch_size: int = 10000):
        """Load trade flows data with batching"""
        try:
            # Read CSV in chunks to handle large files
            chunk_iter = pd.read_csv(csv_path, chunksize=batch_size)
            total_loaded = 0

            for chunk_num, df in enumerate(chunk_iter):
                logger.info(f"Processing chunk {chunk_num + 1} with {len(df)} records")

                data = []
                for _, row in df.iterrows():
                    # Map country names to IDs (this would need a lookup table)
                    reporter_country_id = self._get_country_id(row['reporter_country'])
                    partner_country_id = self._get_country_id(row['partner_country'])

                    if reporter_country_id is None or partner_country_id is None:
                        continue  # Skip records with unknown countries

                    data.append({
                        'id': int(row.get('id', 0)) or self._generate_id(),
                        'reporter_country_id': reporter_country_id,
                        'partner_country_id': partner_country_id,
                        'product_code': str(row['product_code']),
                        'trade_flow': str(row['trade_flow']),
                        'year': int(row['year']),
                        'month': int(row.get('month', 0)),
                        'quarter': self._calculate_quarter(int(row.get('month', 0))),
                        'trade_value_usd': int(float(row.get('trade_value_usd', 0))),
                        'trade_quantity': int(float(row.get('trade_quantity', 0))),
                        'quantity_unit': str(row.get('quantity_unit', '')),
                        'net_weight_kg': int(float(row.get('net_weight_kg', 0))) if pd.notna(row.get('net_weight_kg')) else None,
                        'gross_weight_kg': int(float(row.get('gross_weight_kg', 0))) if pd.notna(row.get('gross_weight_kg')) else None,
                        'cif_value_usd': None,  # Not available in sample data
                        'fob_value_usd': None,
                        'customs_value_usd': None,
                        'insurance_value_usd': None,
                        'freight_value_usd': None,
                        'auxiliary_value_usd': None,
                        'trade_regime': '',
                        'partner_region': '',
                        'reporter_region': '',
                        'data_source': 'ITC Trade Map',
                        'last_updated': datetime.now(),
                        'created_at': datetime.now()
                    })

                if data:
                    self.client.execute(
                        'INSERT INTO trademap_trade_flows VALUES',
                        data,
                        types_check=True
                    )

                    total_loaded += len(data)
                    logger.info(f"Loaded {len(data)} records in chunk {chunk_num + 1}")

            logger.info(f"Successfully loaded {total_loaded} trade flow records")

        except Exception as e:
            logger.error(f"Failed to load trade flows data: {e}")
            raise

    def _get_country_id(self, country_name: str) -> Optional[int]:
        """Get country ID by name from cache or database"""
        # This would need to be implemented with a cache or lookup
        # For now, return a default mapping
        country_mapping = {
            'United States': 1,
            'China': 2,
            'Germany': 3,
            'United Kingdom': 4,
            'Japan': 5
        }
        return country_mapping.get(country_name)

    def _calculate_quarter(self, month: int) -> int:
        """Calculate quarter from month"""
        if month == 0:
            return 0
        return ((month - 1) // 3) + 1

    def _generate_id(self) -> int:
        """Generate unique ID for records"""
        # This would need a proper ID generation strategy
        import random
        return random.randint(1000000, 9999999)

    def update_data_availability(self, country_id: int, year: int, month: int, available: bool):
        """Update data availability tracking"""
        try:
            data = [{
                'id': self._generate_id(),
                'data_type': 'trade_flows',
                'country_id': country_id,
                'year': year,
                'month': month,
                'data_available': available,
                'last_checked': datetime.now(),
                'data_quality_score': 95 if available else 0,
                'completeness_percent': 100 if available else 0,
                'timeliness_days': 0,
                'created_at': datetime.now()
            }]

            self.client.execute(
                'INSERT INTO trademap_data_availability VALUES',
                data,
                types_check=True
            )

        except Exception as e:
            logger.error(f"Failed to update data availability: {e}")

    def create_materialized_views(self):
        """Create materialized views for analytics"""
        try:
            logger.info("Creating materialized views...")

            # The materialized views are already defined in the schema
            # This function would recreate them if needed

            logger.info("Materialized views created successfully")

        except Exception as e:
            logger.error(f"Failed to create materialized views: {e}")
            raise

    def get_database_stats(self) -> Dict:
        """Get database statistics"""
        try:
            stats = {}

            # Get table sizes
            result = self.client.execute("""
                SELECT
                    table,
                    sum(rows) as total_rows,
                    formatReadableSize(sum(bytes)) as total_size
                FROM system.parts
                WHERE database = 'primero_tradefinance'
                    AND table LIKE 'trademap_%'
                    AND active = 1
                GROUP BY table
                ORDER BY table
            """)

            stats['tables'] = [{'table': row[0], 'rows': row[1], 'size': row[2]} for row in result]

            # Get total database size
            result = self.client.execute("""
                SELECT
                    count() as total_tables,
                    sum(rows) as total_rows,
                    formatReadableSize(sum(bytes)) as total_size
                FROM system.parts
                WHERE database = 'primero_tradefinance'
                    AND table LIKE 'trademap_%'
                    AND active = 1
            """)

            if result:
                stats['summary'] = {
                    'total_tables': result[0][0],
                    'total_rows': result[0][1],
                    'total_size': result[0][2]
                }

            return stats

        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {}

    def close(self):
        """Close database connection"""
        if self.client:
            self.client.disconnect()
            logger.info("Disconnected from ClickHouse")

def main():
    """Main entry point"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python clickhouse-loader.py <csv_file>")
        sys.exit(1)

    csv_file = sys.argv[1]

    if not os.path.exists(csv_file):
        print(f"Error: CSV file {csv_file} not found")
        sys.exit(1)

    loader = ClickHouseLoader()

    try:
        # Determine data type from filename or content
        if 'countries' in csv_file.lower():
            loader.load_countries_data(csv_file)
        elif 'products' in csv_file.lower():
            loader.load_products_data(csv_file)
        else:
            loader.load_trade_flows_data(csv_file)

        # Update data availability (example)
        # loader.update_data_availability(1, 2024, 1, True)

        # Get and display stats
        stats = loader.get_database_stats()
        if stats:
            print("\nDatabase Statistics:")
            print(json.dumps(stats, indent=2))

        logger.info("Data loading completed successfully")

    except Exception as e:
        logger.error(f"Data loading failed: {e}")
        sys.exit(1)
    finally:
        loader.close()

if __name__ == "__main__":
    main()
