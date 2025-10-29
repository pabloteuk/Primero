"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { unComtradeAPI } from '@/services/api'
import {
  BarChart3,
  Download,
  Globe,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Play,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface TradeData {
  reporter_code: string
  reporter_desc: string
  partner_code: string
  partner_desc: string
  trade_flow_code: string
  trade_flow_desc: string
  total_value: number
  total_quantity: string
  record_count: number
}

export const UnComtradeAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TradeData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [collectionProgress, setCollectionProgress] = useState(0)

  // Query parameters
  const [queryParams, setQueryParams] = useState({
    period: '2023',
    reporterCode: '',
    typeCode: 'C',
    freqCode: 'A',
    clCode: 'HS'
  })

  // Initialize tables on component mount
  useEffect(() => {
    initializeTables()
  }, [])

  const initializeTables = async () => {
    try {
      await unComtradeAPI.initializeTables()
      console.log('✅ UN Comtrade tables initialized')
    } catch (error) {
      console.error('❌ Failed to initialize tables:', error)
    }
  }

  const loadStatistics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await unComtradeAPI.getStatistics(queryParams)
      if (response.data.success) {
        setData(response.data.data)
      } else {
        setError(response.data.error || 'Failed to load statistics')
      }
    } catch (err) {
      setError('Network error while loading statistics')
      console.error('Statistics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const startDataCollection = async () => {
    setCollectionStatus('running')
    setCollectionProgress(0)

    try {
      const response = await unComtradeAPI.collectMajorCountries()
      if (response.data.success) {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setCollectionProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              setCollectionStatus('completed')
              // Reload statistics after collection
              loadStatistics()
              return 100
            }
            return prev + 10
          })
        }, 2000)
      } else {
        setCollectionStatus('error')
        setError(response.data.error || 'Failed to start data collection')
      }
    } catch (err) {
      setCollectionStatus('error')
      setError('Network error during data collection')
      console.error('Collection error:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">UN Comtrade Analytics</h2>
          <p className="text-gray-300">Global trade data from United Nations Comtrade Database</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(collectionStatus)}>
            {getStatusIcon(collectionStatus)}
            <span className="ml-1 capitalize">{collectionStatus}</span>
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Database className="h-3 w-3 mr-1" />
            {data.length} Records
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      {collectionStatus === 'running' && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Data collection in progress... {collectionProgress}% complete
            <Progress value={collectionProgress} className="mt-2" />
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="analysis">Trade Analysis</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{data.length.toLocaleString()}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Trade Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(data.reduce((sum, item) => sum + item.total_value, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Countries Covered</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(data.map(item => item.reporter_code)).size}
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trade Partners</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(data.map(item => item.partner_code)).size}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trade Data</CardTitle>
              <CardDescription>Latest trade statistics from UN Comtrade</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadStatistics} disabled={loading} className="mb-4">
                {loading ? 'Loading...' : 'Load Statistics'}
              </Button>

              {data.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Flow</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Records</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.reporter_desc}</TableCell>
                          <TableCell>{item.partner_desc}</TableCell>
                          <TableCell>
                            <Badge variant={item.trade_flow_code === 'X' ? 'default' : 'secondary'}>
                              {item.trade_flow_desc}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.total_value)}
                          </TableCell>
                          <TableCell className="text-right">{item.record_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {loading ? 'Loading data...' : 'No data loaded. Click "Load Statistics" to fetch trade data.'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tab */}
        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Data Collection</CardTitle>
              <CardDescription>
                Collect trade data from major global economies using UN Comtrade API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={queryParams.period}
                    onValueChange={(value) => setQueryParams({...queryParams, period: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeCode">Trade Type</Label>
                  <Select
                    value={queryParams.typeCode}
                    onValueChange={(value) => setQueryParams({...queryParams, typeCode: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">Goods (C)</SelectItem>
                      <SelectItem value="S">Services (S)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Major Countries Collection</h4>
                  <p className="text-sm text-gray-600">
                    Collect trade data from USA, China, Japan, Germany, and other major economies
                  </p>
                </div>
                <Button
                  onClick={startDataCollection}
                  disabled={collectionStatus === 'running'}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Collection
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Available data collection methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">UN Comtrade API</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Official UN trade statistics database with comprehensive global coverage
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">250K+ records</Badge>
                    <Badge variant="outline">220+ countries</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">ITC Trade Map</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    International Trade Centre market analysis and trade flow data
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">Real-time data</Badge>
                    <Badge variant="outline">Market insights</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trade Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Flow Analysis</CardTitle>
              <CardDescription>Analyze trade patterns and market opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analysis Coming Soon</h3>
                <p className="text-gray-500">
                  Trade flow analysis, market opportunity identification, and predictive modeling features
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export trade data for external analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Export Features Coming Soon</h3>
                <p className="text-gray-500">
                  CSV, JSON, and Excel export options with filtering and aggregation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
