import express from 'express'
import { matchBuyers, getBuyerProfiles, getMatchingMetrics } from '../services/matchingService.js'
import { validateRequest } from '../middleware/validator.js'

const router = express.Router()

// POST /api/matching/allocate - Match invoices to buyers
router.post('/allocate', validateRequest, async (req, res) => {
  try {
    const { invoices, preferences } = req.body
    
    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'invoices array is required'
      })
    }
    
    const allocation = await matchBuyers(invoices, preferences)
    
    res.json({
      success: true,
      data: allocation,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error matching buyers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to match buyers',
      message: error.message
    })
  }
})

// GET /api/matching/buyers - Get institutional buyer profiles
router.get('/buyers', async (req, res) => {
  try {
    const { active = true } = req.query
    
    const buyers = await getBuyerProfiles(active === 'true')
    
    res.json({
      success: true,
      data: buyers,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching buyer profiles:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyer profiles',
      message: error.message
    })
  }
})

// GET /api/matching/metrics - Matching performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getMatchingMetrics()
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching matching metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matching metrics',
      message: error.message
    })
  }
})

// POST /api/matching/simulate - Simulate allocation without saving
router.post('/simulate', validateRequest, async (req, res) => {
  try {
    const { invoices, buyerId } = req.body
    
    if (!Array.isArray(invoices) || !buyerId) {
      return res.status(400).json({
        success: false,
        error: 'invoices array and buyerId are required'
      })
    }
    
    const simulation = {
      buyerId,
      totalInvoices: invoices.length,
      totalValue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      matchScore: 89.2,
      diversificationScore: 78.5,
      riskScore: 12.3,
      expectedReturn: 8.7,
      allocation: invoices.map(invoice => ({
        invoiceId: invoice.id,
        amount: invoice.amount,
        qualityScore: invoice.qualityScore,
        matchReason: 'High quality score and geographic preference match',
        confidence: 0.92
      })),
      recommendations: [
        'Consider adding more European invoices for better diversification',
        'Current allocation meets 89% of buyer criteria',
        'Risk level is within acceptable range'
      ]
    }
    
    res.json({
      success: true,
      data: simulation,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error simulating allocation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to simulate allocation',
      message: error.message
    })
  }
})

export default router
