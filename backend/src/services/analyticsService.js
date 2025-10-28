export async function getPipelineMetrics() {
  return {
    funnel: {
      discovered: { count: 1247, percentage: 100 },
      contacted: { count: 523, percentage: 42 },
      applied: { count: 234, percentage: 19 },
      verified: { count: 156, percentage: 13 },
      funded: { count: 89, percentage: 7 }
    },
    conversionRates: {
      discoveryToContact: 0.42,
      contactToApplication: 0.45,
      applicationToVerification: 0.67,
      verificationToFunding: 0.57,
      overallConversion: 0.07
    },
    timeInStage: {
      discovery: '2.3 days',
      contact: '5.7 days',
      application: '3.2 days',
      verification: '2.1 days',
      funding: '1.8 days',
      total: '15.1 days'
    },
    dropOffReasons: {
      'No Response': 0.25,
      'Incomplete Application': 0.18,
      'Failed Compliance': 0.15,
      'Low Quality Score': 0.12,
      'Capacity Constraints': 0.08,
      'Other': 0.22
    }
  }
}

export async function getROIMetrics() {
  return {
    totalAnnualSavings: 1800000, // $1.8M
    breakdown: {
      documentIntelligence: 400000, // 4 FTE eliminated
      complianceAutomation: 500000, // 3 FTE eliminated
      creditRiskAutomation: 600000, // 4 FTE eliminated
      matchingAutomation: 200000,  // 1 FTE eliminated
      workflowOptimization: 100000 // Process improvements
    },
    fteEliminated: 12,
    averageCostPerFte: 150000,
    automationRate: 0.85,
    processingTimeReduction: 0.78, // 78% faster
    errorRateReduction: 0.92, // 92% fewer errors
    monthlyTrends: [
      { month: '2024-01', savings: 120000, automationRate: 0.78 },
      { month: '2024-02', savings: 135000, automationRate: 0.81 },
      { month: '2024-03', savings: 142000, automationRate: 0.83 },
      { month: '2024-04', savings: 155000, automationRate: 0.85 },
      { month: '2024-05', savings: 162000, automationRate: 0.86 },
      { month: '2024-06', savings: 168000, automationRate: 0.87 }
    ],
    paybackPeriod: '7 months',
    roi: 2.8 // 280% ROI over 24 months
  }
}

export async function getAutomationMetrics() {
  return {
    overallAutomationRate: 0.85,
    systems: {
      documentIntelligence: {
        automationRate: 0.95,
        processingTime: '12 seconds',
        accuracy: 0.95,
        stpRate: 0.95
      },
      compliance: {
        automationRate: 0.89,
        processingTime: '6 minutes',
        accuracy: 0.943,
        stpRate: 0.89
      },
      creditRisk: {
        automationRate: 0.92,
        processingTime: '3 seconds',
        accuracy: 0.92,
        stpRate: 0.92
      },
      matching: {
        automationRate: 0.78,
        processingTime: '2.3 hours',
        accuracy: 0.89,
        stpRate: 0.78
      }
    },
    performance: {
      averageProcessingTime: '2.3 days',
      straightThroughProcessing: 0.85,
      errorRate: 0.03,
      customerSatisfaction: 4.7,
      uptime: 0.997
    },
    monthlyImprovements: [
      { month: '2024-01', automationRate: 0.78, errors: 45 },
      { month: '2024-02', automationRate: 0.81, errors: 38 },
      { month: '2024-03', automationRate: 0.83, errors: 32 },
      { month: '2024-04', automationRate: 0.85, errors: 28 },
      { month: '2024-05', automationRate: 0.86, errors: 25 },
      { month: '2024-06', automationRate: 0.87, errors: 22 }
    ]
  }
}
