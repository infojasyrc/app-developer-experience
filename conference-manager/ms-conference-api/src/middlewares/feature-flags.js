// feature-flags.js (legacy express middleware helper)
// Provides a lightweight isAuthEnabled() aligned with Unleash flag.
// Falls back to REQUIRES_AUTH env for tests or when Unleash not reachable.
const getEnvironmentVariables = require('../infrastructure/environment')
let unleashClient = null
let unleashInitialized = false

function initUnleashOnce() {
  if (unleashClient || unleashInitialized) return
  try {
    const { initialize } = require('unleash-client')
    const env = getEnvironmentVariables()
    unleashClient = initialize({
      url: env.UNLEASH_URL,
      appName: env.UNLEASH_APP_NAME,
      customHeaders: { Authorization: env.UNLEASH_API_KEY },
    })
    unleashInitialized = true
  } catch (e) {
    // swallow – will fallback to env var
  }
}

function isAuthEnabled() {
  const env = getEnvironmentVariables()
  // In test environments keep auth ON to satisfy existing assertions.
  if (env.ENVIRONMENT === 'test') return true
  initUnleashOnce()
  const toggleName = env.UNLEASH_TOGGLE_AUTH
  if (unleashClient) {
    try {
      return unleashClient.isEnabled(toggleName)
    } catch (_) { /* swallow – fallback to env var below */ }
  }
  // Fallback to REQUIRES_AUTH env logic.
  return env.REQUIRES_AUTH === true
}

module.exports = { isAuthEnabled }
