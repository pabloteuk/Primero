-- Trade Map Data Schema for ClickHouse
-- Optimized for trade statistics analytics

USE primero_tradefinance;

-- Countries and territories reference table
CREATE TABLE IF NOT EXISTS trademap_countries (
    country_id UInt16,
    country_name String,
    iso2_code String,
    iso3_code String,
    region String,
    subregion String,
    data_available_from_year UInt16,
    data_available_to_year UInt16,
    monthly_data_available Bool,
    quarterly_data_available Bool,
    yearly_data_available Bool,
    last_updated_date Date,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY country_id
TTL toDate(created_at) + INTERVAL 10 YEARS;

-- Products reference table (HS codes)
CREATE TABLE IF NOT EXISTS trademap_products (
    product_code String,
    product_description String,
    hs_level UInt8,  -- 2, 4, 6 digit levels
    parent_code String,
    section_code String,
    section_name String,
    chapter_code String,
    chapter_name String,
    heading_code String,
    heading_name String,
    subheading_code String,
    subheading_name String,
    data_available_from_year UInt16,
    data_available_to_year UInt16,
    last_updated_date Date,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY product_code
TTL toDate(created_at) + INTERVAL 10 YEARS;

-- Core trade flows table
CREATE TABLE IF NOT EXISTS trademap_trade_flows (
    id UInt64,
    reporter_country_id UInt16,
    partner_country_id UInt16,
    product_code String,
    trade_flow String,  -- 'Import', 'Export', 'Re-Export', 'Re-Import'
    year UInt16,
    month UInt8,
    quarter UInt8,
    trade_value_usd UInt64,
    trade_quantity UInt64,
    quantity_unit String,
    net_weight_kg UInt64,
    gross_weight_kg UInt64,
    cif_value_usd UInt64,
    fob_value_usd UInt64,
    customs_value_usd UInt64,
    insurance_value_usd UInt64,
    freight_value_usd UInt64,
    auxiliary_value_usd UInt64,
    trade_regime String,
    partner_region String,
    reporter_region String,
    data_source String,
    last_updated DateTime,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(toDate(concat(toString(year), '-', toString(month), '-01')))
ORDER BY (reporter_country_id, partner_country_id, product_code, year, month)
TTL toDate(created_at) + INTERVAL 10 YEARS
SETTINGS index_granularity = 8192;

-- Trade indicators aggregated table
CREATE TABLE IF NOT EXISTS trademap_trade_indicators (
    id UInt64,
    reporter_country_id UInt16,
    partner_country_id UInt16,
    product_code String,
    year UInt16,
    period_type String,  -- 'monthly', 'quarterly', 'yearly'
    period_value UInt8,  -- month number, quarter number, or 0 for yearly
    trade_value_usd UInt64,
    trade_quantity UInt64,
    quantity_unit String,
    market_share_percent Decimal(5,2),
    growth_rate_percent Decimal(6,2),
    world_total_value_usd UInt64,
    world_rank UInt16,
    regional_rank UInt16,
    concentration_index Decimal(5,2),
    diversification_index Decimal(5,2),
    last_updated DateTime,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(toDate(concat(toString(year), '-', toString(if(period_type = 'yearly', 12, period_value)), '-01')))
ORDER BY (reporter_country_id, product_code, year, period_type, period_value)
TTL toDate(created_at) + INTERVAL 10 YEARS;

-- Time series data for analytics
CREATE TABLE IF NOT EXISTS trademap_time_series (
    id UInt64,
    reporter_country_id UInt16,
    partner_country_id UInt16,
    product_code String,
    time_series_type String,  -- 'yearly', 'quarterly', 'monthly'
    start_year UInt16,
    end_year UInt16,
    data_points UInt16,
    avg_trade_value_usd UInt64,
    total_trade_value_usd UInt64,
    cagr_percent Decimal(6,2),  -- Compound Annual Growth Rate
    volatility_index Decimal(5,2),
    trend_direction String,  -- 'increasing', 'decreasing', 'stable'
    seasonality_score Decimal(5,2),
    forecast_next_year_value UInt64,
    forecast_confidence_percent Decimal(5,2),
    last_updated DateTime,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (reporter_country_id, product_code, time_series_type, start_year)
TTL toDate(created_at) + INTERVAL 10 YEARS;

-- Company directory data
CREATE TABLE IF NOT EXISTS trademap_companies (
    company_id UInt64,
    company_name String,
    country_id UInt16,
    city String,
    address String,
    postal_code String,
    phone String,
    email String,
    website String,
    business_type String,
    main_products Array(String),
    export_markets Array(String),
    import_sources Array(String),
    annual_turnover_usd UInt64,
    employee_count UInt16,
    establishment_year UInt16,
    certification_array Array(String),
    trade_specialization String,
    last_updated DateTime,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY company_id
TTL toDate(created_at) + INTERVAL 5 YEARS;

-- Data availability tracking
CREATE TABLE IF NOT EXISTS trademap_data_availability (
    id UInt64,
    data_type String,  -- 'trade_flows', 'indicators', 'companies', 'products'
    country_id UInt16,
    year UInt16,
    month UInt8,
    data_available Bool,
    last_checked DateTime,
    data_quality_score UInt8,  -- 1-100
    completeness_percent UInt8,
    timeliness_days UInt16,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(last_checked)
ORDER BY (data_type, country_id, year, month)
TTL toDate(created_at) + INTERVAL 2 YEARS;

-- Market analysis insights
CREATE TABLE IF NOT EXISTS trademap_market_insights (
    id UInt64,
    country_id UInt16,
    product_code String,
    insight_type String,  -- 'opportunity', 'risk', 'trend', 'alert'
    insight_title String,
    insight_description String,
    insight_value_usd UInt64,
    growth_potential_percent Decimal(5,2),
    risk_level String,  -- 'low', 'medium', 'high'
    confidence_score UInt8,  -- 1-100
    data_period_start Date,
    data_period_end Date,
    generated_at DateTime,
    expires_at DateTime,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(generated_at)
ORDER BY (country_id, insight_type, generated_at)
TTL toDate(created_at) + INTERVAL 1 YEAR;

-- Create materialized views for common analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS trademap_yearly_trade_summary_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(toDate(concat(toString(year), '-12-31')))
ORDER BY (reporter_country_id, partner_country_id, product_code, year)
AS SELECT
    reporter_country_id,
    partner_country_id,
    product_code,
    year,
    sum(trade_value_usd) as total_trade_value_usd,
    sum(trade_quantity) as total_trade_quantity,
    count() as transaction_count,
    avg(trade_value_usd) as avg_transaction_value
FROM trademap_trade_flows
WHERE month > 0
GROUP BY reporter_country_id, partner_country_id, product_code, year;

-- Materialized view for monthly trends
CREATE MATERIALIZED VIEW IF NOT EXISTS trademap_monthly_trends_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(toDate(concat(toString(year), '-', lpad(toString(month), 2, '0'), '-01')))
ORDER BY (reporter_country_id, product_code, year, month)
AS SELECT
    reporter_country_id,
    product_code,
    year,
    month,
    sum(trade_value_usd) as monthly_trade_value_usd,
    sum(trade_quantity) as monthly_trade_quantity,
    count() as monthly_transaction_count
FROM trademap_trade_flows
GROUP BY reporter_country_id, product_code, year, month;

-- Materialized view for country rankings
CREATE MATERIALIZED VIEW IF NOT EXISTS trademap_country_rankings_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(toDate(concat(toString(year), '-12-31')))
ORDER BY (year, product_code, trade_value_usd DESC)
AS SELECT
    year,
    product_code,
    reporter_country_id,
    sum(trade_value_usd) as yearly_trade_value_usd,
    rowNumberInAllBlocks() as global_rank
FROM trademap_trade_flows
WHERE trade_flow = 'Export'
GROUP BY year, product_code, reporter_country_id
ORDER BY yearly_trade_value_usd DESC;

-- Insert sample metadata for testing
INSERT INTO trademap_countries VALUES
(1, 'United States', 'US', 'USA', 'Americas', 'Northern America', 1988, 2024, true, true, true, '2024-01-01', now()),
(2, 'China', 'CN', 'CHN', 'Asia', 'Eastern Asia', 1980, 2024, true, true, true, '2024-01-01', now()),
(3, 'Germany', 'DE', 'DEU', 'Europe', 'Western Europe', 1988, 2024, true, true, true, '2024-01-01', now()),
(4, 'United Kingdom', 'GB', 'GBR', 'Europe', 'Northern Europe', 1988, 2024, true, true, true, '2024-01-01', now()),
(5, 'Japan', 'JP', 'JPN', 'Asia', 'Eastern Asia', 1988, 2024, true, true, true, '2024-01-01', now());

INSERT INTO trademap_products VALUES
('85', 'Electrical machinery and equipment and parts thereof; sound recorders and reproducers, television image and sound recorders and reproducers, and parts and accessories of such articles', 2, '', '16', 'Machinery and mechanical appliances; electrical equipment; parts thereof; sound recorders and reproducers, television image and sound recorders and reproducers, and parts and accessories of such articles', '85', 'Electrical machinery and equipment and parts thereof; sound recorders and reproducers, television image and sound recorders and reproducers, and parts and accessories of such articles', '', '', '8517', 'Phones', 1988, 2024, '2024-01-01', now()),
('84', 'Nuclear reactors, boilers, machinery and mechanical appliances; parts thereof', 2, '', '16', 'Machinery and mechanical appliances; electrical equipment; parts thereof; sound recorders and reproducers, television image and sound recorders and reproducers, and parts and accessories of such articles', '84', 'Nuclear reactors, boilers, machinery and mechanical appliances; parts thereof', '', '', '8407', 'Spark-ignition reciprocating or rotary internal combustion piston engines', 1988, 2024, '2024-01-01', now()),
('87', 'Vehicles other than railway or tramway rolling-stock, and parts and accessories thereof', 2, '', '17', 'Vehicles, aircraft, vessels and associated transport equipment', '87', 'Vehicles other than railway or tramway rolling-stock, and parts and accessories thereof', '', '', '8703', 'Motor cars and other motor vehicles principally designed for the transport of persons', 1988, 2024, '2024-01-01', now());
