import express from 'express'
import {
  initializeTables,
  getDataAvailability,
  previewFinalData,
  getFinalData,
  collectMajorCountriesData,
  getTradeStatistics
} from '../services/unComtradeService.js'

const router = express.Router()

// Initialize ClickHouse tables
router.post('/initialize', async (req, res) => {
  try {
    await initializeTables()
    res.json({
      success: true,
      message: 'UN Comtrade tables initialized successfully'
    })
  } catch (error) {
    console.error('Error initializing tables:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to initialize tables',
      message: error.message
    })
  }
})

// Get data availability
router.get('/availability', async (req, res) => {
  try {
    const result = await getDataAvailability(req.query)
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error getting data availability:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get data availability',
      message: error.message
    })
  }
})

// Preview final data
router.get('/preview', async (req, res) => {
  try {
    const result = await previewFinalData(req.query)
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error previewing data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to preview data',
      message: error.message
    })
  }
})

// Get final data
router.get('/data', async (req, res) => {
  try {
    // Set longer timeout for large data requests
    req.setTimeout(300000) // 5 minutes

    const result = await getFinalData(req.query)
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error getting final data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get final data',
      message: error.message
    })
  }
})

// Collect major countries data
router.post('/collect-major-countries', async (req, res) => {
  try {
    // Start data collection in background
    collectMajorCountriesData().catch(error => {
      console.error('Background data collection failed:', error)
    })

    res.json({
      success: true,
      message: 'Data collection started for major countries. This may take several minutes.',
      status: 'running'
    })
  } catch (error) {
    console.error('Error starting data collection:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start data collection',
      message: error.message
    })
  }
})

// Get trade statistics
router.get('/statistics', async (req, res) => {
  try {
    const result = await getTradeStatistics(req.query)
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error getting trade statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get trade statistics',
      message: error.message
    })
  }
})

// Get collection status (placeholder for future implementation)
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    status: 'unknown',
    message: 'Collection status monitoring not yet implemented',
    lastUpdated: new Date().toISOString()
  })
})

export default router
