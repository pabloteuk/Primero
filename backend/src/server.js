import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import compression from 'compression'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'

// Import routes
import originationRoutes from './routes/origination.js'
import complianceRoutes from './routes/compliance.js'
import receivablesRoutes from './routes/receivables.js'
import matchingRoutes from './routes/matching.js'
import analyticsRoutes from './routes/analytics.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { validateRequest } from './middleware/validator.js'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Body parsing and compression
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
app.use(morgan('combined'))

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Vabble Origination API',
    description: 'AI-powered trade finance origination automation API',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      origination: {
        suppliers: '/api/origination/suppliers',
        score: '/api/origination/score',
        extract: '/api/origination/extract',
        metrics: '/api/origination/metrics'
      },
      compliance: {
        verify: '/api/compliance/verify/:supplierId',
        status: '/api/compliance/status/:supplierId',
        metrics: '/api/compliance/metrics',
        'bulk-verify': '/api/compliance/bulk-verify'
      },
      receivables: {
        analyze: '/api/receivables/analyze',
        quality: '/api/receivables/quality/:invoiceId',
        metrics: '/api/receivables/metrics',
        portfolio: '/api/receivables/portfolio'
      },
      matching: {
        allocate: '/api/matching/allocate',
        buyers: '/api/matching/buyers',
        metrics: '/api/matching/metrics',
        simulate: '/api/matching/simulate'
      },
      analytics: {
        pipeline: '/api/analytics/pipeline',
        roi: '/api/analytics/roi',
        automation: '/api/analytics/automation',
        dashboard: '/api/analytics/dashboard'
      }
    },
    websocket: {
      origination: 'ws://localhost:3001/ws/origination'
    },
    documentation: 'See API documentation for detailed usage',
    timestamp: new Date().toISOString()
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use('/api/origination', originationRoutes)
app.use('/api/compliance', complianceRoutes)
app.use('/api/receivables', receivablesRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/analytics', analyticsRoutes)

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws/origination' })

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established')
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      console.log('Received WebSocket message:', data)
      
      // Echo back with timestamp
      ws.send(JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        status: 'received'
      }))
    } catch (error) {
      console.error('WebSocket message error:', error)
      ws.send(JSON.stringify({ error: 'Invalid message format' }))
    }
  })
  
  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Vabble Origination API',
    timestamp: new Date().toISOString()
  }))
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Vabble Origination API running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws/origination`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export { app, server, wss }
