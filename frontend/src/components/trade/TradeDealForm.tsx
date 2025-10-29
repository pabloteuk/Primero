"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  FileText,
  Calculator,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { tradeMapAPI } from '@/services/api'

const tradeDealSchema = z.object({
  // Supplier Information
  supplierId: z.string().min(1, 'Supplier selection is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),

  // Buyer Information
  buyerId: z.string().min(1, 'Buyer selection is required'),
  buyerName: z.string().min(1, 'Buyer name is required'),

  // Deal Details
  dealType: z.enum(['invoice_financing', 'supply_chain_finance', 'export_credit', 'purchase_order_finance']),
  currency: z.string().min(1, 'Currency is required'),
  dealAmount: z.number().min(1000, 'Minimum deal amount is $1,000'),
  advanceRate: z.number().min(0.1).max(1, 'Advance rate must be between 10% and 100%'),

  // Terms
  tenorDays: z.number().min(30, 'Minimum tenor is 30 days').max(360, 'Maximum tenor is 360 days'),
  interestRate: z.number().min(0).max(0.5, 'Interest rate cannot exceed 50%'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),

  // Documents
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  goodsDescription: z.string().min(10, 'Goods description must be at least 10 characters'),

  // Compliance & Risk
  complianceVerified: z.boolean(),
  riskAssessment: z.enum(['low', 'medium', 'high']),
  specialConditions: z.string().optional(),

  // Internal Notes
  internalNotes: z.string().optional(),
})

type TradeDealFormData = z.infer<typeof tradeDealSchema>

interface TradeDealFormProps {
  onSubmit?: (data: TradeDealFormData) => void
  onCancel?: () => void
  initialData?: Partial<TradeDealFormData>
}

export const TradeDealForm: React.FC<TradeDealFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)

  const form = useForm<TradeDealFormData>({
    resolver: zodResolver(tradeDealSchema),
    defaultValues: {
      dealType: 'invoice_financing',
      currency: 'USD',
      advanceRate: 0.8,
      tenorDays: 90,
      interestRate: 0.05,
      paymentTerms: 'Net 90',
      complianceVerified: false,
      riskAssessment: 'medium',
      ...initialData
    }
  })

  const steps = [
    { id: 1, title: 'Parties', description: 'Supplier & Buyer' },
    { id: 2, title: 'Deal Terms', description: 'Amount & Conditions' },
    { id: 3, title: 'Documents', description: 'Invoice Details' },
    { id: 4, title: 'Compliance', description: 'Risk & Verification' },
    { id: 5, title: 'Review', description: 'Final Confirmation' }
  ]

  const handleSubmit = async (data: TradeDealFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate validation progress
      for (let i = 0; i <= 100; i += 10) {
        setValidationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Call the API (would be implemented)
      // await tradeMapAPI.createDeal(data)

      console.log('Trade deal created:', data)
      onSubmit?.(data)
    } catch (error) {
      console.error('Failed to create trade deal:', error)
    } finally {
      setIsSubmitting(false)
      setValidationProgress(0)
    }
  }

  const calculateFinancingAmount = () => {
    const dealAmount = form.watch('dealAmount') || 0
    const advanceRate = form.watch('advanceRate') || 0
    return dealAmount * advanceRate
  }

  const calculateInterestAmount = () => {
    const financingAmount = calculateFinancingAmount()
    const interestRate = form.watch('interestRate') || 0
    const tenorDays = form.watch('tenorDays') || 0
    return financingAmount * interestRate * (tenorDays / 365)
  }

  if (isSubmitting) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Creating Trade Deal</h3>
              <p className="text-gray-600 mb-4">Validating terms and generating financing agreement...</p>
              <Progress value={validationProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2">{validationProgress}% complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Create Trade Finance Deal
              </CardTitle>
              <CardDescription>
                Set up a new trade finance transaction with automated compliance and risk assessment
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      step.id <= currentStep ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

              {/* Step 1: Parties */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Transaction Parties</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Supplier (Seller)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="supplierId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Supplier ID</FormLabel>
                              <FormControl>
                                <Input placeholder="SUP-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="supplierName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="ABC Manufacturing Ltd." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Buyer (Purchaser)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="buyerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buyer ID</FormLabel>
                              <FormControl>
                                <Input placeholder="BUY-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="buyerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="XYZ Trading Corp." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 2: Deal Terms */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Deal Terms & Financing</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="dealType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select deal type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="invoice_financing">Invoice Financing</SelectItem>
                                <SelectItem value="supply_chain_finance">Supply Chain Finance</SelectItem>
                                <SelectItem value="export_credit">Export Credit</SelectItem>
                                <SelectItem value="purchase_order_finance">Purchase Order Finance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dealAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>Invoice or purchase order value</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="advanceRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advance Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.1"
                                max="1"
                                placeholder="0.80"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>Percentage of deal amount to finance</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tenorDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenor (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="30"
                                max="360"
                                placeholder="90"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interest Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="0.5"
                                placeholder="0.05"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Terms</FormLabel>
                            <FormControl>
                              <Input placeholder="Net 90" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Financing Summary */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Financing Amount:</span>
                              <span className="font-semibold">${calculateFinancingAmount().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Interest Amount:</span>
                              <span className="font-semibold">${calculateInterestAmount().toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Total Repayment:</span>
                              <span>${(calculateFinancingAmount() + calculateInterestAmount()).toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Invoice & Goods Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input placeholder="INV-2024-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="goodsDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goods Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed description of goods or services..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Provide detailed description for compliance verification</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Compliance */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold">Compliance & Risk Assessment</h3>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      All parties and transactions are automatically screened against global sanctions lists,
                      PEP databases, and adverse media sources.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="complianceVerified"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Compliance Verified
                              </FormLabel>
                              <FormDescription>
                                Confirm all parties have passed KYC/AML screening
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="riskAssessment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Risk Assessment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select risk level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low Risk</SelectItem>
                                <SelectItem value="medium">Medium Risk</SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Overall risk assessment for this transaction
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="specialConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Conditions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special conditions or requirements..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: Specify any special terms or conditions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="internalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Internal Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Internal notes for the deal team..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Review & Confirmation</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Transaction Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="font-medium">{form.watch('supplierName')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Buyer:</span>
                          <span className="font-medium">{form.watch('buyerName')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deal Type:</span>
                          <Badge variant="outline">
                            {form.watch('dealType').replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">
                            {form.watch('currency')} {form.watch('dealAmount')?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Financing:</span>
                          <span className="font-medium text-green-600">
                            {form.watch('currency')} {calculateFinancingAmount().toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Terms & Conditions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tenor:</span>
                          <span className="font-medium">{form.watch('tenorDays')} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interest Rate:</span>
                          <span className="font-medium">{(form.watch('interestRate') * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Terms:</span>
                          <span className="font-medium">{form.watch('paymentTerms')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Level:</span>
                          <Badge variant={
                            form.watch('riskAssessment') === 'low' ? 'default' :
                            form.watch('riskAssessment') === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {form.watch('riskAssessment').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Compliance:</span>
                          <Badge variant={form.watch('complianceVerified') ? 'default' : 'destructive'}>
                            {form.watch('complianceVerified') ? 'VERIFIED' : 'PENDING'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      By submitting this form, you confirm that all information is accurate and all parties
                      have been properly verified. The transaction will be subject to final approval and funding.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                    >
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!form.formState.isValid}>
                        Create Trade Deal
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
