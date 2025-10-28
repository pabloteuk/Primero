#!/usr/bin/env python3
"""
Trade Map Data Extractor
Extracts trade data from ITC Trade Map website and prepares for ClickHouse ingestion
"""

import asyncio
import aiohttp
import json
import logging
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class TradeDataRecord:
    """Data structure for trade flow records"""
    reporter_country: str
    partner_country: str
    product_code: str
    trade_flow: str  # Import/Export
    year: int
    month: int
    trade_value_usd: float
    trade_quantity: float
    quantity_unit: str
    net_weight_kg: Optional[float] = None
    gross_weight_kg: Optional[float] = None

@dataclass
class DataAvailabilityRecord:
    """Data availability tracking"""
    country_id: int
    year: int
    month: int
    data_available: bool
    last_checked: datetime
    data_quality_score: int

class TradeMapExtractor:
    """Main extractor class for Trade Map data"""

    def __init__(self, base_url: str = "https://www.trademap.org"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.data_dir = Path("./data/trademap")
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Rate limiting
        self.request_delay = 1.0  # seconds between requests
        self.last_request_time = datetime.now()

        # Data cache
        self.countries_cache: Dict[str, int] = {}
        self.products_cache: Dict[str, str] = {}

    async def __aenter__(self):
        """Context manager entry"""
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': f'{self.base_url}/'
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        if self.session:
            await self.session.close()

    async def _rate_limit_wait(self):
        """Implement rate limiting"""
        now = datetime.now()
        time_since_last = (now - self.last_request_time).total_seconds()
        if time_since_last < self.request_delay:
            await asyncio.sleep(self.request_delay - time_since_last)
        self.last_request_time = datetime.now()

    async def get_countries_list(self) -> Dict[str, int]:
        """Get list of available countries"""
        if self.countries_cache:
            return self.countries_cache

        try:
            url = f"{self.base_url}/api/countries"
            await self._rate_limit_wait()

            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self.countries_cache = {item['name']: item['id'] for item in data}
                    logger.info(f"Loaded {len(self.countries_cache)} countries")
                    return self.countries_cache
                else:
                    logger.warning(f"Failed to get countries list: {response.status}")
                    return {}

        except Exception as e:
            logger.error(f"Error getting countries list: {e}")
            return {}

    async def get_products_list(self) -> Dict[str, str]:
        """Get list of available products"""
        if self.products_cache:
            return self.products_cache

        try:
            url = f"{self.base_url}/api/products"
            await self._rate_limit_wait()

            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self.products_cache = {item['code']: item['description'] for item in data}
                    logger.info(f"Loaded {len(self.products_cache)} products")
                    return self.products_cache
                else:
                    logger.warning(f"Failed to get products list: {response.status}")
                    return {}

        except Exception as e:
            logger.error(f"Error getting products list: {e}")
            return {}

    async def extract_trade_data(
        self,
        reporter_country: str,
        partner_country: str,
        product_code: str,
        year: int,
        month: Optional[int] = None
    ) -> List[TradeDataRecord]:
        """Extract trade data for specific parameters"""

        try:
            # Construct API URL (this would need to be reverse-engineered from Trade Map)
            params = {
                'reporter': reporter_country,
                'partner': partner_country,
                'product': product_code,
                'year': year,
                'flow': 'export'  # or 'import'
            }

            if month:
                params['month'] = month

            url = f"{self.base_url}/api/trade-data"
            await self._rate_limit_wait()

            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    records = []

                    for item in data:
                        record = TradeDataRecord(
                            reporter_country=reporter_country,
                            partner_country=partner_country,
                            product_code=product_code,
                            trade_flow=item.get('flow', 'Export'),
                            year=year,
                            month=month or item.get('month', 0),
                            trade_value_usd=float(item.get('trade_value_usd', 0)),
                            trade_quantity=float(item.get('trade_quantity', 0)),
                            quantity_unit=item.get('quantity_unit', ''),
                            net_weight_kg=item.get('net_weight_kg'),
                            gross_weight_kg=item.get('gross_weight_kg')
                        )
                        records.append(record)

                    return records
                else:
                    logger.warning(f"Failed to extract trade data: {response.status}")
                    return []

        except Exception as e:
            logger.error(f"Error extracting trade data: {e}")
            return []

    async def extract_bulk_data(
        self,
        countries: List[str],
        products: List[str],
        start_year: int,
        end_year: int,
        include_monthly: bool = False
    ) -> List[TradeDataRecord]:
        """Extract bulk trade data"""

        all_records = []
        total_combinations = len(countries) * len(products) * (end_year - start_year + 1)

        if include_monthly:
            total_combinations *= 12

        logger.info(f"Starting bulk extraction for {total_combinations} combinations")

        for reporter in countries:
            for product in products:
                for year in range(start_year, end_year + 1):
                    try:
                        if include_monthly:
                            for month in range(1, 13):
                                records = await self.extract_trade_data(
                                    reporter, 'World', product, year, month
                                )
                                all_records.extend(records)
                                await asyncio.sleep(0.1)  # Brief pause between requests
                        else:
                            records = await self.extract_trade_data(
                                reporter, 'World', product, year
                            )
                            all_records.extend(records)

                        logger.info(f"Processed {reporter} - {product} - {year}")

                    except Exception as e:
                        logger.error(f"Error processing {reporter}-{product}-{year}: {e}")
                        continue

        return all_records

    def save_to_csv(self, records: List[TradeDataRecord], filename: str):
        """Save records to CSV file"""
        data = []
        for record in records:
            data.append({
                'reporter_country': record.reporter_country,
                'partner_country': record.partner_country,
                'product_code': record.product_code,
                'trade_flow': record.trade_flow,
                'year': record.year,
                'month': record.month,
                'trade_value_usd': record.trade_value_usd,
                'trade_quantity': record.trade_quantity,
                'quantity_unit': record.quantity_unit,
                'net_weight_kg': record.net_weight_kg,
                'gross_weight_kg': record.gross_weight_kg,
                'extracted_at': datetime.now().isoformat()
            })

        df = pd.DataFrame(data)
        filepath = self.data_dir / filename
        df.to_csv(filepath, index=False)
        logger.info(f"Saved {len(records)} records to {filepath}")

    def save_metadata(self, metadata: Dict, filename: str):
        """Save metadata to JSON file"""
        filepath = self.data_dir / filename
        with open(filepath, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
        logger.info(f"Saved metadata to {filepath}")

class TradeMapDataPipeline:
    """Complete data pipeline for Trade Map integration"""

    def __init__(self):
        self.extractor = TradeMapExtractor()
        self.clickhouse_config = {
            'host': os.getenv('CLICKHOUSE_HOST', 'localhost'),
            'port': int(os.getenv('CLICKHOUSE_PORT', '8123')),
            'user': os.getenv('CLICKHOUSE_USER', 'default'),
            'password': os.getenv('CLICKHOUSE_PASSWORD', ''),
            'database': os.getenv('CLICKHOUSE_DATABASE', 'primero_tradefinance')
        }

    async def run_full_pipeline(self):
        """Run the complete data extraction and ingestion pipeline"""

        logger.info("Starting Trade Map data pipeline")

        async with self.extractor as extractor:
            try:
                # Step 1: Get reference data
                logger.info("Fetching reference data...")
                countries = await extractor.get_countries_list()
                products = await extractor.get_products_list()

                # Save metadata
                metadata = {
                    'countries_count': len(countries),
                    'products_count': len(products),
                    'extraction_timestamp': datetime.now().isoformat(),
                    'data_source': 'ITC Trade Map'
                }
                extractor.save_metadata(metadata, 'extraction_metadata.json')

                # Step 2: Extract trade data
                logger.info("Extracting trade data...")
                target_countries = ['United States', 'China', 'Germany', 'Japan', 'United Kingdom']
                target_products = ['85', '84', '87']  # Electronics, Machinery, Vehicles
                start_year = 2020
                end_year = 2024

                records = await extractor.extract_bulk_data(
                    target_countries, target_products, start_year, end_year, include_monthly=False
                )

                # Step 3: Save raw data
                if records:
                    filename = f"trade_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    extractor.save_to_csv(records, filename)

                    # Step 4: Ingest to ClickHouse
                    await self.ingest_to_clickhouse(filename)

                logger.info(f"Pipeline completed successfully. Processed {len(records)} records.")

            except Exception as e:
                logger.error(f"Pipeline failed: {e}")
                raise

    async def ingest_to_clickhouse(self, csv_filename: str):
        """Ingest CSV data to ClickHouse"""

        try:
            # This would use clickhouse-driver or HTTP API to insert data
            # For now, just log the intention
            logger.info(f"Would ingest {csv_filename} to ClickHouse database: {self.clickhouse_config['database']}")

            # TODO: Implement actual ClickHouse insertion
            # - Read CSV file
            # - Transform data to ClickHouse format
            # - Insert into trademap_trade_flows table
            # - Handle duplicates and errors
            # - Update data availability tracking

        except Exception as e:
            logger.error(f"ClickHouse ingestion failed: {e}")
            raise

async def main():
    """Main entry point"""
    pipeline = TradeMapDataPipeline()

    try:
        await pipeline.run_full_pipeline()
    except KeyboardInterrupt:
        logger.info("Pipeline interrupted by user")
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
