import express from 'express'
import { analyzeInvoices, getInvoiceQuality, getReceivablesMetrics } from '../services/receivablesService.js'
import { validateRequest } from '../middleware/validator.js'

const router = express.Router()

// POST /api/receivables/analyze - Bulk invoice analysis
router.post('/analyze', validateRequest, async (req, res) => {
  try {
    const { invoices, analysisType = 'full' } = req.body
    
    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'invoices array is required'
      })
    }
    
    const results = await analyzeInvoices(invoices, analysisType)
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing invoices:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to analyze invoices',
      message: error.message
    })
  }
})

// GET /api/receivables/quality/:id - Get invoice quality score
router.get('/quality/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { includeExplanation = true } = req.query
    
    const quality = await getInvoiceQuality(id, includeExplanation === 'true')
    
    res.json({
      success: true,
      data: quality,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching invoice quality:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice quality',
      message: error.message
    })
  }
})

// GET /api/receivables/metrics - Receivables quality metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getReceivablesMetrics()
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching receivables metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receivables metrics',
      message: error.message
    })
  }
})

// GET /api/receivables/portfolio - Portfolio analysis
router.get('/portfolio', async (req, res) => {
  try {
    const { buyerId, region, industry } = req.query
    
    const portfolio = {
      totalInvoices: 500,
      totalValue: 125000000, // $125M
      averageQualityScore: 89.2,
      investmentGradeRate: 0.89,
      fraudDetectionRate: 0.987,
      defaultPredictionAccuracy: 0.92,
      diversification: {
        byRegion: [
          { region: 'Asia-Pacific', count: 223, value: 56000000, percentage: 45 },
          { region: 'Europe', count: 156, value: 39000000, percentage: 31 },
          { region: 'North America', count: 89, value: 22000000, percentage: 18 },
          { region: 'Latin America', count: 32, value: 8000000, percentage: 6 }
        ],
        byIndustry: [
          { industry: 'Manufacturing', count: 198, value: 49500000, percentage: 40 },
          { industry: 'Agriculture', count: 134, value: 33500000, percentage: 27 },
          { industry: 'Technology', count: 89, value: 22250000, percentage: 18 },
          { industry: 'Energy', count: 56, value: 14000000, percentage: 11 },
          { industry: 'Other', count: 23, value: 5750000, percentage: 4 }
        ]
      },
      riskMetrics: {
        averageCreditScore: 89.2,
        highRiskInvoices: 12,
        mediumRiskInvoices: 45,
        lowRiskInvoices: 443,
        expectedDefaultRate: 0.08,
        confidenceInterval: [0.06, 0.11]
      }
    }
    
    res.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching portfolio analysis:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio analysis',
      message: error.message
    })
  }
})

export default router
