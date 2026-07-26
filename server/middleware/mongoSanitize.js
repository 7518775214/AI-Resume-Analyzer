/**
 * MongoDB NoSQL Query Injection Sanitizer Middleware
 * 
 * Recursively inspects req.body, req.query, and req.params objects.
 * Strips keys containing '$' or '.' to prevent NoSQL query operator injection attacks.
 */

const sanitize = (target) => {
  if (target === null || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitize(item));
  }

  const cleaned = {};
  for (const key of Object.keys(target)) {
    // Strip keys starting with '$' or containing '.' to neutralize query operator injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = sanitize(target[key]);
  }

  return cleaned;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

module.exports = mongoSanitizeMiddleware;
