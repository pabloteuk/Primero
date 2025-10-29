# ClickPipes Setup Guide for Primero Trade Finance Platform

## Overview

ClickPipes is ClickHouse Cloud's managed integration platform that makes ingesting data from diverse sources simple. This guide covers setting up ClickPipes for the Primero platform to automatically ingest trade data from various sources.

## Supported Data Sources

### ✅ **Currently Supported by ClickPipes**
- **Apache Kafka** - Streaming data ingestion
- **Confluent Cloud** - Direct Confluent integration
- **Redpanda** - Streaming data from Redpanda
- **AWS MSK** - Managed Streaming for Kafka
- **Azure Event Hubs** - Azure streaming data
- **WarpStream** - Modern streaming platform
- **Amazon S3** - Object storage batch loading
- **Google Cloud Storage** - GCS batch loading
- **DigitalOcean Spaces** - Object storage
- **Azure Blob Storage** - Azure object storage
- **Amazon Kinesis** - AWS streaming data
- **PostgreSQL** - Database ingestion
- **MySQL** - Database ingestion (Public Beta)
- **MongoDB** - Document database (Private Preview)

### 🔄 **Planned for Primero**
1. **UN Comtrade API** → **Amazon S3** → ClickPipes ingestion
2. **ITC Trade Map** → **Amazon S3** → ClickPipes ingestion
3. **Custom APIs** → **Kafka** → ClickPipes streaming

## ClickPipes Setup Steps

### Step 1: Access ClickHouse Cloud Console

1. Log into your [ClickHouse Cloud Console](https://console.clickhouse.cloud)
2. Navigate to your service
3. Go to **Integrations** → **ClickPipes**

### Step 2: Create ClickPipes for Data Ingestion

#### Option A: S3 Batch Loading (Recommended for Trade Data)

```sql
-- Create destination table for UN Comtrade data
CREATE TABLE un_comtrade_trade_data (
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
PARTITION BY toYYYYMM(toDate(period || '-01'))
TTL toDate(period || '-01') + INTERVAL 10 YEARS;
```

**ClickPipes Configuration:**
- **Source**: Amazon S3
- **S3 Bucket**: `primero-trade-data`
- **File Format**: CSV/JSON/Parquet
- **Destination Table**: `un_comtrade_trade_data`
- **Schedule**: Every 6 hours

**Advanced Settings:**
```
Max insert bytes: 10GB
Max file count: 100
Max threads: auto(3)
Max insert threads: 1
Min insert block size bytes: 1GB
Max download threads: 4
Object storage polling interval: 30s
```

#### Option B: PostgreSQL Integration (For Internal Data)

If you have a PostgreSQL database with trade data:

```sql
-- Create ClickPipes role with specific settings
CREATE ROLE primero_clickpipes_role SETTINGS
    max_threads = 4,
    max_insert_threads = 2,
    max_memory_usage = 10000000000; -- 10GB

-- Grant necessary permissions
GRANT SELECT ON database primero TO primero_clickpipes_role;
```

**ClickPipes Configuration:**
- **Source**: PostgreSQL
- **Host**: `your-postgres-host`
- **Database**: `primero`
- **Tables**: `un_comtrade_trade_data`, `itc_trade_map_data`
- **Sync Mode**: Incremental
- **Destination**: ClickHouse Cloud service

### Step 3: Configure Data Transformation

ClickPipes supports basic transformations. For advanced transformations, use ClickHouse Materialized Views:

```sql
-- Create materialized view for trade analytics
CREATE MATERIALIZED VIEW mv_trade_analytics
ENGINE = MergeTree()
PARTITION BY toYYYYMM(period_date)
ORDER BY (reporter_code, period_date, trade_flow_code)
AS
SELECT
    reporter_code,
    reporter_desc,
    toDate(period || '-01') as period_date,
    trade_flow_code,
    trade_flow_desc,
    classification_code,
    sum(primary_value_usd) as total_trade_value,
    sum(qty) as total_quantity,
    count(*) as record_count,
    avg(primary_value_usd) as avg_transaction_value
FROM un_comtrade_trade_data
GROUP BY reporter_code, reporter_desc, period_date, trade_flow_code, trade_flow_desc, classification_code;
```

### Step 4: Set Up Monitoring and Alerts

#### Error Handling Tables

ClickPipes automatically creates error tables:

```sql
-- Check for data errors
SELECT * FROM un_comtrade_trade_data_clickpipes_error
LIMIT 10;

-- Check for system errors
SELECT * FROM system.clickpipes_log
WHERE service_name = 'your_clickpipes_name'
ORDER BY event_time DESC
LIMIT 20;
```

#### Monitoring Queries

```sql
-- Monitor ClickPipes performance
SELECT
    service_name,
    status,
    source_type,
    destination_table,
    records_processed,
    last_successful_run,
    avg_processing_time
FROM system.clickpipes_metrics
WHERE service_name LIKE '%primero%';
```

### Step 5: Configure Data Pipeline Automation

#### Cron Job for Data Collection

```bash
#!/bin/bash
# Daily data collection script

# Set environment variables
source /path/to/clickhouse-cloud-env.sh

# Run UN Comtrade collection
python3 data-collection-script.py --source un-comtrade --countries "USA,CHN,DEU,JPN"

# Run ITC collection
python3 data-collection-script.py --source itc --countries "all"

# Upload to S3 for ClickPipes ingestion
aws s3 sync ./data/ s3://primero-trade-data/ --delete

echo "Data collection completed at $(date)"
```

#### GitHub Actions for Automated Collection

```yaml
name: Daily Trade Data Collection

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  collect-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install boto3  # For S3 upload

      - name: Run data collection
        run: python data-collection-script.py
        env:
          CLICKHOUSE_HOST: ${{ secrets.CLICKHOUSE_HOST }}
          CLICKHOUSE_PASSWORD: ${{ secrets.CLICKHOUSE_PASSWORD }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Upload to S3
        run: |
          aws s3 sync ./data/ s3://primero-trade-data/ --delete
```

### Step 6: Static IP Configuration

If your data sources require IP whitelisting, add ClickHouse's static IPs to your allowlists:

#### AWS Region IPs (for S3, etc.)
- **us-east-1**: 54.82.38.199, 3.90.133.29, 52.5.177.8, 3.227.227.145, 3.216.6.184, 54.84.202.92
- **eu-central-1**: 18.195.233.217, 3.127.86.90, 35.157.23.2, 18.197.167.47, 3.122.25.29, 52.28.148.40
- **us-west-2**: 52.42.100.5, 44.242.47.162, 52.40.44.52 (from 24 Jun 2025)

### Step 7: Performance Optimization

#### ClickHouse Settings for ClickPipes

```sql
-- Create custom role for ClickPipes optimization
CREATE ROLE primero_clickpipes_role SETTINGS
    max_threads = 8,
    max_insert_threads = 4,
    max_memory_usage = 20000000000, -- 20GB
    max_bytes_before_external_group_by = 20000000000,
    max_bytes_before_external_sort = 20000000000,
    distributed_aggregation_memory_efficient = 1;
```

#### ClickPipes Advanced Configuration

```yaml
# ClickPipes settings in service configuration
clickpipes:
  max_insert_bytes: 10GB
  max_file_count: 100
  max_threads: 8
  max_insert_threads: 4
  min_insert_block_size_bytes: 1GB
  max_download_threads: 8
  object_storage_polling_interval: 30s
  parallel_distributed_insert_select: 4
  parallel_view_processing: true
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Increase `CLICKHOUSE_CONNECT_TIMEOUT` and `CLICKHOUSE_SEND_RECEIVE_TIMEOUT`
   - Check network connectivity to ClickHouse Cloud

2. **Memory Issues**
   - Reduce batch sizes in ClickPipes configuration
   - Increase ClickHouse memory settings

3. **Data Format Errors**
   - Check source data format matches ClickHouse table schema
   - Review error tables for malformed records

4. **Rate Limiting**
   - Implement exponential backoff in data collection scripts
   - Use multiple ClickPipes for different data sources

### Monitoring Queries

```sql
-- Check ClickPipes health
SELECT
    service_name,
    status,
    error_message,
    last_run_time,
    records_processed_today
FROM system.clickpipes_status;

-- Performance metrics
SELECT
    query_type,
    average_execution_time,
    total_queries,
    failed_queries
FROM system.query_metrics
WHERE query_type LIKE '%clickpipes%';
```

## Next Steps

1. **Set up your ClickHouse Cloud service**
2. **Configure S3 bucket for data staging**
3. **Create ClickPipes for UN Comtrade and ITC data**
4. **Set up automated data collection pipelines**
5. **Configure monitoring and alerting**
6. **Test end-to-end data flow**

This ClickPipes setup will provide a robust, scalable data ingestion pipeline for your Primero trade finance platform! 🚀
