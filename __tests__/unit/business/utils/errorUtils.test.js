import {
    AppError,
    handleCastErrorDB,
    handleDuplicateFieldsDB,
    handleValidationErrorDB,
    handleJWTError,
    handleJWTExpiredError,
    sendErrorDev,
    sendErrorProd,
} from '../../../../src/business/utils/errorUtils';

describe('errorUtils', () => {
    describe('AppError', () => {
        it('should create an AppError with statusCode and status', () => {
            const error = AppError('Test error', 400);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.status).toBe('fail');
            expect(error.isOperational).toBe(true);
        });
    });
});