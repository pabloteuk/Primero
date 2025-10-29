"use client"

import React, { useState } from 'react'
import { Search, Filter, MapPin, Star, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { tradeMapAPI } from '@/services/api'

interface Supplier {
  id: string
  name: string
  country: string
  sector: string
  annualRevenue: number
  employeeCount: number
  riskScore: number
  complianceStatus: string
  rating: number
  distance?: number
}

interface SupplierSearchProps {
  onSupplierSelect?: (supplier: Supplier) => void
  maxResults?: number
}

export const SupplierSearch: React.FC<SupplierSearchProps> = ({
  onSupplierSelect,
  maxResults = 20
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    country: '',
    sector: '',
    minRevenue: '',
    maxRisk: '',
    complianceOnly: true,
    verifiedOnly: false
  })
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock supplier data - in production this would come from tradeMapAPI
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Huawei Technologies Co., Ltd.',
      country: 'China',
      sector: 'Telecommunications',
      annualRevenue: 100000000000,
      employeeCount: 195000,
      riskScore: 25,
      complianceStatus: 'Compliant',
      rating: 4.8,
      distance: 45
    },
    {
      id: '2',
      name: 'Volkswagen AG',
      country: 'Germany',
      sector: 'Automotive',
      annualRevenue: 295000000000,
      employeeCount: 670000,
      riskScore: 15,
      complianceStatus: 'Compliant',
      rating: 4.6,
      distance: 120
    },
    {
      id: '3',
      name: 'Sony Corporation',
      country: 'Japan',
      sector: 'Electronics',
      annualRevenue: 85000000000,
      employeeCount: 109700,
      riskScore: 20,
      complianceStatus: 'Compliant',
      rating: 4.7,
      distance: 85
    },
    {
      id: '4',
      name: 'Samsung Electronics',
      country: 'South Korea',
      sector: 'Electronics',
      annualRevenue: 200000000000,
      employeeCount: 320000,
      riskScore: 18,
      complianceStatus: 'Compliant',
      rating: 4.5,
      distance: 65
    },
    {
      id: '5',
      name: 'Siemens AG',
      country: 'Germany',
      sector: 'Industrial',
      annualRevenue: 72000000000,
      employeeCount: 320000,
      riskScore: 12,
      complianceStatus: 'Compliant',
      rating: 4.9,
      distance: 115
    }
  ]

  const handleSearch = async () => {
    setLoading(true)
    try {
      // In production, this would call tradeMapAPI
      // const response = await tradeMapAPI.search(searchQuery, 'companies')
      // setSuppliers(response.data)

      // For now, filter mock data
      const filtered = mockSuppliers.filter(supplier => {
        const matchesQuery = !searchQuery ||
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.sector.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCountry = !filters.country || supplier.country === filters.country
        const matchesSector = !filters.sector || supplier.sector === filters.sector
        const matchesRevenue = !filters.minRevenue ||
          supplier.annualRevenue >= parseInt(filters.minRevenue) * 1000000
        const matchesCompliance = !filters.complianceOnly ||
          supplier.complianceStatus === 'Compliant'
        const matchesRisk = !filters.maxRisk ||
          supplier.riskScore <= parseInt(filters.maxRisk)

        return matchesQuery && matchesCountry && matchesSector &&
               matchesRevenue && matchesCompliance && matchesRisk
      })

      setSuppliers(filtered.slice(0, maxResults))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-100'
    if (score <= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    return `$${amount.toLocaleString()}`
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Global Supplier Search
              </CardTitle>
              <CardDescription>
                Find verified suppliers across 220+ countries with real-time compliance data
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {suppliers.length} Results
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suppliers by name, sector, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {(filters.country || filters.sector || filters.minRevenue) && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {(filters.country ? 1 : 0) + (filters.sector ? 1 : 0) + (filters.minRevenue ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Search Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({
                        country: '',
                        sector: '',
                        minRevenue: '',
                        maxRisk: '',
                        complianceOnly: true,
                        verifiedOnly: false
                      })}
                    >
                      Clear All
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={filters.country} onValueChange={(value) =>
                        setFilters({...filters, country: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="South Korea">South Korea</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Select value={filters.sector} onValueChange={(value) =>
                        setFilters({...filters, sector: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Automotive">Automotive</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minRevenue">Min Revenue ($M)</Label>
                      <Input
                        id="minRevenue"
                        type="number"
                        placeholder="1000"
                        value={filters.minRevenue}
                        onChange={(e) => setFilters({...filters, minRevenue: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxRisk">Max Risk Score</Label>
                      <Select value={filters.maxRisk} onValueChange={(value) =>
                        setFilters({...filters, maxRisk: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="20">Low (≤20)</SelectItem>
                          <SelectItem value="40">Medium (≤40)</SelectItem>
                          <SelectItem value="60">High (≤60)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="compliance"
                        checked={filters.complianceOnly}
                        onCheckedChange={(checked) =>
                          setFilters({...filters, complianceOnly: !!checked})
                        }
                      />
                      <Label htmlFor="compliance">Compliance verified only</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verifiedOnly}
                        onCheckedChange={(checked) =>
                          setFilters({...filters, verifiedOnly: !!checked})
                        }
                      />
                      <Label htmlFor="verified">Trade verified suppliers</Label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Results */}
          {suppliers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Search Results</h3>
                <Badge variant="outline">{suppliers.length} suppliers found</Badge>
              </div>

              <div className="grid gap-4">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onSupplierSelect?.(supplier)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{supplier.name}</h4>
                            <Badge variant="outline" className={getRiskColor(supplier.riskScore)}>
                              Risk: {supplier.riskScore}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {supplier.complianceStatus}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {supplier.country}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              {formatCurrency(supplier.annualRevenue)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {supplier.employeeCount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              {supplier.rating}/5.0
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant="secondary">{supplier.sector}</Badge>
                            {supplier.distance && (
                              <span className="text-sm text-gray-500">
                                {supplier.distance}km away
                              </span>
                            )}
                          </div>
                        </div>

                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation()
                          onSupplierSelect?.(supplier)
                        }}>
                          Select Supplier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {suppliers.length === 0 && searchQuery && !loading && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button variant="outline" onClick={() => setShowFilters(true)}>
                Adjust Filters
              </Button>
            </div>
          )}

          {!searchQuery && !loading && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search Global Suppliers</h3>
              <p className="text-gray-500">
                Enter a supplier name, sector, or location to find verified trading partners
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
