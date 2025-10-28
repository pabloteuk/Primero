// Simulated matching engine for buyer allocation
export class MatchingEngine {
  constructor() {
    this.modelName = 'Intelligent Matching Engine'
    this.version = '1.4.0'
    this.performance = {
      matchAccuracy: 0.89,
      satisfactionScore: 4.7,
      averageProcessingTime: '2.3 hours'
    }
  }

  async allocate(invoices, preferences = {}) {
    const buyers = await this.getAvailableBuyers()
    const allocations = []
    
    for (const invoice of invoices) {
      const bestMatch = this.findBestMatch(invoice, buyers, preferences)
      allocations.push({
        invoiceId: invoice.id,
        buyerId: bestMatch.buyerId,
        buyerName: bestMatch.buyerName,
        matchScore: bestMatch.matchScore,
        amount: invoice.amount,
        region: invoice.region,
        industry: invoice.industry,
        expectedReturn: bestMatch.expectedReturn,
        riskScore: bestMatch.riskScore,
        confidence: bestMatch.confidence,
        matchReason: bestMatch.matchReason
      })
    }
    
    return allocations
  }

  findBestMatch(invoice, buyers, preferences) {
    let bestMatch = null
    let bestScore = 0
    
    for (const buyer of buyers) {
      const matchScore = this.calculateMatchScore(invoice, buyer, preferences)
      
      if (matchScore > bestScore) {
        bestScore = matchScore
        bestMatch = {
          buyerId: buyer.id,
          buyerName: buyer.name,
          matchScore: Math.round(matchScore),
          expectedReturn: this.calculateExpectedReturn(invoice, buyer),
          riskScore: this.calculateRiskScore(invoice, buyer),
          confidence: this.calculateConfidence(matchScore),
          matchReason: this.generateMatchReason(invoice, buyer, matchScore)
        }
      }
    }
    
    return bestMatch || this.getDefaultMatch(invoice)
  }

  calculateMatchScore(invoice, buyer, preferences) {
    let score = 0
    let factors = 0
    
    // Amount matching (25% weight)
    if (this.matchesAmount(invoice.amount, buyer.preferences)) {
      score += 25
      factors++
    }
    
    // Region matching (20% weight)
    if (this.matchesRegion(invoice.region, buyer.preferences)) {
      score += 20
      factors++
    }
    
    // Industry matching (20% weight)
    if (this.matchesIndustry(invoice.industry, buyer.preferences)) {
      score += 20
      factors++
    }
    
    // Quality score matching (15% weight)
    if (this.matchesQualityScore(invoice.qualityScore, buyer.preferences)) {
      score += 15
      factors++
    }
    
    // Risk level matching (10% weight)
    if (this.matchesRiskLevel(invoice.riskLevel, buyer.preferences)) {
      score += 10
      factors++
    }
    
    // Payment terms matching (5% weight)
    if (this.matchesPaymentTerms(invoice.paymentTerms, buyer.preferences)) {
      score += 5
      factors++
    }
    
    // Currency matching (5% weight)
    if (this.matchesCurrency(invoice.currency, buyer.preferences)) {
      score += 5
      factors++
    }
    
    // Apply buyer capacity constraints
    if (buyer.capacity.available < invoice.amount) {
      score *= 0.5 // Reduce score if insufficient capacity
    }
    
    // Apply preferences weight
    if (preferences.prioritizeReturn) {
      score += this.calculateReturnBonus(invoice, buyer)
    }
    if (preferences.prioritizeRisk) {
      score += this.calculateRiskBonus(invoice, buyer)
    }
    
    return Math.min(100, score)
  }

  matchesAmount(amount, preferences) {
    return amount >= preferences.minAmount && amount <= preferences.maxAmount
  }

  matchesRegion(region, preferences) {
    return preferences.regions.includes(region)
  }

  matchesIndustry(industry, preferences) {
    return preferences.industries.includes(industry)
  }

  matchesQualityScore(qualityScore, preferences) {
    return qualityScore >= preferences.minQualityScore
  }

  matchesRiskLevel(riskLevel, preferences) {
    const riskLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'VERY_HIGH': 4 }
    return riskLevels[riskLevel] <= riskLevels[preferences.maxRiskLevel]
  }

  matchesPaymentTerms(paymentTerms, preferences) {
    return preferences.paymentTerms.includes(paymentTerms)
  }

  matchesCurrency(currency, preferences) {
    return preferences.currencies.includes(currency)
  }

  calculateExpectedReturn(invoice, buyer) {
    const baseReturn = buyer.performance.averageReturn
    const qualityBonus = (invoice.qualityScore - 75) * 0.1
    const riskAdjustment = this.getRiskAdjustment(invoice.riskLevel)
    
    return Math.round((baseReturn + qualityBonus + riskAdjustment) * 100) / 100
  }

  calculateRiskScore(invoice, buyer) {
    const baseRisk = this.getRiskScore(invoice.riskLevel)
    const buyerRiskTolerance = this.getBuyerRiskTolerance(buyer)
    const regionRisk = this.getRegionRisk(invoice.region)
    
    return Math.round((baseRisk + regionRisk - buyerRiskTolerance) * 10) / 10
  }

  calculateConfidence(matchScore) {
    // Higher match scores = higher confidence
    return Math.min(0.98, Math.max(0.5, matchScore / 100))
  }

  generateMatchReason(invoice, buyer, matchScore) {
    const reasons = []
    
    if (this.matchesAmount(invoice.amount, buyer.preferences)) {
      reasons.push('Amount within buyer range')
    }
    if (this.matchesRegion(invoice.region, buyer.preferences)) {
      reasons.push('Geographic preference match')
    }
    if (this.matchesIndustry(invoice.industry, buyer.preferences)) {
      reasons.push('Industry preference match')
    }
    if (this.matchesQualityScore(invoice.qualityScore, buyer.preferences)) {
      reasons.push('Quality score meets requirements')
    }
    
    if (reasons.length === 0) {
      reasons.push('Best available match based on overall criteria')
    }
    
    return reasons.join(', ')
  }

  calculateReturnBonus(invoice, buyer) {
    const expectedReturn = this.calculateExpectedReturn(invoice, buyer)
    return Math.min(10, expectedReturn - 8) // Bonus for returns above 8%
  }

  calculateRiskBonus(invoice, buyer) {
    const riskScore = this.calculateRiskScore(invoice, buyer)
    return Math.min(10, Math.max(0, 20 - riskScore)) // Bonus for lower risk
  }

  getRiskAdjustment(riskLevel) {
    const adjustments = {
      'LOW': 0.5,
      'MEDIUM': 0,
      'HIGH': -0.5,
      'VERY_HIGH': -1.0
    }
    return adjustments[riskLevel] || 0
  }

  getRiskScore(riskLevel) {
    const scores = {
      'LOW': 5,
      'MEDIUM': 15,
      'HIGH': 25,
      'VERY_HIGH': 35
    }
    return scores[riskLevel] || 20
  }

  getBuyerRiskTolerance(buyer) {
    const tolerances = {
      'Institutional Investor': 10,
      'Specialized Fund': 15,
      'Private Equity': 5,
      'Bank': 8
    }
    return tolerances[buyer.type] || 12
  }

  getRegionRisk(region) {
    const risks = {
      'Asia-Pacific': 5,
      'Europe': 3,
      'North America': 2,
      'Latin America': 12,
      'Africa': 18,
      'Middle East': 15
    }
    return risks[region] || 10
  }

  getDefaultMatch(invoice) {
    return {
      buyerId: 'default-buyer',
      buyerName: 'Default Allocation',
      matchScore: 50,
      expectedReturn: 8.0,
      riskScore: 20,
      confidence: 0.5,
      matchReason: 'Default allocation - no specific buyer match found'
    }
  }

  async getAvailableBuyers() {
    // Simulate buyer data
    return [
      {
        id: 'buyer-001',
        name: 'Global Trade Capital Fund',
        type: 'Institutional Investor',
        preferences: {
          minAmount: 100000,
          maxAmount: 5000000,
          regions: ['Asia-Pacific', 'Europe'],
          industries: ['Manufacturing', 'Technology'],
          minQualityScore: 85,
          maxRiskLevel: 'HIGH',
          paymentTerms: ['Net 30', 'Net 60'],
          currencies: ['USD', 'EUR']
        },
        capacity: {
          available: 15000000,
          total: 50000000
        },
        performance: {
          averageReturn: 8.7,
          defaultRate: 0.05
        }
      },
      {
        id: 'buyer-002',
        name: 'Emerging Markets Trade Finance',
        type: 'Specialized Fund',
        preferences: {
          minAmount: 50000,
          maxAmount: 2000000,
          regions: ['Latin America', 'Africa'],
          industries: ['Agriculture', 'Energy'],
          minQualityScore: 75,
          maxRiskLevel: 'VERY_HIGH',
          paymentTerms: ['Net 30', 'Net 60', 'Net 90'],
          currencies: ['USD', 'EUR', 'GBP']
        },
        capacity: {
          available: 8000000,
          total: 25000000
        },
        performance: {
          averageReturn: 12.3,
          defaultRate: 0.08
        }
      }
    ]
  }
}
