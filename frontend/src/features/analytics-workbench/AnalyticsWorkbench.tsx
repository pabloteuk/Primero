import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { analyticsAPI } from '@/services/api'
import { PipelineFunnel } from './PipelineFunnel'
import { AutomationMetrics } from './AutomationMetrics'
import { SupplierAnalytics } from './SupplierAnalytics'
import { ComplianceReporting } from './ComplianceReporting'
import { PortfolioAnalysis } from './PortfolioAnalysis'
import { BuyerMatching } from './BuyerMatching'
import { QueryBuilder } from './QueryBuilder'
import { SavedReports } from './SavedReports'
import { ExportHub } from './ExportHub'

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
      const response = await analyticsAPI.getDashboard()
      setData(response.data.data)
      setError(null)
    } catch (err) {
      console.error('Error loading analytics data:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/5 backdrop-blur-xl border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="matching">Matching</TabsTrigger>
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
