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
import { analyticsAPI } from '@/services/api'

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
      const response = await analyticsAPI.getDashboard()
      setData(response.data.data)
      setError(null)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
            value={data?.overview?.totalSuppliers?.toLocaleString() || '1,247'}
            change="+7.8%"
            changeType="positive"
            icon="🏢"
            description="supplier network growth"
          />
          <MetricCard
            title="Active Deals"
            value={data?.overview?.activeDeals?.toLocaleString() || '89'}
            change="+8.2%"
            changeType="positive"
            icon="💼"
            description="vs last month"
          />
          <MetricCard
            title="Total Value"
            value={`$${data?.overview?.totalValue ? (data.overview.totalValue / 1000000).toFixed(1) + 'M' : '125M'}`}
            change="+12.5%"
            changeType="positive"
            icon="💰"
            description="portfolio growth"
          />
          <MetricCard
            title="Automation Rate"
            value={`${data?.overview?.automationRate ? (data.overview.automationRate * 100).toFixed(1) + '%' : '85%'}`}
            change="+3.2%"
            changeType="positive"
            icon="🤖"
            description="monthly improvement"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-xl border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="origination">Origination</TabsTrigger>
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
