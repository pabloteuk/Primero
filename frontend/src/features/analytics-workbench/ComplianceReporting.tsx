import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ComplianceReporting: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Compliance Reporting</CardTitle>
        <CardDescription>KYC/AML/UBO metrics and audit trails</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-400 py-8">
          Compliance reporting coming soon...
        </div>
      </CardContent>
    </Card>
  )
}

export { ComplianceReporting }
