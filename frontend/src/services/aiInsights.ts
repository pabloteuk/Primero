import { AIInsight } from '../types'

class AIInsightsService {
  private insights: AIInsight[] = []
  private insightTemplates = [
    {
      type: 'trend' as const,
      templates: [
        'Trade finance gap in {region} increased {percentage}% YoY, driven by {factor}',
        'LC volumes showing strong recovery in {region} with {percentage}% growth',
        'Digital trade finance adoption accelerating - {percentage}% growth detected in {region}',
        'Supply chain disruptions impacting {region}-{region2} corridors, {impact}% reduction in flows'
      ]
    },
    {
      type: 'anomaly' as const,
      templates: [
        'Unusual spike detected in {region} trade flows - {percentage}% above normal',
        'Anomalous LC issuance pattern detected in {region} - investigating potential causes',
        'Unexpected drop in {region} trade finance activity - {percentage}% below forecast',
        'Risk alert: High concentration of trade finance exposure in {region}'
      ]
    },
    {
      type: 'prediction' as const,
      templates: [
        'AI predicts {percentage}% increase in trade finance gap over next 6 months',
        'Machine learning model forecasts {region} LC volumes to grow {percentage}% by Q4',
        'Predictive analytics suggest {factor} will drive {percentage}% growth in {region}',
        'Risk model indicates {percentage}% probability of trade finance stress in {region}'
      ]
    },
    {
      type: 'risk' as const,
      templates: [
        'Credit risk score elevated for {region} - monitor closely',
        'Geopolitical tensions affecting {region} trade finance confidence',
        'Currency volatility in {region} impacting trade finance pricing',
        'Regulatory changes in {region} may impact trade finance flows'
      ]
    }
  ]

  private regions = ['Asia-Pacific', 'Europe', 'North America', 'Latin America', 'Middle East', 'Africa']
  private factors = ['digital transformation', 'regulatory changes', 'economic recovery', 'supply chain optimization', 'fintech innovation']
  private impacts = ['15', '22', '8', '31', '19', '12', '27']

  generateInsight(): AIInsight {
    const category = this.insightTemplates[Math.floor(Math.random() * this.insightTemplates.length)]
    const template = category.templates[Math.floor(Math.random() * category.templates.length)]
    
    const region = this.regions[Math.floor(Math.random() * this.regions.length)]
    const region2 = this.regions[Math.floor(Math.random() * this.regions.length)]
    const factor = this.factors[Math.floor(Math.random() * this.factors.length)]
    const percentage = (Math.random() * 50 + 5).toFixed(1)
    const impact = this.impacts[Math.floor(Math.random() * this.impacts.length)]
    
    const description = template
      .replace(/{region}/g, region)
      .replace(/{region2}/g, region2)
      .replace(/{factor}/g, factor)
      .replace(/{percentage}/g, percentage)
      .replace(/{impact}/g, impact)
    
    const insight: AIInsight = {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: category.type,
      title: this.generateTitle(category.type),
      description,
      confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
      timestamp: new Date().toISOString(),
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }
    
    this.insights.unshift(insight)
    
    // Keep only last 50 insights
    if (this.insights.length > 50) {
      this.insights = this.insights.slice(0, 50)
    }
    
    return insight
  }

  private generateTitle(type: string): string {
    const titles = {
      trend: ['Market Trend Analysis', 'Growth Pattern Detected', 'Trade Flow Analysis'],
      anomaly: ['Anomaly Alert', 'Unusual Activity Detected', 'Pattern Deviation'],
      prediction: ['AI Forecast', 'Predictive Analysis', 'Future Outlook'],
      risk: ['Risk Assessment', 'Credit Alert', 'Risk Monitoring']
    }
    
    const typeTitles = titles[type as keyof typeof titles] || ['Insight']
    return typeTitles[Math.floor(Math.random() * typeTitles.length)]
  }

  getInsights(): AIInsight[] {
    return this.insights
  }

  getInsightsByType(type: string): AIInsight[] {
    return this.insights.filter(insight => insight.type === type)
  }

  getHighSeverityInsights(): AIInsight[] {
    return this.insights.filter(insight => insight.severity === 'high')
  }

  startInsightGeneration(): void {
    // Generate initial insights
    for (let i = 0; i < 5; i++) {
      this.generateInsight()
    }
    
    // Generate new insights every 30-60 seconds
    setInterval(() => {
      this.generateInsight()
    }, 30000 + Math.random() * 30000)
  }
}

export const aiInsightsService = new AIInsightsService()
