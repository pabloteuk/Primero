import axios from 'axios'

// Types for API parameters
type SupplierId = string | number
type DocumentType = string
type DocumentData = any
type SupplierIds = SupplierId[]
type Invoices = any[]
type InvoiceId = string | number
type BuyerId = string | number
type Query = string
type Country = string
type Product = string

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'

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
  scoreSupplier: (supplierId: SupplierId, criteria = {}) =>
    api.post('/origination/score', { supplierId, criteria }),

  // Extract document data
  extractDocument: (documentType: DocumentType, documentData: DocumentData) =>
    api.post('/origination/extract', { documentType, documentData }),
  
  // Get origination metrics
  getMetrics: () => 
    api.get('/origination/metrics')
}

// Compliance API
export const complianceAPI = {
  // Verify KYC/AML/UBO
  verifyCompliance: (supplierId: SupplierId, forceRefresh = false) =>
    api.get(`/compliance/verify/${supplierId}`, {
      params: { forceRefresh }
    }),

  // Get compliance status
  getStatus: (supplierId: SupplierId) =>
    api.get(`/compliance/status/${supplierId}`),
  
  // Get compliance metrics
  getMetrics: () => 
    api.get('/compliance/metrics'),
  
  // Bulk compliance verification
  bulkVerify: (supplierIds: SupplierIds) =>
    api.post('/compliance/bulk-verify', { supplierIds })
}

// Receivables API
export const receivablesAPI = {
  // Analyze invoices
  analyzeInvoices: (invoices: Invoices, analysisType = 'full') =>
    api.post('/receivables/analyze', { invoices, analysisType }),

  // Get invoice quality
  getQuality: (invoiceId: InvoiceId, includeExplanation = true) =>
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
  matchBuyers: (invoices: Invoices, preferences = {}) =>
    api.post('/matching/allocate', { invoices, preferences }),

  // Get buyer profiles
  getBuyers: (active = true) =>
    api.get('/matching/buyers', { params: { active } }),

  // Get matching metrics
  getMetrics: () =>
    api.get('/matching/metrics'),

  // Simulate allocation
  simulate: (invoices: Invoices, buyerId: BuyerId) =>
    api.post('/matching/simulate', { invoices, buyerId })
}

// UN Comtrade API
export const unComtradeAPI = {
  // Initialize ClickHouse tables
  initializeTables: () =>
    api.post('/uncomtrade/initialize'),

  // Get data availability
  getDataAvailability: (params = {}) =>
    api.get('/uncomtrade/availability', { params }),

  // Preview final data (limited)
  previewData: (params = {}) =>
    api.get('/uncomtrade/preview', { params }),

  // Get final data (full dataset)
  getData: (params = {}) =>
    api.get('/uncomtrade/data', { params }),

  // Get trade statistics
  getStatistics: (params = {}) =>
    api.get('/uncomtrade/statistics', { params }),

  // Collect major countries data
  collectMajorCountries: () =>
    api.post('/uncomtrade/collect-major-countries'),

  // Get collection status
  getStatus: () =>
    api.get('/uncomtrade/status')
}

// ITC Scraper API
export const itcScraperAPI = {
  // Collect ITC data for major countries
  collectMajorCountries: () =>
    api.post('/itc-scraper/collect-major-countries'),

  // Get stored ITC data
  getData: (params = {}) =>
    api.get('/itc-scraper/data', { params }),

  // Get ITC statistics
  getStatistics: () =>
    api.get('/itc-scraper/statistics'),

  // Extract data for specific country
  extractCountry: (countryCode: string, year = 2023) =>
    api.post(`/itc-scraper/extract-country/${countryCode}`, {}, { params: { year } }),

  // Get collection status
  getStatus: () =>
    api.get('/itc-scraper/status'),

  // Cleanup scraper resources
  cleanup: () =>
    api.post('/itc-scraper/cleanup')
}

// Trade Map API
export const tradeMapAPI = {
  // Get trade flows data
  getTradeFlows: (params = {}) =>
    api.get('/trademap/trade-flows', { params }),

  // Get market insights
  getInsights: (params = {}) =>
    api.get('/trademap/insights', { params }),

  // Get company directory
  getCompanies: (params = {}) =>
    api.get('/trademap/companies', { params }),

  // Get trade indicators
  getIndicators: (params = {}) =>
    api.get('/trademap/indicators', { params }),

  // Get country data
  getCountries: () =>
    api.get('/trademap/countries'),

  // Get product classifications
  getProducts: () =>
    api.get('/trademap/products'),

  // Get trade analytics
  getAnalytics: (params = {}) =>
    api.get('/trademap/analytics', { params }),

  // Search trade data
  search: (query: Query, type = 'all') =>
    api.get('/trademap/search', { params: { q: query, type } }),

  // Get market opportunities
  getOpportunities: (params = {}) =>
    api.get('/trademap/opportunities', { params }),

  // Get risk assessments
  getRisks: (params = {}) =>
    api.get('/trademap/risks', { params }),

  // Get supply chain analysis
  getSupplyChain: (country: Country, product: Product) =>
    api.get('/trademap/supply-chain', { params: { country, product } })
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
    api.get('/analytics/dashboard'),

  // Get Trade Map enhanced dashboard
  getTradeMapDashboard: () =>
    api.get('/analytics/trademap-dashboard')
}

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3001/ws/origination'
    
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
