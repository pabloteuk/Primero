import express from 'express'
import {
  getTradeFlows,
  getInsights,
  getCompanies,
  getIndicators,
  getCountries,
  getProducts,
  getAnalytics,
  search,
  getOpportunities,
  getRisks,
  getSupplyChain,
  getTradeMapDashboard
} from '../services/trademapService.js'

const router = express.Router()

// GET /api/trademap/trade-flows - Get trade flows data
router.get('/trade-flows', async (req, res) => {
  try {
    const { country, partner, product, year, month, limit = 100 } = req.query
    const params = {
      country,
      partner,
      product,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      limit: parseInt(limit)
    }

    const data = await getTradeFlows(params)

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching trade flows:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trade flows',
      message: error.message
    })
  }
})

// GET /api/trademap/insights - Get market insights
router.get('/insights', async (req, res) => {
  try {
    const { type, country, product, limit = 10 } = req.query
    const insights = await getInsights({
      type,
      country,
      product,
      limit: parseInt(limit)
    })

    res.json({
      success: true,
      data: insights,
      count: insights.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights',
      message: error.message
    })
  }
})

// GET /api/trademap/companies - Get company directory
router.get('/companies', async (req, res) => {
  try {
    const { country, sector, minRevenue, limit = 50 } = req.query
    const companies = await getCompanies({
      country,
      sector,
      minRevenue: minRevenue ? parseInt(minRevenue) : undefined,
      limit: parseInt(limit)
    })

    res.json({
      success: true,
      data: companies,
      count: companies.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies',
      message: error.message
    })
  }
})

// GET /api/trademap/indicators - Get trade indicators
router.get('/indicators', async (req, res) => {
  try {
    const { country, product, year, metric } = req.query
    const indicators = await getIndicators({
      country,
      product,
      year: year ? parseInt(year) : undefined,
      metric
    })

    res.json({
      success: true,
      data: indicators,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching indicators:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch indicators',
      message: error.message
    })
  }
})

// GET /api/trademap/countries - Get country data
router.get('/countries', async (req, res) => {
  try {
    const countries = await getCountries()

    res.json({
      success: true,
      data: countries,
      count: countries.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching countries:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch countries',
      message: error.message
    })
  }
})

// GET /api/trademap/products - Get product classifications
router.get('/products', async (req, res) => {
  try {
    const products = await getProducts()

    res.json({
      success: true,
      data: products,
      count: products.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    })
  }
})

// GET /api/trademap/analytics - Get trade analytics
router.get('/analytics', async (req, res) => {
  try {
    const { country, product, year, type } = req.query
    const analytics = await getAnalytics({
      country,
      product,
      year: year ? parseInt(year) : undefined,
      type
    })

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    })
  }
})

// GET /api/trademap/search - Search trade data
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query
    const results = await search(q, type, parseInt(limit))

    res.json({
      success: true,
      data: results,
      query: q,
      type,
      count: results.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error searching:', error)
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    })
  }
})

// GET /api/trademap/opportunities - Get market opportunities
router.get('/opportunities', async (req, res) => {
  try {
    const { sector, minValue, maxRisk, limit = 10 } = req.query
    const opportunities = await getOpportunities({
      sector,
      minValue: minValue ? parseInt(minValue) : undefined,
      maxRisk,
      limit: parseInt(limit)
    })

    res.json({
      success: true,
      data: opportunities,
      count: opportunities.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities',
      message: error.message
    })
  }
})

// GET /api/trademap/risks - Get risk assessments
router.get('/risks', async (req, res) => {
  try {
    const { country, product, threshold = 0.7 } = req.query
    const risks = await getRisks({
      country,
      product,
      threshold: parseFloat(threshold)
    })

    res.json({
      success: true,
      data: risks,
      threshold,
      count: risks.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching risks:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risks',
      message: error.message
    })
  }
})

// GET /api/trademap/supply-chain - Get supply chain analysis
router.get('/supply-chain', async (req, res) => {
  try {
    const { country, product } = req.query

    if (!country || !product) {
      return res.status(400).json({
        success: false,
        error: 'Country and product parameters are required'
      })
    }

    const analysis = await getSupplyChain(country, product)

    res.json({
      success: true,
      data: analysis,
      country,
      product,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing supply chain:', error)
    res.status(500).json({
      success: false,
      error: 'Supply chain analysis failed',
      message: error.message
    })
  }
})

export default router
