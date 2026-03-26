import express from 'express';

export const apiVersioning = (defaultVersion = 'v1') => {
  return (req, res, next) => {
    const path = req.path;
    const versionMatch = path.match(/^\/v(\d+)/);

    if (versionMatch) {
      req.apiVersion = `v${versionMatch[1]}`;
    } else {
      req.apiVersion = defaultVersion;
    }

    next();
  };
};

export const versionMiddleware = (app, version, prefix = '/api') => {
  const versionRouter = express.Router();

  versionRouter.use((req, res, next) => {
    req.apiVersion = version;
    next();
  });

  return versionRouter;
};

export const createVersionedRoutes = (app, routesConfig) => {
  const { prefix = '/api', version, routes } = routesConfig;

  const versionedRouter = express.Router();

  routes.forEach(route => {
    const { method, path, handler, middleware = [] } = route;
    versionedRouter[method.toLowerCase()](path, ...middleware, handler);
  });

  app.use(`${prefix}/${version}`, versionedRouter);

  return versionedRouter;
};

export const deprecatedEndpoint = (message = 'This endpoint is deprecated') => {
  return (req, res, next) => {
    res.set('Deprecation', 'true');
    res.set('Link', `<${req.path.replace('/v1', '/v2')}>; rel="successor-version"`);

    res.status(410).json({
      success: false,
      message,
      code: 'ENDPOINT_DEPRECATED',
      suggestedAction: 'Please use the updated endpoint',
    });
  };
};

export const upcomingFeature = (message = 'This feature is coming soon') => {
  return (req, res, next) => {
    res.status(403).json({
      success: false,
      message,
      code: 'FEATURE_NOT_AVAILABLE',
      status: 'coming_soon',
    });
  };
};

export default {
  apiVersioning,
  versionMiddleware,
  createVersionedRoutes,
  deprecatedEndpoint,
  upcomingFeature,
};
