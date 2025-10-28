import Joi from 'joi'

// Request validation middleware
export function validateRequest(req, res, next) {
  // This is a placeholder - in a real implementation,
  // you would validate the request body against schemas
  next()
}

// Validation schemas
export const schemas = {
  supplierScore: Joi.object({
    supplierId: Joi.string().required(),
    criteria: Joi.object({
      regions: Joi.array().items(Joi.string()),
      industries: Joi.array().items(Joi.string()),
      minVolume: Joi.number().min(0),
      maxVolume: Joi.number().min(0)
    }).optional()
  }),

  documentExtraction: Joi.object({
    documentType: Joi.string().valid('invoice', 'bill_of_lading', 'purchase_order', 'commercial_invoice', 'packing_list').required(),
    documentData: Joi.object().required()
  }),

  invoiceAnalysis: Joi.object({
    invoices: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      currency: Joi.string().length(3).required(),
      debtor: Joi.string().required(),
      supplier: Joi.string().required(),
      dueDate: Joi.date().required()
    })).min(1).required(),
    analysisType: Joi.string().valid('full', 'credit', 'fraud').optional()
  }),

  buyerMatching: Joi.object({
    invoices: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      region: Joi.string().required(),
      industry: Joi.string().required(),
      qualityScore: Joi.number().min(0).max(100).required()
    })).min(1).required(),
    preferences: Joi.object({
      prioritizeReturn: Joi.boolean().optional(),
      prioritizeRisk: Joi.boolean().optional(),
      maxRiskLevel: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH').optional()
    }).optional()
  }),

  bulkCompliance: Joi.object({
    supplierIds: Joi.array().items(Joi.string()).min(1).max(100).required()
  })
}

// Validation helper function
export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      })
    }
    next()
  }
}
