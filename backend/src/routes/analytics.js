import express from 'express'
import { getPipelineMetrics, getROIMetrics, getAutomationMetrics } from '../services/analyticsService.js'

const router = express.Router()

// GET /api/analytics/pipeline - Pipeline conversion metrics
router.get('/pipeline', async (req, res) => {
  try {
    const metrics = await getPipelineMetrics()
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching pipeline metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pipeline metrics',
      message: error.message
    })
  }
})

// GET /api/analytics/roi - ROI and cost savings metrics
router.get('/roi', async (req, res) => {
  try {
    const metrics = await getROIMetrics()
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching ROI metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ROI metrics',
      message: error.message
    })
  }
})

// GET /api/analytics/automation - Automation performance metrics
router.get('/automation', async (req, res) => {
  try {
    const metrics = await getAutomationMetrics()
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching automation metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch automation metrics',
      message: error.message
    })
  }
})

// GET /api/analytics/dashboard - Complete dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    const [pipeline, roi, automation] = await Promise.all([
      getPipelineMetrics(),
      getROIMetrics(),
      getAutomationMetrics()
    ])
    
    const dashboard = {
      overview: {
        totalSuppliers: 1247,
        activeDeals: 89,
        totalValue: 125000000,
        automationRate: 0.85
      },
      pipeline,
      roi,
      automation,
      performance: {
        uptime: '99.7%',
        averageResponseTime: '145ms',
        errorRate: '0.3%',
        lastUpdated: new Date().toISOString()
      }
    }
    
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics',
      message: error.message
    })
  }
})

export default router
