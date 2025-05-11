require('dotenv').config();

// Determine the current environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Base configuration that applies to all environments
const baseConfig = {
  app: {
    name: 'Job Finder API',
    version: '1.0.0',
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 3030,
    env: NODE_ENV,
  },
  db: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/job-finder',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    redis: {
      uri: process.env.REDIS_URI || 'redis://localhost:6379',
      options: {},
    },
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@jobfinder.com',
    smtp: {
      host: process.env.EMAIL_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_PORT, 10) || 1025,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    },
  },
  storage: {
    s3: {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
      bucket: process.env.S3_BUCKET || 'job-finder',
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Environment-specific configurations
const envConfigs = {
  development: {
    app: {
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    logging: {
      level: 'debug',
    },
  },
  staging: {
    app: {
      frontendUrl: process.env.FRONTEND_URL || 'https://staging.jobfinder.com',
    },
    logging: {
      level: 'info',
    },
  },
  uat: {
    app: {
      frontendUrl: process.env.FRONTEND_URL || 'https://uat.jobfinder.com',
    },
    logging: {
      level: 'info',
    },
  },
  production: {
    app: {
      frontendUrl: process.env.FRONTEND_URL || 'https://jobfinder.com',
    },
    logging: {
      level: 'warn',
    },
    // In production, ensure all security-sensitive values come from environment variables
    auth: {
      jwt: {
        secret: process.env.JWT_SECRET,
      },
    },
  },
};

// Merge the base config with the environment-specific config
const currentEnvConfig = envConfigs[NODE_ENV] || envConfigs.development;
const config = { ...baseConfig };

// Deep merge the environment config into the base config
const mergeDeep = (target, source) => {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      mergeDeep(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
};

mergeDeep(config, currentEnvConfig);

module.exports = config;
