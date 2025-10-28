// Trade Map Service - Provides trade intelligence from ClickHouse data
// This service simulates real Trade Map data until ClickHouse is connected

// Mock Trade Map data based on real trade statistics
const mockCountries = [
  { id: 1, name: 'China', iso2: 'CN', iso3: 'CHN', region: 'Asia', data_available: true },
  { id: 2, name: 'United States', iso2: 'US', iso3: 'USA', region: 'Americas', data_available: true },
  { id: 3, name: 'Germany', iso2: 'DE', iso3: 'DEU', region: 'Europe', data_available: true },
  { id: 4, name: 'Japan', iso2: 'JP', iso3: 'JPN', region: 'Asia', data_available: true },
  { id: 5, name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', region: 'Europe', data_available: true },
  { id: 6, name: 'South Korea', iso2: 'KR', iso3: 'KOR', region: 'Asia', data_available: true },
  { id: 7, name: 'Netherlands', iso2: 'NL', iso3: 'NLD', region: 'Europe', data_available: true },
  { id: 8, name: 'France', iso2: 'FR', iso3: 'FRA', region: 'Europe', data_available: true }
]

const mockProducts = [
  { code: '85', name: 'Electrical machinery and equipment', category: 'Electronics', hs_level: 2 },
  { code: '84', name: 'Nuclear reactors, boilers, machinery', category: 'Machinery', hs_level: 2 },
  { code: '87', name: 'Vehicles other than railway', category: 'Vehicles', hs_level: 2 },
  { code: '39', name: 'Plastics and articles thereof', category: 'Chemicals', hs_level: 2 },
  { code: '30', name: 'Pharmaceutical products', category: 'Pharmaceuticals', hs_level: 2 },
  { code: '71', name: 'Natural or cultured pearls, precious stones', category: 'Jewelry', hs_level: 2 }
]

const mockTradeFlows = [
  {
    reporter_country: 'China',
    partner_country: 'United States',
    product_code: '85',
    product_name: 'Phones',
    year: 2024,
    month: 9,
    trade_value_usd: 2850000000,
    trade_quantity: 15000000,
    quantity_unit: 'units',
    growth_rate: 12.3
  },
  {
    reporter_country: 'Germany',
    partner_country: 'China',
    product_code: '87',
    product_name: 'Motor Cars',
    year: 2024,
    month: 9,
    trade_value_usd: 1250000000,
    trade_quantity: 45000,
    quantity_unit: 'units',
    growth_rate: 16.0
  },
  {
    reporter_country: 'Japan',
    partner_country: 'United States',
    product_code: '84',
    product_name: 'Engines',
    year: 2024,
    month: 9,
    trade_value_usd: 980000000,
    trade_quantity: 250000,
    quantity_unit: 'units',
    growth_rate: 8.7
  }
]

const mockCompanies = [
  {
    id: 1,
    name: 'Huawei Technologies Co., Ltd.',
    country: 'China',
    sector: 'Telecommunications',
    annual_revenue: 100000000000,
    employee_count: 195000,
    risk_score: 25,
    compliance_status: 'Compliant'
  },
  {
    id: 2,
    name: 'Volkswagen AG',
    country: 'Germany',
    sector: 'Automotive',
    annual_revenue: 295000000000,
    employee_count: 670000,
    risk_score: 15,
    compliance_status: 'Compliant'
  },
  {
    id: 3,
    name: 'Sony Corporation',
    country: 'Japan',
    sector: 'Electronics',
    annual_revenue: 85000000000,
    employee_count: 109700,
    risk_score: 20,
    compliance_status: 'Compliant'
  }
]

// Trade Map Service Functions

export async function getTradeFlows(params = {}) {
  try {
    let data = [...mockTradeFlows]

    // Apply filters
    if (params.country) {
      data = data.filter(item => item.reporter_country === params.country)
    }
    if (params.partner) {
      data = data.filter(item => item.partner_country === params.partner)
    }
    if (params.product) {
      data = data.filter(item => item.product_code === params.product)
    }
    if (params.year) {
      data = data.filter(item => item.year === params.year)
    }
    if (params.month) {
      data = data.filter(item => item.month === params.month)
    }

    // Apply limit
    if (params.limit) {
      data = data.slice(0, params.limit)
    }

    return data
  } catch (error) {
    console.error('Error in getTradeFlows:', error)
    throw error
  }
}

export async function getInsights(params = {}) {
  try {
    const insights = [
      {
        id: 1,
        type: 'opportunity',
        title: 'Electronics Boom in Southeast Asia',
        description: 'Vietnam and Thailand showing 28%+ CAGR in electronics imports',
        impact: 'High',
        confidence: 92,
        value_potential: 2100000000,
        countries: ['Vietnam', 'Thailand', 'Indonesia'],
        products: ['85', '8541'],
        generated_at: new Date().toISOString()
      },
      {
        type: 'risk',
        title: 'Supply Chain Disruption Alert',
        description: 'German automotive exports to China showing volatility',
        impact: 'Medium',
        confidence: 87,
        risk_level: 'Medium-High',
        affected_countries: ['Germany', 'China'],
        mitigation: 'Diversify export markets',
        generated_at: new Date().toISOString()
      },
      {
        type: 'trend',
        title: 'EV Battery Materials Surge',
        description: 'Lithium-ion battery exports growing 312% YoY',
        impact: 'High',
        confidence: 95,
        growth_rate: 312,
        key_markets: ['China', 'South Korea', 'Japan'],
        opportunity_value: 420000000,
        generated_at: new Date().toISOString()
      }
    ]

    let filtered = insights

    if (params.type) {
      filtered = filtered.filter(item => item.type === params.type)
    }
    if (params.country) {
      filtered = filtered.filter(item =>
        item.countries?.includes(params.country) ||
        item.affected_countries?.includes(params.country) ||
        item.key_markets?.includes(params.country)
      )
    }
    if (params.product) {
      filtered = filtered.filter(item =>
        item.products?.includes(params.product)
      )
    }

    if (params.limit) {
      filtered = filtered.slice(0, params.limit)
    }

    return filtered
  } catch (error) {
    console.error('Error in getInsights:', error)
    throw error
  }
}

export async function getCompanies(params = {}) {
  try {
    let data = [...mockCompanies]

    if (params.country) {
      data = data.filter(item => item.country === params.country)
    }
    if (params.sector) {
      data = data.filter(item => item.sector.toLowerCase().includes(params.sector.toLowerCase()))
    }
    if (params.minRevenue) {
      data = data.filter(item => item.annual_revenue >= params.minRevenue)
    }

    if (params.limit) {
      data = data.slice(0, params.limit)
    }

    return data
  } catch (error) {
    console.error('Error in getCompanies:', error)
    throw error
  }
}

export async function getIndicators(params = {}) {
  try {
    const indicators = [
      {
        country: 'China',
        product: '85',
        year: 2024,
        market_share: 56.1,
        growth_rate: 12.3,
        export_value: 2850000000,
        import_value: 450000000,
        trade_balance: 2400000000
      },
      {
        country: 'Germany',
        product: '87',
        year: 2024,
        market_share: 24.6,
        growth_rate: 16.0,
        export_value: 1250000000,
        import_value: 890000000,
        trade_balance: 360000000
      },
      {
        country: 'Japan',
        product: '84',
        year: 2024,
        market_share: 19.3,
        growth_rate: 8.7,
        export_value: 980000000,
        import_value: 650000000,
        trade_balance: 330000000
      }
    ]

    let filtered = indicators

    if (params.country) {
      filtered = filtered.filter(item => item.country === params.country)
    }
    if (params.product) {
      filtered = filtered.filter(item => item.product === params.product)
    }
    if (params.year) {
      filtered = filtered.filter(item => item.year === params.year)
    }

    return filtered
  } catch (error) {
    console.error('Error in getIndicators:', error)
    throw error
  }
}

export async function getCountries() {
  return mockCountries
}

export async function getProducts() {
  return mockProducts
}

export async function getAnalytics(params = {}) {
  try {
    const analytics = {
      total_trade_value: 5080000000,
      total_countries: 8,
      total_products: 6,
      top_exporters: [
        { country: 'China', value: 2850000000, share: 56.1 },
        { country: 'Germany', value: 1250000000, share: 24.6 },
        { country: 'Japan', value: 980000000, share: 19.3 }
      ],
      top_products: [
        { code: '85', name: 'Electronics', value: 2850000000 },
        { code: '87', name: 'Vehicles', value: 1250000000 },
        { code: '84', name: 'Machinery', value: 980000000 }
      ],
      growth_trends: [
        { period: '2024-Q3', value: 5080000000, growth: 17.5 },
        { period: '2024-Q2', value: 4320000000, growth: 14.2 },
        { period: '2024-Q1', value: 3780000000, growth: 11.8 }
      ],
      regional_breakdown: {
        Asia: { value: 3830000000, share: 75.4 },
        Europe: { value: 980000000, share: 19.3 },
        Americas: { value: 270000000, share: 5.3 }
      }
    }

    return analytics
  } catch (error) {
    console.error('Error in getAnalytics:', error)
    throw error
  }
}

export async function search(query, type = 'all', limit = 20) {
  try {
    const results = []

    if (type === 'all' || type === 'countries') {
      const countryResults = mockCountries.filter(country =>
        country.name.toLowerCase().includes(query.toLowerCase())
      ).map(country => ({
        id: country.id,
        type: 'country',
        name: country.name,
        code: country.iso3,
        region: country.region
      }))
      results.push(...countryResults.slice(0, limit))
    }

    if (type === 'all' || type === 'products') {
      const productResults = mockProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.code.includes(query)
      ).map(product => ({
        id: product.code,
        type: 'product',
        name: product.name,
        code: product.code,
        category: product.category
      }))
      results.push(...productResults.slice(0, limit - results.length))
    }

    if (type === 'all' || type === 'companies') {
      const companyResults = mockCompanies.filter(company =>
        company.name.toLowerCase().includes(query.toLowerCase())
      ).map(company => ({
        id: company.id,
        type: 'company',
        name: company.name,
        country: company.country,
        sector: company.sector
      }))
      results.push(...companyResults.slice(0, limit - results.length))
    }

    return results.slice(0, limit)
  } catch (error) {
    console.error('Error in search:', error)
    throw error
  }
}

export async function getOpportunities(params = {}) {
  try {
    const opportunities = [
      {
        id: 1,
        title: 'Vietnam Electronics Hub',
        sector: 'Electronics',
        country: 'Vietnam',
        value_potential: 2100000000,
        growth_rate: 28.4,
        risk_level: 'Low',
        confidence: 94,
        description: 'Vietnam showing explosive growth in electronics manufacturing'
      },
      {
        id: 2,
        title: 'India Semiconductor Valley',
        sector: 'Semiconductors',
        country: 'India',
        value_potential: 890000000,
        growth_rate: 45.2,
        risk_level: 'Medium',
        confidence: 89,
        description: 'Government incentives driving semiconductor investment'
      },
      {
        id: 3,
        title: 'Mexico Nearshoring Boom',
        sector: 'Manufacturing',
        country: 'Mexico',
        value_potential: 650000000,
        growth_rate: 156,
        risk_level: 'Low',
        confidence: 91,
        description: 'USMCA benefits creating manufacturing opportunities'
      }
    ]

    let filtered = opportunities

    if (params.sector) {
      filtered = filtered.filter(item => item.sector.toLowerCase().includes(params.sector.toLowerCase()))
    }
    if (params.minValue) {
      filtered = filtered.filter(item => item.value_potential >= params.minValue)
    }
    if (params.maxRisk && params.maxRisk !== 'all') {
      const riskLevels = { 'low': 1, 'medium': 2, 'high': 3 }
      const maxRiskLevel = riskLevels[params.maxRisk.toLowerCase()] || 3
      filtered = filtered.filter(item => riskLevels[item.risk_level.toLowerCase()] <= maxRiskLevel)
    }

    if (params.limit) {
      filtered = filtered.slice(0, params.limit)
    }

    return filtered
  } catch (error) {
    console.error('Error in getOpportunities:', error)
    throw error
  }
}

export async function getRisks(params = {}) {
  try {
    const risks = [
      {
        id: 1,
        country: 'Germany',
        product: '87',
        risk_type: 'Market Concentration',
        risk_level: 'High',
        description: '68% of automotive exports go to single market (China)',
        impact: 'Supply chain disruption',
        probability: 0.75,
        mitigation: 'Diversify export markets to US (25% target)',
        value_at_risk: 816000000
      },
      {
        id: 2,
        country: 'China',
        product: '85',
        risk_type: 'Trade Policy',
        risk_level: 'Medium',
        description: 'Potential tariffs on electronics exports',
        impact: 'Revenue reduction',
        probability: 0.45,
        mitigation: 'Strengthen domestic market presence',
        value_at_risk: 1282500000
      }
    ]

    let filtered = risks

    if (params.country) {
      filtered = filtered.filter(item => item.country === params.country)
    }
    if (params.product) {
      filtered = filtered.filter(item => item.product === params.product)
    }
    if (params.threshold) {
      filtered = filtered.filter(item => item.probability >= params.threshold)
    }

    return filtered
  } catch (error) {
    console.error('Error in getRisks:', error)
    throw error
  }
}

export async function getSupplyChain(country, product) {
  try {
    // Mock supply chain analysis
    const analysis = {
      country,
      product,
      supply_chain_score: 7.8,
      risk_level: 'Medium',
      key_suppliers: [
        { name: 'Supplier A', country: 'China', reliability: 0.92, capacity: 1000000 },
        { name: 'Supplier B', country: 'Germany', reliability: 0.88, capacity: 750000 },
        { name: 'Supplier C', country: 'Japan', reliability: 0.95, capacity: 500000 }
      ],
      alternative_sources: [
        { country: 'Vietnam', capacity: 800000, lead_time: 14, cost_premium: 0.05 },
        { country: 'Mexico', capacity: 600000, lead_time: 7, cost_premium: 0.08 },
        { country: 'India', capacity: 900000, lead_time: 21, cost_premium: 0.03 }
      ],
      recommendations: [
        'Diversify suppliers across 3+ countries',
        'Build strategic inventory for critical components',
        'Invest in local manufacturing capacity'
      ]
    }

    return analysis
  } catch (error) {
    console.error('Error in getSupplyChain:', error)
    throw error
  }
}

export async function getTradeMapDashboard() {
  try {
    const dashboard = {
      overview: {
        totalTradeValue: 5080000000,
        totalCountries: 8,
        totalProducts: 6,
        activeTradeRoutes: 24,
        lastUpdated: new Date().toISOString()
      },
      tradeFlows: await getTradeFlows({ limit: 5 }),
      insights: await getInsights({ limit: 3 }),
      opportunities: await getOpportunities({ limit: 3 }),
      risks: await getRisks(),
      analytics: await getAnalytics(),
      performance: {
        dataFreshness: 'Real-time',
        queryPerformance: '< 0.25s',
        uptime: '99.7%',
        dataQuality: '95%'
      }
    }

    return dashboard
  } catch (error) {
    console.error('Error in getTradeMapDashboard:', error)
    throw error
  }
}
