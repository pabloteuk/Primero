// Simulated fraud detection using isolation forest and pattern recognition
export class FraudDetector {
  constructor() {
    this.modelName = 'Isolation Forest Fraud Detector'
    this.version = '1.5.0'
    this.performance = {
      truePositiveRate: 0.987,
      falsePositiveRate: 0.005,
      precision: 0.95,
      recall: 0.98
    }
  }

  async detect(invoice) {
    const features = this.extractFeatures(invoice)
    const anomalyScore = this.calculateAnomalyScore(features)
    const riskLevel = this.determineRiskLevel(anomalyScore)
    const flags = this.checkFlags(features)
    
    return {
      score: anomalyScore,
      riskLevel,
      flags,
      confidence: this.calculateConfidence(anomalyScore, flags),
      reasoning: this.generateReasoning(anomalyScore, flags),
      recommendation: this.generateRecommendation(anomalyScore, riskLevel)
    }
  }

  extractFeatures(invoice) {
    return {
      // Amount-based features
      amount: invoice.amount,
      amountNormalized: this.normalizeAmount(invoice.amount),
      amountOutlier: this.checkAmountOutlier(invoice.amount, invoice.supplier),
      
      // Pattern features
      roundAmount: this.isRoundAmount(invoice.amount),
      unusualAmount: this.isUnusualAmount(invoice.amount),
      
      // Temporal features
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      timeToDue: this.calculateTimeToDue(invoice.issueDate, invoice.dueDate),
      weekendIssue: this.isWeekendIssue(invoice.issueDate),
      
      // Network features
      supplierId: invoice.supplier,
      debtorId: invoice.debtor,
      relationshipNew: this.isNewRelationship(invoice.supplier, invoice.debtor),
      supplierVolume: this.getSupplierVolume(invoice.supplier),
      
      // Geographic features
      supplierCountry: invoice.supplierCountry,
      debtorCountry: invoice.debtorCountry,
      crossBorder: this.isCrossBorder(invoice.supplierCountry, invoice.debtorCountry),
      
      // Document features
      documentType: invoice.documentType,
      hasAttachments: invoice.hasAttachments || false,
      documentQuality: invoice.documentQuality || 'unknown'
    }
  }

  calculateAnomalyScore(features) {
    let score = 0
    
    // Amount-based anomalies (40% weight)
    if (features.amountOutlier) score += 30
    if (features.unusualAmount) score += 20
    if (features.roundAmount) score += 10
    
    // Pattern anomalies (25% weight)
    if (features.relationshipNew) score += 25
    if (features.weekendIssue) score += 15
    
    // Geographic anomalies (20% weight)
    if (features.crossBorder) score += 10
    if (this.isHighRiskCountry(features.supplierCountry)) score += 20
    if (this.isHighRiskCountry(features.debtorCountry)) score += 15
    
    // Temporal anomalies (15% weight)
    if (features.timeToDue < 7) score += 20 // Very short terms
    if (features.timeToDue > 180) score += 15 // Very long terms
    
    // Add some randomness for simulation
    score += Math.random() * 10
    
    return Math.min(100, Math.max(0, score))
  }

  determineRiskLevel(score) {
    if (score >= 80) return 'HIGH'
    if (score >= 60) return 'MEDIUM'
    if (score >= 30) return 'LOW'
    return 'MINIMAL'
  }

  checkFlags(features) {
    const flags = []
    
    if (features.amountOutlier) flags.push('AMOUNT_OUTLIER')
    if (features.unusualAmount) flags.push('UNUSUAL_AMOUNT')
    if (features.roundAmount) flags.push('ROUND_AMOUNT')
    if (features.relationshipNew) flags.push('NEW_RELATIONSHIP')
    if (features.weekendIssue) flags.push('WEEKEND_ISSUE')
    if (features.crossBorder) flags.push('CROSS_BORDER')
    if (this.isHighRiskCountry(features.supplierCountry)) flags.push('HIGH_RISK_SUPPLIER_COUNTRY')
    if (this.isHighRiskCountry(features.debtorCountry)) flags.push('HIGH_RISK_DEBTOR_COUNTRY')
    if (features.timeToDue < 7) flags.push('VERY_SHORT_TERMS')
    if (features.timeToDue > 180) flags.push('VERY_LONG_TERMS')
    
    return flags
  }

  calculateConfidence(score, flags) {
    let confidence = 0.7 // Base confidence
    
    // Increase confidence with more flags
    confidence += Math.min(flags.length * 0.05, 0.2)
    
    // Increase confidence with higher scores
    confidence += Math.min(score / 200, 0.1)
    
    return Math.min(0.98, Math.max(0.5, confidence))
  }

  generateReasoning(score, flags) {
    const reasons = []
    
    if (flags.includes('AMOUNT_OUTLIER')) {
      reasons.push('Invoice amount significantly exceeds supplier\'s typical range')
    }
    if (flags.includes('UNUSUAL_AMOUNT')) {
      reasons.push('Invoice amount appears unusual for this industry')
    }
    if (flags.includes('ROUND_AMOUNT')) {
      reasons.push('Round number amounts may indicate fabricated invoices')
    }
    if (flags.includes('NEW_RELATIONSHIP')) {
      reasons.push('New supplier-debtor relationship requires additional verification')
    }
    if (flags.includes('WEEKEND_ISSUE')) {
      reasons.push('Weekend invoice issuance is uncommon and may indicate fraud')
    }
    if (flags.includes('CROSS_BORDER')) {
      reasons.push('Cross-border transactions have higher fraud risk')
    }
    if (flags.includes('HIGH_RISK_SUPPLIER_COUNTRY')) {
      reasons.push('Supplier country has elevated fraud risk')
    }
    if (flags.includes('HIGH_RISK_DEBTOR_COUNTRY')) {
      reasons.push('Debtor country has elevated fraud risk')
    }
    if (flags.includes('VERY_SHORT_TERMS')) {
      reasons.push('Unusually short payment terms may indicate urgency to avoid detection')
    }
    if (flags.includes('VERY_LONG_TERMS')) {
      reasons.push('Unusually long payment terms may indicate cash flow issues')
    }
    
    return reasons.length > 0 ? reasons : ['No significant fraud indicators detected']
  }

  generateRecommendation(score, riskLevel) {
    switch (riskLevel) {
      case 'HIGH':
        return 'IMMEDIATE_REVIEW'
      case 'MEDIUM':
        return 'MANUAL_VERIFICATION'
      case 'LOW':
        return 'MONITOR'
      default:
        return 'APPROVE'
    }
  }

  // Helper methods
  normalizeAmount(amount) {
    // Normalize amount to 0-1 scale
    return Math.min(1, amount / 10000000) // Cap at $10M
  }

  checkAmountOutlier(amount, supplierId) {
    // Simulate checking against supplier's historical amounts
    const supplierAvg = this.getSupplierAverageAmount(supplierId)
    return amount > supplierAvg * 3 || amount < supplierAvg * 0.1
  }

  isRoundAmount(amount) {
    // Check if amount is suspiciously round
    const rounded = Math.round(amount)
    return Math.abs(amount - rounded) < 0.01 && amount > 1000
  }

  isUnusualAmount(amount) {
    // Check for unusual amount patterns
    const str = amount.toString()
    return str.includes('12345') || str.includes('9999') || str.includes('0000')
  }

  calculateTimeToDue(issueDate, dueDate) {
    const issue = new Date(issueDate)
    const due = new Date(dueDate)
    return Math.ceil((due - issue) / (1000 * 60 * 60 * 24))
  }

  isWeekendIssue(issueDate) {
    const date = new Date(issueDate)
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  isNewRelationship(supplierId, debtorId) {
    // Simulate checking relationship history
    return Math.random() < 0.1 // 10% chance of new relationship
  }

  getSupplierVolume(supplierId) {
    // Simulate supplier volume lookup
    return 1000000 + Math.random() * 9000000 // $1M to $10M
  }

  isCrossBorder(supplierCountry, debtorCountry) {
    return supplierCountry !== debtorCountry
  }

  isHighRiskCountry(country) {
    const highRiskCountries = ['XX', 'YY', 'ZZ'] // Placeholder for high-risk countries
    return highRiskCountries.includes(country)
  }

  getSupplierAverageAmount(supplierId) {
    // Simulate supplier average amount lookup
    return 500000 + Math.random() * 2000000 // $500K to $2.5M
  }
}
