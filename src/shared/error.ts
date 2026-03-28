export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode: number, errorCode: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details?: any) {
    super(message, 401, 'UNAUTHENTICATED', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details?: any) {
    super(message, 403, 'UNAUTHORIZED', details);
  }
}

export class AIProcessingError extends AppError {
  constructor(message = 'AI Engine Processing Error', details?: any) {
    super(message, 502, 'AI_PROCESSING_ERROR', details);
  }
}
