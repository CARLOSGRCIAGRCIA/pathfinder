# PathFinder API

A RESTful API for pathfinding with maps, waypoints, obstacles, and route optimization.

## Features

- **Maps Management** - Create and manage maps with waypoints and obstacles
- **Pathfinding** - Find optimal routes using pathfinding algorithms
- **Authentication** - JWT-based authentication with refresh tokens
- **API Keys** - Manage API keys for external access
- **Analytics** - Track API usage and performance metrics
- **Rate Limiting** - Protect API from abuse with Redis-backed rate limiting
- **Caching** - Redis-powered route caching for performance
- **RBAC** - Role-based access control (Admin, Editor, Viewer)

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## Docker

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up --build
```

## Environment Variables

See `.env.example` for configuration options.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Maps

- `GET /api/maps` - List maps (paginated)
- `POST /api/maps` - Create map
- `GET /api/maps/:id` - Get map
- `PUT /api/maps/:id` - Update map
- `DELETE /api/maps/:id` - Delete map

### Waypoints

- `GET /api/maps/:mapId/waypoints` - List waypoints
- `POST /api/maps/:mapId/waypoints` - Create waypoint
- `GET /api/waypoints/:id` - Get waypoint
- `PUT /api/waypoints/:id` - Update waypoint
- `DELETE /api/waypoints/:id` - Delete waypoint

### Obstacles

- `GET /api/maps/:mapId/obstacles` - List obstacles
- `POST /api/maps/:mapId/obstacles` - Create obstacle
- `GET /api/obstacles/:id` - Get obstacle
- `PUT /api/obstacles/:id` - Update obstacle
- `DELETE /api/obstacles/:id` - Delete obstacle

### Routes

- `GET /api/routes` - List routes
- `POST /api/routes` - Create route
- `POST /api/routes/optimal` - Find optimal route
- `GET /api/routes/:id` - Get route
- `DELETE /api/routes/:id` - Delete route

### API Keys

- `GET /api/keys` - List API keys
- `POST /api/keys` - Create API key
- `DELETE /api/keys/:id` - Revoke API key

### Analytics

- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/usage` - Get usage stats
- `GET /api/versions` - Get API versions

## Security

- JWT authentication with access/refresh tokens
- Helmet for secure HTTP headers
- Rate limiting (Redis with in-memory fallback)
- Input sanitization (MongoDB injection & XSS prevention)
- CORS configuration
- API Key authentication for external clients
- Role-based access control

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- pathfinderService.test.js
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Auth**: JWT
- **Testing**: Jest
- **Docker**: Multi-stage builds

## License

MIT
