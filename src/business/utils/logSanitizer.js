const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'refreshToken',
  'accessToken',
  'jwt',
  'token',
  'secret',
  'apiKey',
  'apikey',
  'authorization',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'socialSecurityNumber',
];

const SENSITIVE_PATTERNS = [
  /bearer\s+[a-zA-Z0-9\-_.]+/gi,
  /jwt=[a-zA-Z0-9\-_.]+/gi,
  /token["']?\s*[:=]\s*["']?([a-zA-Z0-9\-_.]+)/gi,
];

export const sanitizeForLog = obj => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    let sanitized = obj;
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '***REDACTED***');
    });
    return sanitized;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLog(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitizeForLog(value);
      }
    }
    return sanitized;
  }

  return obj;
};

export const sanitizeRequestBody = body => {
  if (!body) return body;
  return sanitizeForLog(body);
};

export const sanitizeUserObject = user => {
  if (!user) return user;
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.refreshToken;
  delete sanitized.token;
  return sanitized;
};

export default {
  sanitizeForLog,
  sanitizeRequestBody,
  sanitizeUserObject,
};
