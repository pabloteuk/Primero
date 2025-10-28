import axios from 'axios'
import { WorldBankData, TradeData, RegionData, PredictionData } from '../types'

const API_BASE_URL = 'https://api.worldbank.org/v2'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

class APIService {
  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = cache.get(key)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }
    
    try {
      const data = await fetcher()
      cache.set(key, { data, timestamp: now })
      return data
    } catch (error) {
      console.error(`API Error for ${key}:`, error)
      throw error
    }
  }

  async getTradeIndicators(): Promise<WorldBankData[]> {
    return this.getCachedData('trade-indicators', async () => {
      const response = await axios.get(`${API_BASE_URL}/country/all/indicator/NY.GDP.MKTP.CD`, {
        params: {
          format: 'json',
          per_page: 1000,
          date: '2020:2024'
        }
      })
      return response.data[1] || []
    })
  }

  async getLogisticsPerformanceIndex(): Promise<WorldBankData[]> {
    return this.getCachedData('lpi', async () => {
      const response = await axios.get(`${API_BASE_URL}/country/all/indicator/LP.LPI.OVRL.XQ`, {
        params: {
          format: 'json',
          per_page: 1000,
          date: '2020:2024'
        }
      })
      return response.data[1] || []
    })
  }

  async getTariffRates(): Promise<WorldBankData[]> {
    return this.getCachedData('tariffs', async () => {
      const response = await axios.get(`${API_BASE_URL}/country/all/indicator/TM.TAX.MRCH.WM.AR.ZS`, {
        params: {
          format: 'json',
          per_page: 1000,
          date: '2020:2024'
        }
      })
      return response.data[1] || []
    })
  }

  // Generate synthetic trade finance data
  generateSyntheticTradeData(): TradeData[] {
    const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Africa', 'Middle East']
    const types = ['import', 'export', 'lc_volume', 'trade_gap'] as const
    const data: TradeData[] = []
    
    const now = new Date()
    for (let i = 0; i < 1000; i++) {
      const daysAgo = Math.floor(Math.random() * 365)
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      
      data.push({
        id: `trade-${i}`,
        timestamp: date.toISOString(),
        value: Math.random() * 1000000000 + 10000000,
        currency: 'USD',
        region: regions[Math.floor(Math.random() * regions.length)],
        type: types[Math.floor(Math.random() * types.length)]
      })
    }
    
    return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  generateRegionData(): RegionData[] {
    return [
      {
        name: 'Asia-Pacific',
        code: 'APAC',
        tradeVolume: 12500000000000,
        lcVolume: 3200000000000,
        gap: 450000000000,
        growth: 8.2
      },
      {
        name: 'Europe',
        code: 'EUR',
        tradeVolume: 9800000000000,
        lcVolume: 2800000000000,
        gap: 320000000000,
        growth: 5.1
      },
      {
        name: 'North America',
        code: 'NA',
        tradeVolume: 8200000000000,
        lcVolume: 2100000000000,
        gap: 280000000000,
        growth: 6.8
      },
      {
        name: 'Latin America',
        code: 'LATAM',
        tradeVolume: 1800000000000,
        lcVolume: 450000000000,
        gap: 180000000000,
        growth: 12.3
      },
      {
        name: 'Middle East',
        code: 'ME',
        tradeVolume: 1200000000000,
        lcVolume: 320000000000,
        gap: 120000000000,
        growth: 9.7
      },
      {
        name: 'Africa',
        code: 'AFR',
        tradeVolume: 800000000000,
        lcVolume: 180000000000,
        gap: 150000000000,
        growth: 15.2
      }
    ]
  }

  generatePredictions(): PredictionData[] {
    const predictions: PredictionData[] = []
    const now = new Date()
    
    for (let i = 1; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const baseValue = 28500000000000 // $28.5T base
      const growth = 0.02 + Math.random() * 0.08 // 2-10% growth
      const predicted = baseValue * (1 + growth * i / 12)
      
      predictions.push({
        date: date.toISOString(),
        predicted,
        confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
      })
    }
    
    return predictions
  }
}

export const apiService = new APIService()
