import {
  AppError,
  ErrorCodes,
  ValidationError,
  NotFoundError,
} from '../../../../src/business/utils/errorUtils';

describe('errorUtils', () => {
  describe('AppError', () => {
    it('should create an AppError with statusCode and status', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with code', () => {
      const error = new AppError('Test error', 400, 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_CODE');
    });

    it('should have default code based on statusCode', () => {
      const error = new AppError('Test error', 404);
      expect(error.code).toBe('ERR_404');
    });
  });

  describe('ErrorCodes', () => {
    it('should have correct values', () => {
      expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with errors', () => {
      const error = new ValidationError('Validation failed', ['error1', 'error2']);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(['error1', 'error2']);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create a NotFoundError with custom resource', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });
});
