import Map from '../../data/models/Map.js';

export const validateRouteEndpoints = async (req, res, next) => {
  const mapId = req.params.mapId;
  const { start, end } = req.body;

  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }

    const isPointObstructed = point =>
      map.obstacles.some(
        obstacle =>
          point.x >= obstacle.x &&
          point.x < obstacle.x + (obstacle.size || 1) &&
          point.y >= obstacle.y &&
          point.y < obstacle.y + (obstacle.size || 1)
      );

    const isPointWithinBounds = point =>
      point.x >= 0 && point.x < map.width && point.y >= 0 && point.y < map.height;

    if (!isPointWithinBounds(start) || !isPointWithinBounds(end)) {
      return res.status(400).json({ message: 'Start or end point is out of map bounds' });
    }

    if (isPointObstructed(start)) {
      return res.status(400).json({ message: 'Start point is obstructed by an obstacle' });
    }

    if (isPointObstructed(end)) {
      return res.status(400).json({ message: 'End point is obstructed by an obstacle' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating route endpoints', error: error.message });
  }
};
