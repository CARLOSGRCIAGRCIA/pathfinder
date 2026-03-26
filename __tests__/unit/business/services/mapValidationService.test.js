import { validateMapData } from '../../../../src/business/services/mapValidatorService.js';
import { AppError } from '../../../../src/business/utils/errorUtils.js';

describe('validateMapData', () => {
  it('should return a Right if map data is valid', () => {
    const mapData = {
      width: 100,
      height: 100,
      start: { x: 0, y: 0 },
      end: { x: 99, y: 99 },
    };
    const result = validateMapData(mapData);
    expect(result.isRight()).toBe(true);
  });

  it('should return a Left if required fields are missing', () => {
    const mapData = { width: 100, height: 100 };
    const result = validateMapData(mapData);
    expect(result.isLeft()).toBe(true);
    expect(
      result.fold(
        e => e.message,
        () => null
      )
    ).toBe('Missing required field: start');
  });

  it('should return a Left if start point is out of bounds', () => {
    const mapData = {
      width: 100,
      height: 100,
      start: { x: -1, y: 0 },
      end: { x: 99, y: 99 },
    };
    const result = validateMapData(mapData);
    expect(result.isLeft()).toBe(true);
    expect(
      result.fold(
        e => e.message,
        () => null
      )
    ).toBe('Start point at (-1, 0) is out of bounds');
  });

  it('should return a Left if end point is out of bounds', () => {
    const mapData = {
      width: 100,
      height: 100,
      start: { x: 0, y: 0 },
      end: { x: 100, y: 100 },
    };
    const result = validateMapData(mapData);
    expect(result.isLeft()).toBe(true);
    expect(
      result.fold(
        e => e.message,
        () => null
      )
    ).toBe('End point at (100, 100) is out of bounds');
  });

  it('should return a Left if map dimensions are invalid', () => {
    const mapData = {
      width: 49,
      height: 100,
      start: { x: 0, y: 0 },
      end: { x: 99, y: 99 },
    };
    const result = validateMapData(mapData);
    expect(result.isLeft()).toBe(true);
    expect(
      result.fold(
        e => e.message,
        () => null
      )
    ).toBe('Map dimensions must be between 50 and 500');
  });
});
