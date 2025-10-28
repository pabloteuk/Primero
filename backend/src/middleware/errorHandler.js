// Global error handling middleware
export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  // Default error
  let status = err.status || err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let code = err.code || 'INTERNAL_ERROR'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation Error'
    code = 'VALIDATION_ERROR'
  } else if (err.name === 'UnauthorizedError') {
    status = 401
    message = 'Unauthorized'
    code = 'UNAUTHORIZED'
  } else if (err.name === 'ForbiddenError') {
    status = 403
    message = 'Forbidden'
    code = 'FORBIDDEN'
  } else if (err.name === 'NotFoundError') {
    status = 404
    message = 'Not Found'
    code = 'NOT_FOUND'
  } else if (err.name === 'ConflictError') {
    status = 409
    message = 'Conflict'
    code = 'CONFLICT'
  } else if (err.name === 'RateLimitError') {
    status = 429
    message = 'Too Many Requests'
    code = 'RATE_LIMIT_EXCEEDED'
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error'
  }

  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack
    errorResponse.error.details = err.details
  }

  res.status(status).json(errorResponse)
}
