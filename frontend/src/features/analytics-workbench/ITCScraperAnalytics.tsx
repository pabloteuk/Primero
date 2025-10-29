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
import { itcScraperAPI } from '@/services/api'
import {
  Globe,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Play,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Globe2
} from 'lucide-react'

interface ITCData {
  id: number
  country_code: string
  country_name: string
  partner_code: string
  partner_name: string
  product_code: string
  product_name: string
  trade_flow: string
  year: number
  trade_value_usd: number
  quantity: number
  quantity_unit: string
  market_share: number
  growth_rate: number
  data_source: string
  collected_at: string
}

interface ITCStats {
  total_records: number
  countries_count: number
  partners_count: number
  total_value: number
  last_updated: string
}

export const ITCScraperAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ITCData[]>([])
  const [stats, setStats] = useState<ITCStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [collectionProgress, setCollectionProgress] = useState(0)

  // Query parameters
  const [queryParams, setQueryParams] = useState({
    countryCode: '',
    year: '2023',
    limit: '100'
  })

  // Load initial data
  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await itcScraperAPI.getStatistics()
      if (response.data.success) {
        setStats(response.data.data)
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

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        countryCode: queryParams.countryCode || undefined,
        year: parseInt(queryParams.year),
        limit: parseInt(queryParams.limit)
      }

      const response = await itcScraperAPI.getData(params)
      if (response.data.success) {
        setData(response.data.data)
      } else {
        setError(response.data.error || 'Failed to load data')
      }
    } catch (err) {
      setError('Network error while loading data')
      console.error('Data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const startDataCollection = async () => {
    setCollectionStatus('running')
    setCollectionProgress(0)

    try {
      const response = await itcScraperAPI.collectMajorCountries()
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
        }, 3000)
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

  const extractCountryData = async (countryCode: string) => {
    try {
      const response = await itcScraperAPI.extractCountry(countryCode, parseInt(queryParams.year))
      if (response.data.success) {
        console.log('Country data extracted:', response.data.data)
        // Reload data after extraction
        loadData()
      } else {
        setError(response.data.error || 'Failed to extract country data')
      }
    } catch (err) {
      setError('Network error during country extraction')
      console.error('Extraction error:', err)
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
          <h2 className="text-2xl font-bold text-white">ITC Trade Map Analytics</h2>
          <p className="text-gray-300">International Trade Centre market analysis and trade flow data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(collectionStatus)}>
            {getStatusIcon(collectionStatus)}
            <span className="ml-1 capitalize">{collectionStatus}</span>
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            <Globe2 className="h-3 w-3 mr-1" />
            {stats?.countries_count || 0} Countries
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      {collectionStatus === 'running' && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            ITC data collection in progress... {collectionProgress}% complete
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
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_records?.toLocaleString() || '0'}</p>
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
                      {stats?.total_value ? formatCurrency(stats.total_value) : '$0'}
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
                    <p className="text-2xl font-bold text-gray-900">{stats?.countries_count || '0'}</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trading Partners</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.partners_count || '0'}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent ITC Trade Data</CardTitle>
              <CardDescription>Latest trade statistics from ITC Trade Map</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <Label htmlFor="country">Country Code</Label>
                    <Input
                      id="country"
                      placeholder="e.g., USA"
                      value={queryParams.countryCode}
                      onChange={(e) => setQueryParams({...queryParams, countryCode: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={queryParams.year} onValueChange={(value) => setQueryParams({...queryParams, year: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="limit">Limit</Label>
                    <Select value={queryParams.limit} onValueChange={(value) => setQueryParams({...queryParams, limit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={loadData} disabled={loading} className="self-end">
                  {loading ? 'Loading...' : 'Load Data'}
                </Button>
              </div>

              {data.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Flow</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Year</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 10).map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium">{item.country_code}</TableCell>
                          <TableCell>{item.partner_name || item.partner_code}</TableCell>
                          <TableCell>
                            <Badge variant={item.trade_flow === 'Export' ? 'default' : 'secondary'}>
                              {item.trade_flow}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.trade_value_usd)}
                          </TableCell>
                          <TableCell>{item.product_name || item.product_code}</TableCell>
                          <TableCell>{item.year}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {loading ? 'Loading data...' : 'No data loaded. Click "Load Data" to fetch ITC trade data.'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tab */}
        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated ITC Data Collection</CardTitle>
              <CardDescription>
                Collect trade data from ITC Trade Map using web scraping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ITC data collection uses web scraping and may take several minutes to complete.
                  The scraper navigates through ITC Trade Map pages to extract trade statistics.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Major Countries Collection</h4>
                  <p className="text-sm text-gray-600">
                    Collect trade data from USA, China, Germany, Japan, and other major economies
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

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Individual Country Extraction</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="extract-country">Country Code:</Label>
                    <Input
                      id="extract-country"
                      placeholder="USA"
                      className="w-20"
                      maxLength={3}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('extract-country') as HTMLInputElement
                      if (input.value) {
                        extractCountryData(input.value.toUpperCase())
                      }
                    }}
                  >
                    Extract Country Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>ITC Trade Map data collection methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">ITC Trade Map</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Official ITC trade statistics with market analysis and trade flow data
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">Web Scraping</Badge>
                    <Badge variant="outline">Real-time Data</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Market Intelligence</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Trade performance indicators, market shares, and growth analysis
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">Analytics Ready</Badge>
                    <Badge variant="outline">Global Coverage</Badge>
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
              <CardTitle>ITC Trade Flow Analysis</CardTitle>
              <CardDescription>Advanced market analysis from ITC Trade Map data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analysis Coming Soon</h3>
                <p className="text-gray-500">
                  Market opportunity identification, trade flow analysis, and predictive modeling from ITC data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ITC Data Export</CardTitle>
              <CardDescription>Export collected ITC trade data for external analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Export Features Coming Soon</h3>
                <p className="text-gray-500">
                  CSV, JSON, and Excel export options with filtering and ITC-specific formatting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
