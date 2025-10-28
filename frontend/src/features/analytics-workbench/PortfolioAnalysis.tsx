import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const PortfolioAnalysis: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Analysis</CardTitle>
        <CardDescription>Investment-grade selection and quality metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-400 py-8">
          Portfolio analysis coming soon...
        </div>
      </CardContent>
    </Card>
  )
}

export { PortfolioAnalysis }
