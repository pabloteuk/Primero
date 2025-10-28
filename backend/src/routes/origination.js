import express from 'express'
import { getSuppliers, scoreSupplier, extractDocumentData } from '../services/originationService.js'
import { validateRequest } from '../middleware/validator.js'

const router = express.Router()

// GET /api/origination/suppliers - AI-discovered leads
router.get('/suppliers', async (req, res) => {
  try {
    const { page = 1, limit = 50, region, industry, minVolume } = req.query
    
    const suppliers = await getSuppliers({
      page: parseInt(page),
      limit: parseInt(limit),
      region,
      industry,
      minVolume: minVolume ? parseFloat(minVolume) : undefined
    })
    
    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: suppliers.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suppliers',
      message: error.message
    })
  }
})

// POST /api/origination/score - Score supplier potential
router.post('/score', validateRequest, async (req, res) => {
  try {
    const { supplierId, criteria } = req.body
    
    if (!supplierId) {
      return res.status(400).json({
        success: false,
        error: 'supplierId is required'
      })
    }
    
    const score = await scoreSupplier(supplierId, criteria)
    
    res.json({
      success: true,
      data: score,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error scoring supplier:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to score supplier',
      message: error.message
    })
  }
})

// POST /api/origination/extract - Document intelligence
router.post('/extract', validateRequest, async (req, res) => {
  try {
    const { documentType, documentData } = req.body
    
    if (!documentType || !documentData) {
      return res.status(400).json({
        success: false,
        error: 'documentType and documentData are required'
      })
    }
    
    const extractedData = await extractDocumentData(documentType, documentData)
    
    res.json({
      success: true,
      data: extractedData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error extracting document data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to extract document data',
      message: error.message
    })
  }
})

// GET /api/origination/metrics - Origination pipeline metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      totalSuppliers: 1247,
      discoveredThisMonth: 156,
      averageScore: 78.5,
      conversionRate: 0.27,
      automationRate: 0.85,
      averageProcessingTime: '2.3 days',
      topRegions: [
        { region: 'Asia-Pacific', count: 523, percentage: 42 },
        { region: 'Europe', count: 312, percentage: 25 },
        { region: 'North America', count: 234, percentage: 19 },
        { region: 'Latin America', count: 178, percentage: 14 }
      ],
      topIndustries: [
        { industry: 'Manufacturing', count: 445, percentage: 36 },
        { industry: 'Agriculture', count: 234, percentage: 19 },
        { industry: 'Technology', count: 198, percentage: 16 },
        { industry: 'Energy', count: 156, percentage: 12 },
        { industry: 'Other', count: 214, percentage: 17 }
      ]
    }
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching origination metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message
    })
  }
})

export default router
