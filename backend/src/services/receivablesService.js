import { CreditRiskModel } from '../ml/creditRiskModel.js'
import { FraudDetector } from '../ml/fraudDetector.js'

const creditRiskModel = new CreditRiskModel()
const fraudDetector = new FraudDetector()

export async function analyzeInvoices(invoices, analysisType = 'full') {
  const results = []
  
  for (const invoice of invoices) {
    const analysis = {
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      debtor: invoice.debtor,
      supplier: invoice.supplier,
      dueDate: invoice.dueDate,
      analysisType
    }
    
    if (analysisType === 'full' || analysisType === 'credit') {
      // Credit risk analysis
      const creditAnalysis = await creditRiskModel.predict(invoice)
      analysis.creditRisk = creditAnalysis
    }
    
    if (analysisType === 'full' || analysisType === 'fraud') {
      // Fraud detection
      const fraudAnalysis = await fraudDetector.detect(invoice)
      analysis.fraudRisk = fraudAnalysis
    }
    
    if (analysisType === 'full') {
      // Overall quality score
      analysis.qualityScore = calculateQualityScore(analysis.creditRisk, analysis.fraudRisk)
      analysis.investmentGrade = analysis.qualityScore >= 75
      analysis.recommendation = analysis.investmentGrade ? 'BUY' : 'SKIP'
    }
    
    results.push(analysis)
  }
  
  return {
    totalAnalyzed: results.length,
    investmentGrade: results.filter(r => r.investmentGrade).length,
    averageQualityScore: results.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / results.length,
    results
  }
}

export async function getInvoiceQuality(invoiceId, includeExplanation = true) {
  // Simulate invoice quality analysis
  const quality = {
    invoiceId,
    qualityScore: 89.2,
    investmentGrade: true,
    creditRisk: {
      score: 87.5,
      probability: 0.12,
      factors: [
        { factor: 'Debtor Payment History', weight: 0.3, score: 92 },
        { factor: 'Country Risk', weight: 0.25, score: 85 },
        { factor: 'Industry Risk', weight: 0.2, score: 88 },
        { factor: 'Invoice Terms', weight: 0.15, score: 90 },
        { factor: 'Supplier Reputation', weight: 0.1, score: 95 }
      ]
    },
    fraudRisk: {
      score: 12.3,
      level: 'LOW',
      flags: [],
      confidence: 0.94
    },
    recommendation: 'BUY',
    confidence: 0.92
  }
  
  if (includeExplanation) {
    quality.explanation = {
      strengths: [
        'Strong debtor payment history (92/100)',
        'Favorable invoice terms (90/100)',
        'Low fraud risk (12.3/100)',
        'Investment-grade supplier (95/100)'
      ],
      concerns: [
        'Moderate country risk (85/100)',
        'Industry volatility (88/100)'
      ],
      nextSteps: [
        'Monitor debtor payment patterns',
        'Consider currency hedging for country risk',
        'Review industry trends quarterly'
      ]
    }
  }
  
  return quality
}

export async function getReceivablesMetrics() {
  return {
    totalInvoices: 500,
    totalValue: 125000000,
    averageQualityScore: 89.2,
    investmentGradeRate: 0.89,
    fraudDetectionRate: 0.987,
    defaultPredictionAccuracy: 0.92,
    creditModelPerformance: {
      aucRoc: 0.92,
      precision: 0.89,
      recall: 0.94,
      f1Score: 0.91
    },
    fraudDetectionPerformance: {
      truePositiveRate: 0.987,
      falsePositiveRate: 0.005,
      precision: 0.95,
      recall: 0.98
    },
    qualityDistribution: {
      excellent: 156, // 90-100
      good: 234,      // 80-89
      fair: 78,       // 70-79
      poor: 32        // <70
    },
    regionalBreakdown: [
      { region: 'Asia-Pacific', count: 223, avgScore: 91.2, investmentGradeRate: 0.92 },
      { region: 'Europe', count: 156, avgScore: 88.7, investmentGradeRate: 0.89 },
      { region: 'North America', count: 89, avgScore: 87.3, investmentGradeRate: 0.85 },
      { region: 'Latin America', count: 32, avgScore: 82.1, investmentGradeRate: 0.78 }
    ]
  }
}

function calculateQualityScore(creditRisk, fraudRisk) {
  if (!creditRisk || !fraudRisk) return 0
  
  const creditWeight = 0.7
  const fraudWeight = 0.3
  
  const creditScore = creditRisk.score || 0
  const fraudScore = 100 - (fraudRisk.score || 0) // Invert fraud score
  
  return Math.round(creditScore * creditWeight + fraudScore * fraudWeight)
}
