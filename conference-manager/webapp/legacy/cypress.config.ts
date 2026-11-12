import { defineConfig } from 'cypress';

require("dotenv").config()

// Define constants for e2e
const BASE_URL = ""
const PUBLIC_API_URL = ""

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: BASE_URL,
    testIsolation: false,
    experimentalOriginDependencies: true,
  },

  env: {
    BASE_URL: BASE_URL,
    EVENTS_ENDPOINT: `${PUBLIC_API_URL}/v1/events`,
  },
});
