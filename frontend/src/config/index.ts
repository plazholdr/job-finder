/**
 * Application configuration
 * 
 * This file contains all the configuration for the application.
 * It automatically detects the current environment and loads the appropriate configuration.
 */

// Environment detection
const ENV = process.env.NEXT_PUBLIC_ENV || 'development';

// Base configuration
const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Job Finder',
    env: ENV,
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030',
    timeout: 10000, // 10 seconds
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  // Environment-specific overrides
  environments: {
    development: {
      features: {
        mockApi: true,
        debugMode: true,
      },
    },
    staging: {
      features: {
        mockApi: false,
        debugMode: true,
      },
    },
    uat: {
      features: {
        mockApi: false,
        debugMode: true,
      },
    },
    production: {
      features: {
        mockApi: false,
        debugMode: false,
      },
    },
  },
};

// Get environment-specific configuration
const envConfig = config.environments[ENV as keyof typeof config.environments] || config.environments.development;

// Merge environment-specific configuration with base configuration
const mergedConfig = {
  ...config,
  features: {
    ...config.features,
    ...(envConfig.features || {}),
  },
};

// Remove the environments property from the final config
const { environments, ...finalConfig } = mergedConfig;

export default finalConfig;

// Type definitions for the configuration
export type Config = typeof finalConfig;

// Helper function to check if we're in development mode
export const isDevelopment = () => finalConfig.app.env === 'development';

// Helper function to check if we're in production mode
export const isProduction = () => finalConfig.app.env === 'production';

// Helper function to check if we're in staging mode
export const isStaging = () => finalConfig.app.env === 'staging';

// Helper function to check if we're in UAT mode
export const isUAT = () => finalConfig.app.env === 'uat';
