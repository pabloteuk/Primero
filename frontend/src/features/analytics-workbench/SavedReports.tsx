import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SavedReports: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Saved Reports</CardTitle>
        <CardDescription>Your saved analytics queries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center text-gray-400 py-4">
          No saved reports yet
        </div>
        <Button variant="outline" className="w-full">
          Create New Report
        </Button>
      </CardContent>
    </Card>
  )
}

export { SavedReports }
