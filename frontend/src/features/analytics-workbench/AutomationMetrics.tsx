import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface AutomationData {
  overallAutomationRate: number
  systems: {
    documentIntelligence: {
      automationRate: number
      processingTime: string
      accuracy: number
      stpRate: number
    }
    compliance: {
      automationRate: number
      processingTime: string
      accuracy: number
      stpRate: number
    }
    creditRisk: {
      automationRate: number
      processingTime: string
      accuracy: number
      stpRate: number
    }
    matching: {
      automationRate: number
      processingTime: string
      accuracy: number
      stpRate: number
    }
  }
  performance: {
    averageProcessingTime: string
    straightThroughProcessing: number
    errorRate: number
    customerSatisfaction: number
    uptime: number
  }
  monthlyImprovements: Array<{
    month: string
    automationRate: number
    errors: number
  }>
}

interface AutomationMetricsProps {
  data?: AutomationData
}

const AutomationMetrics: React.FC<AutomationMetricsProps> = ({ data }) => {
  if (!data) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading automation data...</div>
        </CardContent>
      </Card>
    )
  }

  const systems = [
    {
      key: 'documentIntelligence',
      name: 'Document Intelligence',
      icon: '📄',
      color: 'bg-blue-500'
    },
    {
      key: 'compliance',
      name: 'Compliance',
      icon: '🛡️',
      color: 'bg-green-500'
    },
    {
      key: 'creditRisk',
      name: 'Credit Risk',
      icon: '📊',
      color: 'bg-purple-500'
    },
    {
      key: 'matching',
      name: 'Buyer Matching',
      icon: '🎯',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Automation Performance Overview</CardTitle>
          <CardDescription>Overall automation metrics and system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {(data.overallAutomationRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Overall Automation</div>
              <Progress value={data.overallAutomationRate * 100} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {(data.performance.straightThroughProcessing * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Straight-Through Processing</div>
              <Progress value={data.performance.straightThroughProcessing * 100} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {data.performance.averageProcessingTime}
              </div>
              <div className="text-sm text-gray-400">Avg Processing Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {(data.performance.uptime * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">System Uptime</div>
              <Progress value={data.performance.uptime * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systems.map((system) => {
          const systemData = data.systems[system.key as keyof typeof data.systems]
          
          return (
            <Card key={system.key} className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-2xl">{system.icon}</span>
                  {system.name}
                </CardTitle>
                <CardDescription>Automation performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Automation Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={systemData.automationRate * 100} className="w-20 h-2" />
                      <span className="text-white font-medium w-12 text-right">
                        {(systemData.automationRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Processing Time</span>
                    <span className="text-white font-medium">{systemData.processingTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Accuracy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={systemData.accuracy * 100} className="w-20 h-2" />
                      <span className="text-white font-medium w-12 text-right">
                        {(systemData.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">STP Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={systemData.stpRate * 100} className="w-20 h-2" />
                      <span className="text-white font-medium w-12 text-right">
                        {(systemData.stpRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">System Performance</CardTitle>
          <CardDescription>Overall system health and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {(data.performance.errorRate * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">Error Rate</div>
              <Badge 
                variant="outline" 
                className={`mt-2 ${
                  data.performance.errorRate < 0.01 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {data.performance.errorRate < 0.01 ? 'Excellent' : 'Good'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {data.performance.customerSatisfaction.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-400">Customer Satisfaction</div>
              <Badge 
                variant="outline" 
                className={`mt-2 ${
                  data.performance.customerSatisfaction >= 4.5 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}
              >
                {data.performance.customerSatisfaction >= 4.5 ? 'Excellent' : 'Good'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {data.performance.averageProcessingTime}
              </div>
              <div className="text-sm text-gray-400">Avg Processing Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {(data.performance.straightThroughProcessing * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">STP Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Improvements */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Monthly Improvements</CardTitle>
          <CardDescription>Automation rate and error reduction trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyImprovements.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 w-20">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Automation:</span>
                    <Progress value={month.automationRate * 100} className="w-24 h-2" />
                    <span className="text-white font-medium w-12 text-right">
                      {(month.automationRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Errors:</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      month.errors < 30 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}
                  >
                    {month.errors}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AutomationMetrics }
