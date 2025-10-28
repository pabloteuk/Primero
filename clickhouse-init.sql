-- ClickHouse initialization script for Primero Trade Finance Platform
-- Run this after starting ClickHouse to set up the database schema

-- Create database
CREATE DATABASE IF NOT EXISTS primero_tradefinance;

-- Use the database
USE primero_tradefinance;

-- Trade flows table
CREATE TABLE IF NOT EXISTS trade_flows (
    id UInt64,
    timestamp DateTime,
    origin_country String,
    destination_country String,
    trade_value_usd UInt64,
    trade_volume_tons UInt64,
    commodity_type String,
    supplier_id UInt64,
    buyer_id UInt64,
    payment_terms String,
    incoterms String,
    transport_mode String,
    logistics_provider String,
    customs_clearance_time_days UInt8,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, origin_country, destination_country)
TTL toDate(timestamp) + INTERVAL 5 YEARS;

-- Supplier master data
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id UInt64,
    company_name String,
    country String,
    industry_sector String,
    company_size String,
    credit_rating String,
    annual_revenue_usd UInt64,
    years_in_business UInt8,
    compliance_status String,
    kyc_status String,
    aml_status String,
    ubo_verified Bool,
    last_audit_date Date,
    risk_score UInt8,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY supplier_id
TTL toDate(created_at) + INTERVAL 10 YEARS;

-- Invoice data
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id String,
    supplier_id UInt64,
    buyer_id UInt64,
    invoice_date Date,
    due_date Date,
    currency String,
    invoice_amount Decimal(18,2),
    outstanding_amount Decimal(18,2),
    status String,
    payment_terms_days UInt8,
    factoring_eligible Bool,
    factoring_rate Decimal(5,4),
    trade_reference_id String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(invoice_date)
ORDER BY (invoice_date, supplier_id, buyer_id)
TTL toDate(invoice_date) + INTERVAL 7 YEARS;

-- Logistics performance data
CREATE TABLE IF NOT EXISTS logistics_performance (
    id UInt64,
    route_id String,
    origin_port String,
    destination_port String,
    carrier_name String,
    transport_mode String,
    scheduled_departure DateTime,
    actual_departure DateTime,
    scheduled_arrival DateTime,
    actual_arrival DateTime,
    delay_hours Int32,
    container_count UInt16,
    cargo_value_usd UInt64,
    on_time_delivery Bool,
    damage_incidents UInt8,
    customs_clearance_time_hours UInt16,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(scheduled_departure)
ORDER BY (scheduled_departure, route_id)
TTL toDate(scheduled_departure) + INTERVAL 3 YEARS;

-- Compliance monitoring
CREATE TABLE IF NOT EXISTS compliance_events (
    event_id UInt64,
    supplier_id UInt64,
    event_type String,
    severity String,
    description String,
    sanction_list_match Bool,
    risk_score_change Int8,
    remediation_required Bool,
    remediation_deadline Date,
    status String,
    created_at DateTime DEFAULT now(),
    resolved_at DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (created_at, supplier_id, severity)
TTL toDate(created_at) + INTERVAL 7 YEARS;

-- ML model predictions
CREATE TABLE IF NOT EXISTS ml_predictions (
    prediction_id UInt64,
    model_type String,
    entity_id UInt64,
    entity_type String,
    prediction_score Decimal(5,4),
    confidence_level Decimal(5,4),
    prediction_date DateTime,
    features_used String,
    actual_outcome String,
    outcome_date DateTime,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(prediction_date)
ORDER BY (prediction_date, model_type, entity_id)
TTL toDate(prediction_date) + INTERVAL 5 YEARS;

-- Trade finance deals
CREATE TABLE IF NOT EXISTS trade_finance_deals (
    deal_id String,
    deal_type String,
    supplier_id UInt64,
    buyer_id UInt64,
    financier_id UInt64,
    deal_amount_usd UInt64,
    advance_rate Decimal(5,4),
    interest_rate Decimal(5,4),
    tenor_days UInt16,
    collateral_type String,
    risk_rating String,
    status String,
    origination_date Date,
    maturity_date Date,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(origination_date)
ORDER BY (origination_date, supplier_id, deal_type)
TTL toDate(origination_date) + INTERVAL 10 YEARS;

-- Market data
CREATE TABLE IF NOT EXISTS market_data (
    data_id UInt64,
    data_type String,
    region String,
    indicator_name String,
    indicator_value Decimal(12,4),
    unit String,
    frequency String,
    data_date Date,
    source String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(data_date)
ORDER BY (data_date, region, indicator_name)
TTL toDate(data_date) + INTERVAL 5 YEARS;

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS trade_flows_daily_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, origin_country, destination_country)
AS SELECT
    toDate(timestamp) as date,
    origin_country,
    destination_country,
    sum(trade_value_usd) as total_value_usd,
    sum(trade_volume_tons) as total_volume_tons,
    count() as transaction_count
FROM trade_flows
GROUP BY date, origin_country, destination_country;

-- Insert sample data for demo purposes
INSERT INTO suppliers VALUES
(1, 'Global Trade Solutions Ltd', 'China', 'Manufacturing', 'Large', 'AA', 500000000, 15, 'Compliant', 'Verified', 'Clear', true, '2024-01-15', 25, now(), now()),
(2, 'Pacific Rim Exports', 'Vietnam', 'Textiles', 'Medium', 'A', 120000000, 8, 'Compliant', 'Verified', 'Clear', true, '2024-02-01', 35, now(), now()),
(3, 'African Commodities Corp', 'South Africa', 'Mining', 'Large', 'BBB', 800000000, 20, 'Compliant', 'Verified', 'Clear', true, '2024-01-20', 45, now(), now()),
(4, 'Latin American Foods', 'Brazil', 'Agriculture', 'Medium', 'A', 150000000, 12, 'Compliant', 'Verified', 'Clear', true, '2024-03-01', 30, now(), now()),
(5, 'European Machinery GmbH', 'Germany', 'Industrial', 'Large', 'AAA', 1200000000, 25, 'Compliant', 'Verified', 'Clear', true, '2024-01-10', 15, now(), now());

INSERT INTO trade_flows VALUES
(1, now(), 'China', 'USA', 25000000, 1500, 'Electronics', 1, 101, 'LC', 'FOB', 'Sea', 'Maersk', 3, now()),
(2, now() - INTERVAL 1 DAY, 'Vietnam', 'EU', 8500000, 800, 'Textiles', 2, 102, 'DP', 'CIF', 'Air', 'DHL', 1, now()),
(3, now() - INTERVAL 2 DAY, 'South Africa', 'China', 45000000, 25000, 'Minerals', 3, 103, 'LC', 'DDP', 'Sea', 'MSC', 5, now()),
(4, now() - INTERVAL 3 DAY, 'Brazil', 'USA', 12000000, 5000, 'Food', 4, 104, 'TT', 'FOB', 'Sea', 'Hapag-Lloyd', 4, now()),
(5, now() - INTERVAL 4 DAY, 'Germany', 'India', 35000000, 1200, 'Machinery', 5, 105, 'LC', 'CIP', 'Air', 'Lufthansa', 2, now());

-- Insert sample market data
INSERT INTO market_data VALUES
(1, 'economic', 'Global', 'USD/CNY', 7.25, 'currency', 'daily', today(), 'Bloomberg', now()),
(2, 'economic', 'Global', 'WTI Oil', 78.50, 'USD/barrel', 'daily', today(), 'EIA', now()),
(3, 'trade', 'China', 'Export Volume', 2850000000000, 'USD', 'monthly', '2024-01-01', 'China Customs', now()),
(4, 'logistics', 'Global', 'Container Rates', 2200, 'USD/40ft', 'weekly', today(), 'Drewry', now());
