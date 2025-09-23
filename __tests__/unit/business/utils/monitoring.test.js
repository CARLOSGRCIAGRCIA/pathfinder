import { measureExecutionTime } from '../../../../src/business/utils/monitoring';

describe('measureExecutionTime', () => {
    it('should measure execution time and memory usage', () => {
        const mockFn = jest.fn(() => 'result');
        const monitoredFn = measureExecutionTime(mockFn, 'test');

        const result = monitoredFn();

        expect(result).toBe('result');
        expect(mockFn).toHaveBeenCalled();
    });
});