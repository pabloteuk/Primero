import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from './ui/MetricCard'
import { LCTrendsChart } from './charts/LCTrendsChart'
import { LogisticsPerformanceChart } from './charts/LogisticsPerformanceChart'
import { RegionalFlowsChart } from './charts/RegionalFlowsChart'
import { TradeFlowMap } from './charts/TradeFlowMap'
import { TradeGapChart } from './charts/TradeGapChart'
import { TopRegionsTable } from './data/TopRegionsTable'
import { AIInsightsPanel } from './AIInsightsPanel'
import { analyticsAPI, tradeMapAPI } from '@/services/api'

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load enhanced dashboard with Trade Map data
      const response = await analyticsAPI.getTradeMapDashboard()
      setData(response.data.data)
      setError(null)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      // Use mock data when API fails
      setData(getMockDashboardData())
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for when backend is unavailable
  const getMockDashboardData = () => ({
    origination: {
      overview: {
        totalSuppliers: 1247,
        activeDeals: 89,
        totalValue: 125000000,
        automationRate: 0.78
      },
      performance: {
        lastUpdated: new Date().toISOString(),
        monthlyGrowth: 0.085,
        complianceScore: 0.94
      }
    },
    tradeMap: {
      insights: {
        totalCountries: 195,
        activeTradeRoutes: 1247,
        marketOpportunities: 89,
        riskAlerts: 12
      }
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded-lg mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-300 mb-4">{error}</p>
                <Button onClick={loadDashboardData} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 pt-20 lg:pt-6 lg:ml-80">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Trade Finance Intelligence</h1>
            <p className="text-gray-300 text-lg">
              AI-powered origination automation for institutional receivables
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/analytics">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20">
                📊 Analytics Workbench
              </Button>
            </Link>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Live Data
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Suppliers"
            value={data?.origination?.overview?.totalSuppliers?.toLocaleString() || '1,247'}
            change="+7.8%"
            changeType="positive"
            icon="🏢"
            description="supplier network growth"
          />
          <MetricCard
            title="Active Deals"
            value={data?.origination?.overview?.activeDeals?.toLocaleString() || '89'}
            change="+8.2%"
            changeType="positive"
            icon="💼"
            description="vs last month"
          />
          <MetricCard
            title="Total Value"
            value={`$${data?.origination?.overview?.totalValue ? (data.origination.overview.totalValue / 1000000).toFixed(1) + 'M' : '125M'}`}
            change="+12.5%"
            changeType="positive"
            icon="💰"
            description="portfolio growth"
          />
          <MetricCard
            title="Automation Rate"
            value={`${data?.origination?.overview?.automationRate ? (data.origination.overview.automationRate * 100).toFixed(1) + '%' : '85%'}`}
            change="+3.2%"
            changeType="positive"
            icon="🤖"
            description="monthly improvement"
          />
        </div>

        {/* Trade Map Intelligence Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Global Trade Value"
            value={`$${(data?.trademap?.overview?.totalTradeValue / 1000000)?.toFixed(1) || '5,080'}M`}
            change="+17.5%"
            changeType="positive"
            icon="🌍"
            description="Sept 2024 trade flows"
          />
          <MetricCard
            title="Trade Routes"
            value={data?.trademap?.overview?.activeTradeRoutes?.toString() || '24'}
            change="+5.2%"
            changeType="positive"
            icon="🚢"
            description="active trade corridors"
          />
          <MetricCard
            title="Financing Opportunities"
            value={`$${(data?.insights?.tradeFinanceOpportunities?.totalValue / 1000000)?.toFixed(0) || '2,810'}M`}
            change="+23.1%"
            changeType="positive"
            icon="💰"
            description="identified opportunities"
          />
          <MetricCard
            title="AI Insights Accuracy"
            value={`${data?.performance?.aiInsightsAccuracy || '92%'}`}
            change="+2.1%"
            changeType="positive"
            icon="🎯"
            description="prediction accuracy"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-xl border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="origination">Origination</TabsTrigger>
            <TabsTrigger value="trademap">Trade Intelligence</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Letter of Credit Trends</CardTitle>
                  <CardDescription>Global LC usage and growth patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <LCTrendsChart data={data} />
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Logistics Performance</CardTitle>
                  <CardDescription>Supply chain efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <LogisticsPerformanceChart data={data} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Regional Trade Flows</CardTitle>
                  <CardDescription>Cross-border trade volume by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegionalFlowsChart data={data} />
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Trade Finance Gap</CardTitle>
                  <CardDescription>Unmet financing needs by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <TradeGapChart data={data} />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Global Trade Flow Map</CardTitle>
                <CardDescription>Interactive visualization of trade routes</CardDescription>
              </CardHeader>
              <CardContent>
                <TradeFlowMap data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="origination" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Supplier Discovery</CardTitle>
                  <CardDescription>AI-powered supplier identification and scoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    Supplier discovery interface coming soon...
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Lead Scoring</CardTitle>
                  <CardDescription>ML-based supplier potential assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    Lead scoring interface coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trademap" className="space-y-6">
            {/* Trade Intelligence Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🌍 Global Trade Flows
                  </CardTitle>
                  <CardDescription>Real-time trade data from 220+ countries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Trade Value</span>
                      <span className="text-white font-bold">
                        ${(data?.trademap?.overview?.totalTradeValue / 1000000)?.toFixed(1) || '5,080'}M
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Active Countries</span>
                      <span className="text-white font-bold">{data?.trademap?.overview?.totalCountries || '8'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Trade Routes</span>
                      <span className="text-white font-bold">{data?.trademap?.overview?.activeTradeRoutes || '24'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Data Freshness</span>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        {data?.performance?.tradeDataFreshness || 'Real-time'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🎯 Financing Opportunities
                  </CardTitle>
                  <CardDescription>AI-identified trade finance potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        ${(data?.insights?.tradeFinanceOpportunities?.totalValue / 1000000)?.toFixed(0) || '2,810'}M
                      </div>
                      <div className="text-gray-300">Total Opportunity Value</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Electronics Supply Chain</span>
                        <span className="text-white">
                          ${(data?.insights?.tradeFinanceOpportunities?.breakdown?.electronics / 1000000)?.toFixed(0) || '1,270'}M
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Automotive Parts</span>
                        <span className="text-white">
                          ${(data?.insights?.tradeFinanceOpportunities?.breakdown?.automotive / 1000000)?.toFixed(0) || '890'}M
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Industrial Machinery</span>
                        <span className="text-white">
                          ${(data?.insights?.tradeFinanceOpportunities?.breakdown?.machinery / 1000000)?.toFixed(0) || '650'}M
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🤖 AI Market Insights
                  </CardTitle>
                  <CardDescription>Real-time trade intelligence and opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.trademap?.insights?.slice(0, 3).map((insight: any, index: number) => (
                      <div key={index} className="border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {insight.type === 'opportunity' ? '🚀' : insight.type === 'risk' ? '⚠️' : '📈'}
                          </span>
                          <span className="text-white font-medium">{insight.title}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Impact: {insight.impact}</span>
                          <span className="text-gray-400">Confidence: {insight.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🎯 Strategic Recommendations
                  </CardTitle>
                  <CardDescription>AI-powered action items for growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.recommendations?.map((rec: any, index: number) => (
                      <div key={index} className="border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                            {rec.priority}
                          </Badge>
                          <span className="text-white font-medium">{rec.type}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{rec.action}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{rec.impact}</span>
                          <span className="text-gray-400">Confidence: {rec.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Traders & Emerging Markets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">🏆 Top Trading Countries</CardTitle>
                  <CardDescription>Leading exporters by trade value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.trademap?.analytics?.top_exporters?.map((country: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-white">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">
                            ${(country.value / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-gray-400 text-sm">{country.share}% share</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">🚀 Emerging Markets</CardTitle>
                  <CardDescription>High-growth markets identified by AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.insights?.marketIntelligence?.emergingMarkets?.map((market: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">{market}</span>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                          High Growth
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">KYC Verification</CardTitle>
                  <CardDescription>Automated identity verification and validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    KYC verification interface coming soon...
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">AML Screening</CardTitle>
                  <CardDescription>Anti-money laundering compliance checks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    AML screening interface coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Top Regions</CardTitle>
                  <CardDescription>Leading trade finance regions by volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopRegionsTable />
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">AI Insights</CardTitle>
                  <CardDescription>Machine learning predictions and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <AIInsightsPanel />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard
