import express from 'express'
import { ITCScraperService } from '../services/itcScraperService.js'

const router = express.Router()

// Initialize scraper service
let scraperService = null

const getScraperService = async () => {
  if (!scraperService) {
    scraperService = new ITCScraperService()
    await scraperService.initialize()
  }
  return scraperService
}

// Collect ITC data for major countries
router.post('/collect-major-countries', async (req, res) => {
  try {
    const scraper = await getScraperService()

    // Start data collection in background
    scraper.collectMajorCountriesData().then(results => {
      console.log('✅ ITC data collection completed in background')
    }).catch(error => {
      console.error('❌ ITC background collection failed:', error)
    })

    res.json({
      success: true,
      message: 'ITC data collection started. This may take several minutes.',
      status: 'running'
    })
  } catch (error) {
    console.error('Error starting ITC collection:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start ITC data collection',
      message: error.message
    })
  }
})

// Get stored ITC data
router.get('/data', async (req, res) => {
  try {
    const scraper = await getScraperService()
    const data = await scraper.getStoredITCData(req.query)

    res.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error getting ITC data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get ITC data',
      message: error.message
    })
  }
})

// Get ITC statistics
router.get('/statistics', async (req, res) => {
  try {
    const scraper = await getScraperService()
    const stats = await scraper.getITCStatistics()

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting ITC statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get ITC statistics',
      message: error.message
    })
  }
})

// Extract data for specific country
router.post('/extract-country/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params
    const { year = 2023 } = req.query

    const scraper = await getScraperService()
    const data = await scraper.extractCountryData(countryCode, parseInt(year))

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error(`Error extracting ITC data for country ${req.params.countryCode}:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to extract country data',
      message: error.message
    })
  }
})

// Get collection status
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    status: 'unknown',
    message: 'ITC scraper status monitoring not yet implemented',
    lastUpdated: new Date().toISOString()
  })
})

// Cleanup scraper resources
router.post('/cleanup', async (req, res) => {
  try {
    if (scraperService) {
      await scraperService.close()
      scraperService = null
    }

    res.json({
      success: true,
      message: 'ITC scraper resources cleaned up'
    })
  } catch (error) {
    console.error('Error cleaning up ITC scraper:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup ITC scraper',
      message: error.message
    })
  }
})

export default router
