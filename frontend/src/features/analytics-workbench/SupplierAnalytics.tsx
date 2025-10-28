import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const SupplierAnalytics: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Supplier Analytics</CardTitle>
        <CardDescription>Lead source performance and geographic distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-400 py-8">
          Supplier analytics coming soon...
        </div>
      </CardContent>
    </Card>
  )
}

export { SupplierAnalytics }
