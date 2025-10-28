import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ExportHub: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Export Hub</CardTitle>
        <CardDescription>Export data in various formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          📊 Export to CSV
        </Button>
        <Button variant="outline" className="w-full justify-start">
          📈 Export to Excel
        </Button>
        <Button variant="outline" className="w-full justify-start">
          📄 Export to PDF
        </Button>
        <Button variant="outline" className="w-full justify-start">
          🔗 Share Link
        </Button>
      </CardContent>
    </Card>
  )
}

export { ExportHub }
