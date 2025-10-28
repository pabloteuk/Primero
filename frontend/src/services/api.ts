import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Origination API
export const originationAPI = {
  // Get AI-discovered suppliers
  getSuppliers: (params = {}) => 
    api.get('/origination/suppliers', { params }),
  
  // Score supplier potential
  scoreSupplier: (supplierId, criteria = {}) => 
    api.post('/origination/score', { supplierId, criteria }),
  
  // Extract document data
  extractDocument: (documentType, documentData) => 
    api.post('/origination/extract', { documentType, documentData }),
  
  // Get origination metrics
  getMetrics: () => 
    api.get('/origination/metrics')
}

// Compliance API
export const complianceAPI = {
  // Verify KYC/AML/UBO
  verifyCompliance: (supplierId, forceRefresh = false) => 
    api.get(`/compliance/verify/${supplierId}`, { 
      params: { forceRefresh } 
    }),
  
  // Get compliance status
  getStatus: (supplierId) => 
    api.get(`/compliance/status/${supplierId}`),
  
  // Get compliance metrics
  getMetrics: () => 
    api.get('/compliance/metrics'),
  
  // Bulk compliance verification
  bulkVerify: (supplierIds) => 
    api.post('/compliance/bulk-verify', { supplierIds })
}

// Receivables API
export const receivablesAPI = {
  // Analyze invoices
  analyzeInvoices: (invoices, analysisType = 'full') => 
    api.post('/receivables/analyze', { invoices, analysisType }),
  
  // Get invoice quality
  getQuality: (invoiceId, includeExplanation = true) => 
    api.get(`/receivables/quality/${invoiceId}`, { 
      params: { includeExplanation } 
    }),
  
  // Get receivables metrics
  getMetrics: () => 
    api.get('/receivables/metrics'),
  
  // Get portfolio analysis
  getPortfolio: (params = {}) => 
    api.get('/receivables/portfolio', { params })
}

// Matching API
export const matchingAPI = {
  // Match invoices to buyers
  matchBuyers: (invoices, preferences = {}) => 
    api.post('/matching/allocate', { invoices, preferences }),
  
  // Get buyer profiles
  getBuyers: (active = true) => 
    api.get('/matching/buyers', { params: { active } }),
  
  // Get matching metrics
  getMetrics: () => 
    api.get('/matching/metrics'),
  
  // Simulate allocation
  simulate: (invoices, buyerId) => 
    api.post('/matching/simulate', { invoices, buyerId })
}

// Analytics API
export const analyticsAPI = {
  // Get pipeline metrics
  getPipeline: () => 
    api.get('/analytics/pipeline'),
  
  // Get ROI metrics
  getROI: () => 
    api.get('/analytics/roi'),
  
  // Get automation metrics
  getAutomation: () => 
    api.get('/analytics/automation'),
  
  // Get complete dashboard
  getDashboard: () => 
    api.get('/analytics/dashboard')
}

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws/origination'
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 WebSocket message:', data)
          // Handle real-time updates here
        } catch (error) {
          console.error('❌ WebSocket message error:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }
    } catch (error) {
      console.error('❌ WebSocket connection error:', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ WebSocket not connected')
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }
}

// Export WebSocket service instance
export const wsService = new WebSocketService()

export default api
