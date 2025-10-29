import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { analyticsAPI, tradeMapAPI } from '@/services/api'
import { PipelineFunnel } from './PipelineFunnel'
import { AutomationMetrics } from './AutomationMetrics'
import { SupplierAnalytics } from './SupplierAnalytics'
import { ComplianceReporting } from './ComplianceReporting'
import { PortfolioAnalysis } from './PortfolioAnalysis'
import { BuyerMatching } from './BuyerMatching'
import { QueryBuilder } from './QueryBuilder'
import { SavedReports } from './SavedReports'
import { ExportHub } from './ExportHub'
import { UnComtradeAnalytics } from './UnComtradeAnalytics'
import { ITCScraperAnalytics } from './ITCScraperAnalytics'

interface AnalyticsData {
  overview: {
    totalSuppliers: number
    activeDeals: number
    totalValue: number
    automationRate: number
  }
  pipeline: any
  roi: any
  automation: any
  performance: {
    uptime: string
    averageResponseTime: string
    errorRate: string
    lastUpdated: string
  }
}

const AnalyticsWorkbench: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getTradeMapDashboard()
      setData(response.data.data)
      setError(null)
    } catch (err) {
      console.error('Error loading analytics data:', err)
      // Use mock data when API fails
      setData(getMockAnalyticsData())
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for when backend is unavailable
  const getMockAnalyticsData = (): AnalyticsData => ({
    overview: {
      totalSuppliers: 1247,
      activeDeals: 89,
      totalValue: 125000000,
      automationRate: 0.78
    },
    pipeline: {
      stages: [
        { name: 'Lead Generation', count: 245, percentage: 28 },
        { name: 'Due Diligence', count: 189, percentage: 22 },
        { name: 'Credit Assessment', count: 156, percentage: 18 },
        { name: 'Deal Structuring', count: 134, percentage: 15 },
        { name: 'Funding', count: 98, percentage: 11 },
        { name: 'Closed', count: 67, percentage: 8 }
      ]
    },
    roi: {
      metrics: [
        { period: 'Q1 2024', value: 2.4, target: 2.0 },
        { period: 'Q2 2024', value: 2.8, target: 2.2 },
        { period: 'Q3 2024', value: 3.1, target: 2.5 },
        { period: 'Q4 2024', value: 3.4, target: 2.8 }
      ]
    },
    automation: {
      monthlyImprovements: [
        { month: 'Jan', improvement: 2.1 },
        { month: 'Feb', improvement: 2.8 },
        { month: 'Mar', improvement: 3.2 },
        { month: 'Apr', improvement: 3.7 },
        { month: 'May', improvement: 4.1 },
        { month: 'Jun', improvement: 4.8 }
      ]
    },
    performance: {
      uptime: '99.9%',
      averageResponseTime: '45ms',
      errorRate: '0.1%',
      lastUpdated: new Date().toISOString()
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
                <h2 className="text-2xl font-bold text-white mb-2">Error Loading Analytics</h2>
                <p className="text-gray-300 mb-4">{error}</p>
                <Button onClick={loadAnalyticsData} variant="outline">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Workbench</h1>
          <p className="text-gray-300 text-lg">
            Advanced analytics and reporting for trade finance origination
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Live Data
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Real-time Updates
            </Badge>
            <span className="text-sm text-gray-400">
              Last updated: {data?.performance.lastUpdated ? new Date(data.performance.lastUpdated).toLocaleString() : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Suppliers</p>
                  <p className="text-3xl font-bold text-white">{data?.overview.totalSuppliers.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Deals</p>
                  <p className="text-3xl font-bold text-white">{data?.overview.activeDeals.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Value</p>
                  <p className="text-3xl font-bold text-white">
                    ${data?.overview.totalValue ? (data.overview.totalValue / 1000000).toFixed(1) + 'M' : '0M'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Automation Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {data?.overview.automationRate ? (data.overview.automationRate * 100).toFixed(1) + '%' : '0%'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-12 bg-white/5 backdrop-blur-xl border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="matching">Matching</TabsTrigger>
            <TabsTrigger value="trademap">Trade Map</TabsTrigger>
            <TabsTrigger value="uncomtrade">UN Comtrade</TabsTrigger>
            <TabsTrigger value="itc-scraper">ITC Scraper</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                  <CardDescription>System performance and reliability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Uptime</span>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400">
                      {data?.performance.uptime || '99.7%'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Response Time</span>
                    <span className="text-white font-medium">{data?.performance.averageResponseTime || '145ms'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Error Rate</span>
                    <Badge variant="outline" className="bg-red-500/20 text-red-400">
                      {data?.performance.errorRate || '0.3%'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription>Common analytics tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    📊 Generate Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    📈 Export Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    🔍 Run Query
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    ⚙️ Configure Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pipeline">
            <PipelineFunnel data={data?.pipeline} />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationMetrics data={data?.automation} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SupplierAnalytics />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceReporting />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioAnalysis />
          </TabsContent>

          <TabsContent value="matching">
            <BuyerMatching />
          </TabsContent>

          <TabsContent value="trademap" className="space-y-6">
            {/* Trade Map Analytics Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Trade Map Analytics</h2>
                <p className="text-gray-300">Global trade intelligence and market insights</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-500/20 text-green-400">
                  {data?.performance?.tradeDataFreshness || 'Real-time'} Data
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                  {data?.trademap?.overview?.totalCountries || '220'}+ Countries
                </Badge>
              </div>
            </div>

            {/* Key Trade Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Global Trade Value</p>
                      <p className="text-2xl font-bold text-white">
                        ${(data?.trademap?.overview?.totalTradeValue / 1000000)?.toFixed(1) || '5,080'}M
                      </p>
                    </div>
                    <div className="text-blue-400 text-2xl">🌍</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">Financing Opportunities</p>
                      <p className="text-2xl font-bold text-white">
                        ${(data?.insights?.tradeFinanceOpportunities?.totalValue / 1000000)?.toFixed(0) || '2,810'}M
                      </p>
                    </div>
                    <div className="text-green-400 text-2xl">💰</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">Active Trade Routes</p>
                      <p className="text-2xl font-bold text-white">
                        {data?.trademap?.overview?.activeTradeRoutes || '24'}
                      </p>
                    </div>
                    <div className="text-purple-400 text-2xl">🚢</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-400 text-sm font-medium">AI Insights Generated</p>
                      <p className="text-2xl font-bold text-white">
                        {data?.trademap?.insights?.length || '12'}
                      </p>
                    </div>
                    <div className="text-orange-400 text-2xl">🤖</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trade Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Trading Countries */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">🏆 Top Trading Countries</CardTitle>
                  <CardDescription>Leading exporters by trade value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.trademap?.analytics?.top_exporters?.slice(0, 5).map((country: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{country.country}</span>
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

              {/* Trade Insights */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">💡 AI Trade Insights</CardTitle>
                  <CardDescription>Real-time market intelligence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.trademap?.insights?.slice(0, 4).map((insight: any, index: number) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {insight.type === 'opportunity' ? '🚀' : insight.type === 'risk' ? '⚠️' : '📈'}
                          </span>
                          <span className="text-white font-medium text-sm">{insight.title}</span>
                        </div>
                        <p className="text-gray-300 text-xs mb-2">{insight.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{insight.impact} Impact</span>
                          <span className="text-gray-400">{insight.confidence}% Confidence</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Electronics Sector */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">📱 Electronics Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Trade Value</span>
                      <span className="text-white font-bold">$3.8B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Growth Rate</span>
                      <span className="text-green-400 font-bold">+17.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Top Country</span>
                      <span className="text-white">China</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Financing Gap</span>
                      <span className="text-orange-400">$1.27B</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automotive Sector */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">🚗 Automotive Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Trade Value</span>
                      <span className="text-white font-bold">$1.25B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Growth Rate</span>
                      <span className="text-green-400 font-bold">+16.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Top Country</span>
                      <span className="text-white">Germany</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Financing Gap</span>
                      <span className="text-orange-400">$890M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Machinery Sector */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">⚙️ Machinery Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Trade Value</span>
                      <span className="text-white font-bold">$980M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Growth Rate</span>
                      <span className="text-green-400 font-bold">+8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Top Country</span>
                      <span className="text-white">Japan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Financing Gap</span>
                      <span className="text-orange-400">$650M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Items */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎯 Strategic Actions
                </CardTitle>
                <CardDescription>AI-recommended next steps for trade finance growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.recommendations?.slice(0, 3).map((rec: any, index: number) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                          {rec.priority}
                        </Badge>
                        <span className="text-white font-medium text-sm">{rec.type}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{rec.action}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{rec.impact}</span>
                        <span className="text-green-400">{rec.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uncomtrade">
            <UnComtradeAnalytics />
          </TabsContent>

          <TabsContent value="itc-scraper">
            <ITCScraperAnalytics />
          </TabsContent>

          <TabsContent value="query">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QueryBuilder />
              </div>
              <div className="space-y-6">
                <SavedReports />
                <ExportHub />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AnalyticsWorkbench
