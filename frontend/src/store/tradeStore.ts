import { create } from 'zustand'
import { TradeData, AIInsight, TradeFinanceMetrics, RegionData, PredictionData } from '../types'

interface TradeStore {
  // Data
  tradeData: TradeData[]
  aiInsights: AIInsight[]
  metrics: TradeFinanceMetrics | null
  regionData: RegionData[]
  predictions: PredictionData[]
  
  // UI State
  isLoading: boolean
  lastUpdated: string | null
  selectedRegion: string | null
  
  // Actions
  setTradeData: (data: TradeData[]) => void
  setAIInsights: (insights: AIInsight[]) => void
  setMetrics: (metrics: TradeFinanceMetrics) => void
  setRegionData: (data: RegionData[]) => void
  setPredictions: (predictions: PredictionData[]) => void
  setLoading: (loading: boolean) => void
  setSelectedRegion: (region: string | null) => void
  updateLastUpdated: () => void
  
  // Computed values
  getFilteredData: () => TradeData[]
  getTopRegions: () => RegionData[]
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  // Initial state
  tradeData: [],
  aiInsights: [],
  metrics: null,
  regionData: [],
  predictions: [],
  isLoading: true,
  lastUpdated: null,
  selectedRegion: null,
  
  // Actions
  setTradeData: (data) => set({ tradeData: data }),
  setAIInsights: (insights) => set({ aiInsights: insights }),
  setMetrics: (metrics) => set({ metrics }),
  setRegionData: (data) => set({ regionData: data }),
  setPredictions: (predictions) => set({ predictions }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  updateLastUpdated: () => set({ lastUpdated: new Date().toISOString() }),
  
  // Computed values
  getFilteredData: () => {
    const { tradeData, selectedRegion } = get()
    if (!selectedRegion) return tradeData
    return tradeData.filter(data => data.region === selectedRegion)
  },
  
  getTopRegions: () => {
    const { regionData } = get()
    return regionData
      .sort((a, b) => b.tradeVolume - a.tradeVolume)
      .slice(0, 10)
  }
}))
