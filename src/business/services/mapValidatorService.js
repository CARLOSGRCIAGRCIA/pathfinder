import { AppError } from '../utils/errorUtils.js';
import { Either } from '../utils/either/Either.js';

const isWithinBounds = map => (x, y) => x >= 0 && x < map.width && y >= 0 && y < map.height;

const validateDimensions = map =>
  map.width >= 50 && map.width <= 500 && map.height >= 50 && map.height <= 500
    ? Either.right(map)
    : Either.left(new AppError('Map dimensions must be between 50 and 500', 400));

const validatePoint = map => (point, name) =>
  isWithinBounds(map)(point.x, point.y)
    ? Either.right(map)
    : Either.left(new AppError(`${name} point at (${point.x}, ${point.y}) is out of bounds`, 400));

const validateRequiredFields = data => {
  const requiredFields = ['width', 'height', 'start', 'end'];
  return requiredFields.reduce(
    (acc, field) =>
      acc.flatMap(() =>
        field in data
          ? Either.right(data)
          : Either.left(new AppError(`Missing required field: ${field}`, 400))
      ),
    Either.right(data)
  );
};

const validateMapConfiguration = map =>
  validateDimensions(map)
    .flatMap(() => validatePoint(map)(map.start, 'Start'))
    .flatMap(() => validatePoint(map)(map.end, 'End'));

const validateMapData = mapData =>
  validateRequiredFields(mapData).flatMap(() => validateMapConfiguration(mapData));

export { validateMapConfiguration, validateMapData };
