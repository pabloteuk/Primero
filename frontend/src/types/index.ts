export interface TradeData {
  id: string;
  timestamp: string;
  value: number;
  currency: string;
  region: string;
  type: 'import' | 'export' | 'lc_volume' | 'trade_gap';
}

export interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  description: string;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  region?: string;
  category?: string;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'risk';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WorldBankData {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  countryiso3code: string;
  date: string;
  value: number;
  unit: string;
  obs_status: string;
  decimal: number;
}

export interface TradeFinanceMetrics {
  globalTradeVolume: number;
  tradeFinanceGap: number;
  lcMarketSize: number;
  digitalPenetration: number;
  lastUpdated: string;
}

export interface PredictionData {
  date: string;
  predicted: number;
  confidence: number;
  actual?: number;
}

export interface RegionData {
  name: string;
  code: string;
  tradeVolume: number;
  lcVolume: number;
  gap: number;
  growth: number;
}
