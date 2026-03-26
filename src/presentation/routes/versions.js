import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    versions: [
      {
        version: 'v1',
        status: 'current',
        basePath: '/api/v1',
        description: 'Current stable API version',
        endpoints: {
          maps: '/api/v1/maps',
          waypoints: '/api/v1/waypoints',
          obstacles: '/api/v1/obstacles',
          routes: '/api/v1/routes',
          users: '/api/v1/users',
          stats: '/api/v1/stats',
        },
      },
    ],
    recommendedVersion: 'v1',
    documentation: '/api-docs',
  });
});

export default router;
