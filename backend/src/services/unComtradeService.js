import axios from 'axios'

// UN Comtrade API Configuration
const UN_COMTRADE_CONFIG = {
  primaryKey: '981ae9857dcd4788aada12fcdba5c8da',
  secondaryKey: '14aaf0a676fe40fa98772d42eee702a7',
  baseUrl: 'https://comtradeapi.un.org'
}

// Simple ClickHouse HTTP client
const clickhouseConfig = {
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: 'primero'
}

class SimpleClickHouseClient {
  async exec({ query }) {
    const url = `${clickhouseConfig.url}/?database=${clickhouseConfig.database}&user=${clickhouseConfig.username}&password=${clickhouseConfig.password}`
    const response = await axios.post(url, query, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    return response.data
  }

  async insert(table, data) {
    if (!Array.isArray(data) || data.length === 0) return

    // Convert data to TSV format for ClickHouse
    const headers = Object.keys(data[0])
    const tsvData = data.map(row =>
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return '\\N'
        if (typeof value === 'string') return value.replace(/\t/g, '\\t').replace(/\n/g, '\\n')
        return String(value)
      }).join('\t')
    ).join('\n')

    const query = `INSERT INTO ${table} (${headers.join(',')}) FORMAT TSV\n${tsvData}`
    return this.exec({ query })
  }

  async query({ query, format = 'JSON' }) {
    const url = `${clickhouseConfig.url}/?database=${clickhouseConfig.database}&user=${clickhouseConfig.username}&password=${clickhouseConfig.password}&default_format=${format}`
    const response = await axios.post(url, query, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })

    if (format === 'JSON') {
      // Parse JSON response
      const lines = response.data.trim().split('\n')
      const data = lines.map(line => JSON.parse(line))
      return { result_rows: data }
    }

    return response.data
  }
}

const clickhouseClient = new SimpleClickHouseClient()

// Initialize ClickHouse tables if they don't exist
async function initializeTables() {
  try {
    await clickhouseClient.exec({
      query: `
        CREATE TABLE IF NOT EXISTS un_comtrade_trade_data (
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
      `
    })

    await clickhouseClient.exec({
      query: `
        CREATE TABLE IF NOT EXISTS un_comtrade_metadata (
          id UInt64,
          type_code String,
          freq_code String,
          cl_code String,
          period String,
          reporter_code String,
          reporter_desc String,
          publication_date Date,
          dataset_code String,
          dataset_desc String,
          archive_path String,
          created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (period, reporter_code, dataset_code)
        PARTITION BY toYYYYMM(publication_date)
      `
    })

    console.log('✅ UN Comtrade tables initialized')
  } catch (error) {
    console.error('❌ Failed to initialize UN Comtrade tables:', error.message)
  }
}

// Get data availability (using the main data endpoint with limit 1)
async function getDataAvailability(params = {}) {
  try {
    const {
      typeCode = 'C',
      freqCode = 'A',
      clCode = 'HS',
      period = '2022',
      reporterCode = '842' // USA
    } = params

    const url = `${UN_COMTRADE_CONFIG.baseUrl}/data/v1/get/${typeCode}/${freqCode}/${clCode}`

    const response = await axios.get(url, {
      params: {
        reporterCode,
        period,
        maxRecords: 1,
        format: 'JSON'
      },
      timeout: 30000
    })

    return {
      success: true,
      data: response.data,
      count: response.data?.dataset?.length || 0,
      available: (response.data?.dataset?.length || 0) > 0
    }
  } catch (error) {
    console.error('❌ UN Comtrade data availability error:', error.message)
    return {
      success: false,
      error: error.message,
      available: false
    }
  }
}

// Preview final data (limited records)
async function previewFinalData(params = {}) {
  try {
    const {
      typeCode = 'C',
      freqCode = 'A',
      clCode = 'HS',
      period = '2022',
      reporterCode = '842', // USA
      cmdCode,
      flowCode,
      partnerCode,
      maxRecords = 10,
      includeDesc = true
    } = params

    const url = `${UN_COMTRADE_CONFIG.baseUrl}/data/v1/get/${typeCode}/${freqCode}/${clCode}`

    const queryParams = {
      reporterCode,
      period,
      maxRecords,
      format: 'JSON'
    }

    // Add optional parameters
    if (cmdCode) queryParams.cmdCode = cmdCode
    if (flowCode) queryParams.flowCode = flowCode
    if (partnerCode) queryParams.partnerCode = partnerCode
    if (includeDesc) queryParams.includeDesc = includeDesc

    const response = await axios.get(url, {
      params: queryParams,
      timeout: 60000
    })

    return {
      success: true,
      data: response.data,
      count: response.data?.dataset?.length || 0
    }
  } catch (error) {
    console.error('❌ UN Comtrade preview error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get final data (full dataset)
async function getFinalData(params = {}) {
  try {
    const {
      typeCode = 'C',
      freqCode = 'A',
      clCode = 'HS',
      period = '2022',
      reporterCode,
      cmdCode,
      flowCode,
      partnerCode,
      maxRecords = 10000, // Reduced from 250K for initial testing
      includeDesc = true
    } = params

    const url = `${UN_COMTRADE_CONFIG.baseUrl}/data/v1/get/${typeCode}/${freqCode}/${clCode}`

    const queryParams = {
      reporterCode,
      period,
      maxRecords,
      format: 'JSON'
    }

    // Add optional parameters
    if (cmdCode) queryParams.cmdCode = cmdCode
    if (flowCode) queryParams.flowCode = flowCode
    if (partnerCode) queryParams.partnerCode = partnerCode
    if (includeDesc) queryParams.includeDesc = includeDesc

    const response = await axios.get(url, {
      params: queryParams,
      timeout: 300000 // 5 minutes timeout for large requests
    })

    // Store data in ClickHouse
    if (response.data?.dataset && Array.isArray(response.data.dataset)) {
      await storeTradeData(response.data.dataset, 'final')
    }

    return {
      success: true,
      data: response.data,
      count: response.data?.dataset?.length || 0
    }
  } catch (error) {
    console.error('❌ UN Comtrade get final data error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Store trade data in ClickHouse
async function storeTradeData(dataset, dataType = 'final') {
  try {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      console.log('⚠️ No data to store')
      return
    }

    // Transform data for ClickHouse
    const transformedData = dataset.map((item, index) => ({
      id: Date.now() + index,
      type_code: item.typeCode || '',
      freq_code: item.freqCode || '',
      cl_code: item.clCode || '',
      period: item.period || '',
      reporter_code: item.reporterCode || '',
      reporter_desc: item.reporterDesc || '',
      reporter_iso: item.reporterISO || '',
      partner_code: item.partnerCode || '',
      partner_desc: item.partnerDesc || '',
      partner_iso: item.partnerISO || '',
      partner2_code: item.partner2Code || '',
      partner2_desc: item.partner2Desc || '',
      partner2_iso: item.partner2ISO || '',
      classification_code: item.classificationCode || '',
      classification_search_code: item.classificationSearchCode || '',
      is_leaf_code: item.isLeafCode === '1',
      trade_flow_code: item.tradeFlowCode || '',
      trade_flow_desc: item.tradeFlowDesc || '',
      customs_code: item.customsCode || '',
      customs_desc: item.customsDesc || '',
      mot_code: item.motCode || '',
      mot_desc: item.motDesc || '',
      qty_unit_code: item.qtyUnitCode || '',
      qty_unit_abbr: item.qtyUnitAbbr || '',
      qty: item.qty || '',
      alt_qty_unit_code: item.altQtyUnitCode || '',
      alt_qty_unit_abbr: item.altQtyUnitAbbr || '',
      alt_qty: item.altQty || '',
      net_wgt: item.netWgt || '',
      gross_wgt: item.grossWgt || '',
      trade_value_usd: parseInt(item.primaryValue || '0'),
      cif_value_usd: parseInt(item.cifvalue || '0'),
      fob_value_usd: parseInt(item.fobvalue || '0'),
      primary_value_usd: parseInt(item.primaryValue || '0'),
      legacy_estimation_flag: item.legacyEstimationFlag === '1',
      is_reported: item.isReported === '1',
      is_aggregate: item.isAggregate === '1',
      published_date: new Date().toISOString().split('T')[0],
      data_source: 'un_comtrade_api',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert data in batches
    const batchSize = 10000
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize)

      await clickhouseClient.insert({
        table: 'un_comtrade_trade_data',
        values: batch,
        format: 'JSONEachRow'
      })
    }

    console.log(`✅ Stored ${transformedData.length} UN Comtrade records in ClickHouse`)
  } catch (error) {
    console.error('❌ Failed to store UN Comtrade data:', error.message)
  }
}

// Get recent trade data for major countries
async function collectMajorCountriesData() {
  const majorCountries = [
    { code: '842', name: 'USA' },
    { code: '156', name: 'China' },
    { code: '392', name: 'Japan' },
    { code: '276', name: 'Germany' },
    { code: '724', name: 'Spain' },
    { code: '250', name: 'France' },
    { code: '826', name: 'UK' },
    { code: '410', name: 'South Korea' },
    { code: '36', name: 'Australia' },
    { code: '76', name: 'Brazil' }
  ]

  console.log('🌍 Starting UN Comtrade data collection for major countries...')

  for (const country of majorCountries) {
    try {
      console.log(`📊 Collecting data for ${country.name} (${country.code})...`)

      // Get 2022 and 2023 annual data
      for (const year of ['2022', '2023']) {
        const result = await getFinalData({
          typeCode: 'C',
          freqCode: 'A',
          clCode: 'HS',
          period: year,
          reporterCode: country.code,
          flowCode: 'X', // Exports
          maxRecords: 100000,
          includeDesc: true
        })

        if (result.success) {
          console.log(`✅ Collected ${result.count} export records for ${country.name} ${year}`)
        } else {
          console.log(`❌ Failed to collect export data for ${country.name} ${year}: ${result.error}`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`❌ Error collecting data for ${country.name}:`, error.message)
    }
  }

  console.log('✅ UN Comtrade data collection completed')
}

// Get trade statistics summary
async function getTradeStatistics(params = {}) {
  try {
    const { period = '2023', reporterCode } = params

    const query = `
      SELECT
        reporter_code,
        reporter_desc,
        partner_code,
        partner_desc,
        trade_flow_code,
        trade_flow_desc,
        sum(trade_value_usd) as total_value,
        sum(qty) as total_quantity,
        count(*) as record_count
      FROM un_comtrade_trade_data
      WHERE period = '${period}'
        ${reporterCode ? `AND reporter_code = '${reporterCode}'` : ''}
      GROUP BY reporter_code, reporter_desc, partner_code, partner_desc, trade_flow_code, trade_flow_desc
      ORDER BY total_value DESC
      LIMIT 1000
    `

    const result = await clickhouseClient.query({
      query,
      format: 'JSONEachRow'
    })

    const data = await result.json()
    return {
      success: true,
      data,
      count: data.length
    }
  } catch (error) {
    console.error('❌ Failed to get trade statistics:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

export {
  initializeTables,
  getDataAvailability,
  previewFinalData,
  getFinalData,
  collectMajorCountriesData,
  getTradeStatistics
}
