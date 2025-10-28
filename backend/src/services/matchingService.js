import { MatchingEngine } from '../ml/matchingEngine.js'

const matchingEngine = new MatchingEngine()

export async function matchBuyers(invoices, preferences = {}) {
  const allocation = await matchingEngine.allocate(invoices, preferences)
  
  return {
    totalInvoices: invoices.length,
    totalValue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    allocation,
    summary: {
      averageMatchScore: allocation.reduce((sum, a) => sum + a.matchScore, 0) / allocation.length,
      diversificationScore: calculateDiversificationScore(allocation),
      riskScore: calculateRiskScore(allocation),
      expectedReturn: calculateExpectedReturn(allocation)
    },
    recommendations: generateRecommendations(allocation)
  }
}

export async function getBuyerProfiles(active = true) {
  const buyers = [
    {
      id: 'buyer-001',
      name: 'Global Trade Capital Fund',
      type: 'Institutional Investor',
      status: 'active',
      preferences: {
        minAmount: 100000,
        maxAmount: 5000000,
        regions: ['Asia-Pacific', 'Europe'],
        industries: ['Manufacturing', 'Technology'],
        minQualityScore: 85,
        maxRiskLevel: 15,
        paymentTerms: ['Net 30', 'Net 60'],
        currencies: ['USD', 'EUR']
      },
      capacity: {
        total: 50000000,
        available: 15000000,
        deployed: 35000000
      },
      performance: {
        averageReturn: 8.7,
        defaultRate: 0.05,
        satisfactionScore: 4.8
      }
    },
    {
      id: 'buyer-002',
      name: 'Emerging Markets Trade Finance',
      type: 'Specialized Fund',
      status: 'active',
      preferences: {
        minAmount: 50000,
        maxAmount: 2000000,
        regions: ['Latin America', 'Africa'],
        industries: ['Agriculture', 'Energy'],
        minQualityScore: 75,
        maxRiskLevel: 25,
        paymentTerms: ['Net 30', 'Net 60', 'Net 90'],
        currencies: ['USD', 'EUR', 'GBP']
      },
      capacity: {
        total: 25000000,
        available: 8000000,
        deployed: 17000000
      },
      performance: {
        averageReturn: 12.3,
        defaultRate: 0.08,
        satisfactionScore: 4.6
      }
    },
    {
      id: 'buyer-003',
      name: 'Premium Receivables Partners',
      type: 'Private Equity',
      status: 'active',
      preferences: {
        minAmount: 500000,
        maxAmount: 10000000,
        regions: ['North America', 'Europe'],
        industries: ['Manufacturing', 'Technology', 'Healthcare'],
        minQualityScore: 90,
        maxRiskLevel: 10,
        paymentTerms: ['Net 30'],
        currencies: ['USD', 'EUR']
      },
      capacity: {
        total: 100000000,
        available: 25000000,
        deployed: 75000000
      },
      performance: {
        averageReturn: 6.8,
        defaultRate: 0.02,
        satisfactionScore: 4.9
      }
    }
  ]
  
  return active ? buyers.filter(b => b.status === 'active') : buyers
}

export async function getMatchingMetrics() {
  return {
    totalBuyers: 12,
    activeBuyers: 10,
    totalCapacity: 500000000,
    availableCapacity: 125000000,
    averageMatchRate: 0.89,
    averageProcessingTime: '2.3 hours',
    satisfactionScore: 4.7,
    performance: {
      dealsMatched: 156,
      totalValueMatched: 125000000,
      averageDealSize: 801282,
      successRate: 0.94
    },
    buyerBreakdown: [
      { type: 'Institutional Investor', count: 4, capacity: 200000000 },
      { type: 'Specialized Fund', count: 3, capacity: 150000000 },
      { type: 'Private Equity', count: 3, capacity: 100000000 },
      { type: 'Bank', count: 2, capacity: 50000000 }
    ],
    regionalPreferences: [
      { region: 'Asia-Pacific', demand: 0.35, supply: 0.42 },
      { region: 'Europe', demand: 0.28, supply: 0.25 },
      { region: 'North America', demand: 0.22, supply: 0.19 },
      { region: 'Latin America', demand: 0.15, supply: 0.14 }
    ]
  }
}

function calculateDiversificationScore(allocation) {
  // Calculate portfolio diversification based on regions, industries, etc.
  const regions = new Set(allocation.map(a => a.region)).size
  const industries = new Set(allocation.map(a => a.industry)).size
  const buyers = new Set(allocation.map(a => a.buyerId)).size
  
  return Math.min(100, (regions * 20 + industries * 15 + buyers * 10))
}

function calculateRiskScore(allocation) {
  // Calculate weighted average risk score
  const totalValue = allocation.reduce((sum, a) => sum + a.amount, 0)
  const weightedRisk = allocation.reduce((sum, a) => sum + (a.riskScore * a.amount), 0)
  return Math.round(weightedRisk / totalValue)
}

function calculateExpectedReturn(allocation) {
  // Calculate weighted average expected return
  const totalValue = allocation.reduce((sum, a) => sum + a.amount, 0)
  const weightedReturn = allocation.reduce((sum, a) => sum + (a.expectedReturn * a.amount), 0)
  return Math.round((weightedReturn / totalValue) * 100) / 100
}

function generateRecommendations(allocation) {
  const recommendations = []
  
  if (allocation.length < 5) {
    recommendations.push('Consider adding more invoices for better diversification')
  }
  
  const avgScore = allocation.reduce((sum, a) => sum + a.matchScore, 0) / allocation.length
  if (avgScore < 80) {
    recommendations.push('Some invoices have low match scores - review buyer preferences')
  }
  
  const regions = new Set(allocation.map(a => a.region)).size
  if (regions < 3) {
    recommendations.push('Add invoices from more regions to improve geographic diversification')
  }
  
  return recommendations
}
