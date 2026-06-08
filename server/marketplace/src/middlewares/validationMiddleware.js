export const validateSchema = (schema) => {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const val = req.body[field];

      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        if (rules.type && typeof val !== rules.type) {
          errors.push({ field, message: `${field} must be of type ${rules.type}` });
          continue;
        }
        if (rules.enum && !rules.enum.includes(val)) {
          errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
          continue;
        }
        if (rules.min !== undefined && typeof val === 'number' && val < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min}` });
          continue;
        }
        if (rules.minLength !== undefined && typeof val === 'string' && val.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters long` });
          continue;
        }
        if (rules.isEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            errors.push({ field, message: `${field} must be a valid email address` });
            continue;
          }
        }
        if (rules.isUrl) {
          try {
            new URL(val);
          } catch (e) {
            errors.push({ field, message: `${field} must be a valid URL` });
            continue;
          }
        }
        if (rules.custom) {
          const customErr = rules.custom(val);
          if (customErr) {
            errors.push({ field, message: customErr });
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }
    next();
  };
};

export const registerSchema = {
  email: { required: true, type: 'string', isEmail: true },
  password: { required: true, type: 'string', minLength: 6 },
  role: { required: false, type: 'string', enum: ['PROVIDER', 'CONSUMER'] }
};

export const loginSchema = {
  email: { required: true, type: 'string', isEmail: true },
  password: { required: true, type: 'string' }
};

export const apiSchema = {
  name: { required: true, type: 'string', minLength: 2 },
  upstreamUrl: { required: true, type: 'string', isUrl: true },
  description: { required: false, type: 'string' }
};

export const planSchema = {
  name: { required: true, type: 'string', minLength: 2 },
  requestsPerMin: {
    required: true,
    custom: (val) => {
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        return 'requestsPerMin must be a positive integer';
      }
      return null;
    }
  },
  price: {
    required: true,
    custom: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        return 'price must be a non-negative number';
      }
      return null;
    }
  }
};

export const subscriptionSchema = {
  planId: { required: true, type: 'string' }
};
