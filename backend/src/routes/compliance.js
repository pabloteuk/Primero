import express from 'express'
import { verifyCompliance, getComplianceStatus, getComplianceMetrics } from '../services/complianceService.js'
import { validateRequest } from '../middleware/validator.js'

const router = express.Router()

// GET /api/compliance/verify/:id - KYC/AML/UBO check
router.get('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { forceRefresh = false } = req.query
    
    const result = await verifyCompliance(id, forceRefresh === 'true')
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error verifying compliance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to verify compliance',
      message: error.message
    })
  }
})

// GET /api/compliance/status/:id - Get compliance status
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const status = await getComplianceStatus(id)
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching compliance status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compliance status',
      message: error.message
    })
  }
})

// GET /api/compliance/metrics - Compliance metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getComplianceMetrics()
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching compliance metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compliance metrics',
      message: error.message
    })
  }
})

// POST /api/compliance/bulk-verify - Bulk compliance verification
router.post('/bulk-verify', validateRequest, async (req, res) => {
  try {
    const { supplierIds } = req.body
    
    if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'supplierIds array is required'
      })
    }
    
    const results = await Promise.all(
      supplierIds.map(id => verifyCompliance(id))
    )
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error bulk verifying compliance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to bulk verify compliance',
      message: error.message
    })
  }
})

export default router
