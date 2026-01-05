/**
 * Application Configuration
 * 
 * Centralized configuration for switching between mock mode (demo) and API mode (production).
 */

// Determine if we're in API mode or mock mode
// API mode: Uses real backend at localhost:3001 or production URL
// Mock mode: Uses localStorage with mock data (for demos when backend is offline)
const USE_API = import.meta.env.VITE_USE_API === 'true';

export const config = {
    /**
     * Whether to use the real API backend
     * Set VITE_USE_API=true in environment to enable
     * Default: false (uses mock localStorage mode)
     */
    useApi: USE_API,

    /**
     * API base URL
     */
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',

    /**
     * Is development environment
     */
    isDev: import.meta.env.DEV,

    /**
     * Is production environment
     */
    isProd: import.meta.env.PROD,
};

export default config;
