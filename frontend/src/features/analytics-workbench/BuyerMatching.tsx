import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const BuyerMatching: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Buyer Matching</CardTitle>
        <CardDescription>Institutional allocation and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-400 py-8">
          Buyer matching analytics coming soon...
        </div>
      </CardContent>
    </Card>
  )
}

export { BuyerMatching }
