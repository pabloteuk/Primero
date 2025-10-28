import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const QueryBuilder: React.FC = () => {
  const [query, setQuery] = useState('')
  const [queryType, setQueryType] = useState('suppliers')
  const [filters, setFilters] = useState({
    region: '',
    industry: '',
    dateRange: '',
    minVolume: '',
    maxVolume: ''
  })
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const queryTemplates = [
    {
      name: 'Top Suppliers by Volume',
      query: 'SELECT * FROM suppliers ORDER BY predicted_volume DESC LIMIT 10',
      description: 'Get the top 10 suppliers by predicted volume'
    },
    {
      name: 'High-Risk Suppliers',
      query: 'SELECT * FROM suppliers WHERE credit_rating IN ("B", "B-", "CCC") AND ai_score < 70',
      description: 'Find suppliers with high risk indicators'
    },
    {
      name: 'Recent Applications',
      query: 'SELECT * FROM applications WHERE created_at >= NOW() - INTERVAL 7 DAY',
      description: 'Get applications from the last 7 days'
    },
    {
      name: 'Compliance Failures',
      query: 'SELECT * FROM compliance_checks WHERE status = "FAILED" AND created_at >= NOW() - INTERVAL 30 DAY',
      description: 'Find compliance failures in the last 30 days'
    }
  ]

  const handleRunQuery = async () => {
    setLoading(true)
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock results based on query type
      const mockResults = generateMockResults(queryType)
      setResults(mockResults)
    } catch (error) {
      console.error('Query execution error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockResults = (type: string) => {
    switch (type) {
      case 'suppliers':
        return Array.from({ length: 10 }, (_, i) => ({
          id: `supplier-${i + 1}`,
          name: `Supplier ${i + 1}`,
          region: ['Asia-Pacific', 'Europe', 'North America'][i % 3],
          industry: ['Manufacturing', 'Technology', 'Agriculture'][i % 3],
          volume: Math.floor(Math.random() * 5000000) + 1000000,
          score: Math.floor(Math.random() * 40) + 60
        }))
      case 'invoices':
        return Array.from({ length: 10 }, (_, i) => ({
          id: `invoice-${i + 1}`,
          amount: Math.floor(Math.random() * 1000000) + 50000,
          currency: 'USD',
          status: ['PENDING', 'APPROVED', 'REJECTED'][i % 3],
          created_at: new Date().toISOString()
        }))
      default:
        return []
    }
  }

  const handleTemplateSelect = (template: any) => {
    setQuery(template.query)
    setQueryType('custom')
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Query Builder</CardTitle>
          <CardDescription>Build and execute custom analytics queries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Query Templates */}
          <div>
            <Label className="text-white mb-3 block">Quick Templates</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {queryTemplates.map((template, index) => (
                <Card 
                  key={index} 
                  className="bg-white/5 backdrop-blur-xl border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-200"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium text-white mb-1">{template.name}</div>
                    <div className="text-sm text-gray-400">{template.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Query Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2 block">Query Type</Label>
              <Select value={queryType} onValueChange={setQueryType}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suppliers">Suppliers</SelectItem>
                  <SelectItem value="invoices">Invoices</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="matching">Buyer Matching</SelectItem>
                  <SelectItem value="custom">Custom SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Region</Label>
              <Select value={filters.region} onValueChange={(value) => setFilters({...filters, region: value})}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Latin America">Latin America</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Query Input */}
          <div>
            <Label className="text-white mb-2 block">SQL Query</Label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              className="bg-white/5 border-white/10 text-white min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Execute Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                {queryType.toUpperCase()}
              </Badge>
              {filters.region && (
                <Badge variant="outline" className="bg-green-500/20 text-green-400">
                  {filters.region}
                </Badge>
              )}
            </div>
            <Button 
              onClick={handleRunQuery} 
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Executing...' : 'Run Query'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Query Results</CardTitle>
            <CardDescription>{results.length} records found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {Object.keys(results[0] || {}).map((key) => (
                      <th key={key} className="text-left py-2 px-3 text-gray-300 font-medium">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-3 text-white">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { QueryBuilder }
