import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface PipelineData {
  funnel: {
    discovered: { count: number; percentage: number }
    contacted: { count: number; percentage: number }
    applied: { count: number; percentage: number }
    verified: { count: number; percentage: number }
    funded: { count: number; percentage: number }
  }
  conversionRates: {
    discoveryToContact: number
    contactToApplication: number
    applicationToVerification: number
    verificationToFunding: number
    overallConversion: number
  }
  timeInStage: {
    discovery: string
    contact: string
    application: string
    verification: string
    funding: string
    total: string
  }
  dropOffReasons: {
    [key: string]: number
  }
}

interface PipelineFunnelProps {
  data?: PipelineData
}

const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ data }) => {
  if (!data) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading pipeline data...</div>
        </CardContent>
      </Card>
    )
  }

  const stages = [
    { key: 'discovered', label: 'Discovered', color: 'bg-blue-500' },
    { key: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
    { key: 'applied', label: 'Applied', color: 'bg-indigo-500' },
    { key: 'verified', label: 'Verified', color: 'bg-pink-500' },
    { key: 'funded', label: 'Funded', color: 'bg-green-500' }
  ]

  const conversionRates = [
    { from: 'Discovery', to: 'Contact', rate: data.conversionRates.discoveryToContact },
    { from: 'Contact', to: 'Application', rate: data.conversionRates.contactToApplication },
    { from: 'Application', to: 'Verification', rate: data.conversionRates.applicationToVerification },
    { from: 'Verification', to: 'Funding', rate: data.conversionRates.verificationToFunding }
  ]

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Origination Pipeline Funnel</CardTitle>
          <CardDescription>Conversion rates through each stage of the origination process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const stageData = data.funnel[stage.key as keyof typeof data.funnel]
              const isLast = index === stages.length - 1
              
              return (
                <div key={stage.key} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <span className="text-white font-medium">{stage.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{stageData.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">{stageData.percentage}% of total</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div 
                        className={`h-full ${stage.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${stageData.percentage}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {stageData.percentage}%
                      </span>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="flex justify-center mt-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">
                          {conversionRates[index]?.rate ? (conversionRates[index].rate * 100).toFixed(1) + '%' : '0%'}
                        </div>
                        <div className="w-0.5 h-4 bg-gray-600 mx-auto"></div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rates */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Conversion Rates</CardTitle>
            <CardDescription>Stage-to-stage conversion performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversionRates.map((conversion, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">{conversion.from}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-300">{conversion.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={conversion.rate * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-white font-medium w-12 text-right">
                    {(conversion.rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">Overall Conversion</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                {(data.conversionRates.overallConversion * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Time in Stage */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Time in Stage</CardTitle>
            <CardDescription>Average processing time for each stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.timeInStage).map(([stage, time]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{stage.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-white font-medium">{time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Analysis */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Drop-off Analysis</CardTitle>
          <CardDescription>Reasons for pipeline drop-offs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.dropOffReasons)
              .sort(([,a], [,b]) => b - a)
              .map(([reason, percentage]) => (
                <div key={reason} className="flex items-center justify-between">
                  <span className="text-gray-300">{reason}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={percentage * 100} 
                      className="w-32 h-2"
                    />
                    <span className="text-white font-medium w-12 text-right">
                      {(percentage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { PipelineFunnel }
