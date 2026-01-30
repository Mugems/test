/**
 * Environment utility functions
 * Provides clean way to check development/production environment
 */

/**
 * Check if the application is running in development mode
 * @returns {boolean} true if in development mode
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if the application is running in production mode
 * @returns {boolean} true if in production mode
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if we should show debug features
 * This can be extended to check for additional flags like REACT_APP_SHOW_DEBUG
 * @returns {boolean} true if debug features should be shown
 */
export const shouldShowDebugFeatures = () => {
  // Show debug features in development or if explicitly enabled
  return isDevelopment() || process.env.REACT_APP_SHOW_DEBUG === 'true';
};

/**
 * Get current environment name
 * @returns {string} environment name
 */
export const getEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

/**
 * Log only in development mode
 * @param {...any} args - arguments to log
 */
export const devLog = (...args) => {
  if (isDevelopment()) {
    console.log('[DEV]', ...args);
  }
};

/**
 * Warn only in development mode
 * @param {...any} args - arguments to warn
 */
export const devWarn = (...args) => {
  if (isDevelopment()) {
    console.warn('[DEV]', ...args);
  }
};

/**
 * Error log (always shows, but with environment context)
 * @param {...any} args - arguments to error log
 */
export const envError = (...args) => {
  console.error(`[${getEnvironment().toUpperCase()}]`, ...args);
};

export default {
  isDevelopment,
  isProduction,
  shouldShowDebugFeatures,
  getEnvironment,
  devLog,
  devWarn,
  envError,
};
