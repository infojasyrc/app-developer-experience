'use strict'

/**
 * Seed script — creates one Conference via the API for each event defined in
 * scripts/mongo-init.js. Idempotent: a 400 "already exists" response is
 * treated as a skip, not a failure.
 *
 * Prerequisites:
 *   1. The API must be running   →  make launch-local-dev
 *   2. mongo-init.js must have run (headquarters collection must exist)
 *   3. An admin JWT must be available  →  make get-token ROLE=admin
 *      then export API_TOKEN=<token>
 *
 * Usage:
 *   API_TOKEN=<token> node scripts/seed-conferences.js
 *
 * Optional env overrides:
 *   MS_PORT        — API port   (default: value from .env or 5002)
 *   HEADQUARTER_ID — MongoDB ObjectId of the headquarter to link.
 *                    If omitted the script fetches the first one from
 *                    GET /v1/headquarters automatically.
 */

const dotenv = require('dotenv')
dotenv.config()

const MS_PORT       = process.env.MS_PORT       || '5002'
const API_TOKEN     = process.env.API_TOKEN      || ''
const HEADQUARTER_ID = process.env.HEADQUARTER_ID || ''

const BASE_URL = `http://localhost:${MS_PORT}`

// ─── Same events as mongo-init.js var events ─────────────────────────────────
// Conference-required fields (tags, address) are added here since they have no
// equivalent in the original events seed data.

const events = [
  {
    name: 'Google IO',
    description: 'This is the famous Google IO event',
    eventDate: '2024-05-08',
    status: 'active',
    eventType: 'Sales',
    tags: 'Android, Cloud, Web',
    address: 'Shoreline Amphitheatre, Mountain View, CA',
  },
  {
    name: 'Apple WWDC',
    description: 'This is the famous Apple WWDC event',
    eventDate: '2024-06-08',
    status: 'active',
    eventType: 'Sales',
    tags: 'iOS, macOS, Swift',
    address: 'Apple Park, Cupertino, CA',
  },
  {
    name: 'AWS Summit',
    description: 'This is the famous AWS Summit event',
    eventDate: '2024-11-08',
    status: 'active',
    eventType: 'Sales',
    tags: 'Cloud, DevOps, Infrastructure',
    address: 'Walter E. Washington Convention Center, Washington DC',
  },
  {
    name: 'Mobile World Congress',
    description: 'This is the Mobile World Congress event',
    eventDate: '2024-02-04',
    status: 'inactive',
    eventType: 'Sales',
    tags: 'Mobile, Connectivity, Innovation',
    address: 'Fira Gran Via, Barcelona, Spain',
  },
  {
    name: 'Black Hat',
    description: 'This is Black Hat event',
    eventDate: '2024-08-18',
    status: 'created',
    eventType: 'Sales',
    tags: 'Security, Hacking, CyberSecurity',
    address: 'Mandalay Bay Convention Center, Las Vegas, NV',
  },
  {
    name: 'Firebase Summit',
    description: 'This is Firebase Summit event',
    eventDate: '2024-10-18',
    status: 'created',
    eventType: 'Sales',
    tags: 'Firebase, Mobile, Backend',
    address: 'Online Event',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' }
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`
  return headers
}

/**
 * Resolves the headquarter ObjectId to use for every seeded conference.
 * Prefers the HEADQUARTER_ID env var; falls back to the first result from
 * GET /v1/headquarters (populated by mongo-init.js).
 */
const resolveHeadquarterId = async () => {
  if (HEADQUARTER_ID) {
    console.log(`Using headquarter from env: ${HEADQUARTER_ID}`)
    return HEADQUARTER_ID
  }

  console.log(`Fetching headquarter from ${BASE_URL}/v1/headquarters ...`)
  const res = await fetch(`${BASE_URL}/v1/headquarters`, { headers: buildHeaders() })

  if (!res.ok) {
    throw new Error(
      `GET /v1/headquarters returned ${res.status}. ` +
      'Ensure the API is running and mongo-init.js has been executed.'
    )
  }

  const body = await res.json()
  const list = body.data ?? body

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(
      'No headquarters found. Run mongo-init.js first or set HEADQUARTER_ID env var.'
    )
  }

  const hq = list[0]
  console.log(`Using headquarter: "${hq.name}" (${hq._id})`)
  return hq._id
}

/**
 * POSTs one conference to POST /v2/conferences.
 * Returns { status: 'created' | 'skipped' | 'failed', name, detail? }.
 */
const createConference = async (event, headquarterId) => {
  const payload = {
    name: event.name,
    description: event.description,
    eventDate: event.eventDate,
    type: event.eventType,
    tags: event.tags,
    address: event.address,
    headquarter: headquarterId,
  }

  const res = await fetch(`${BASE_URL}/v2/conferences`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  if (res.status === 201) {
    return { status: 'created', name: event.name }
  }

  const body = await res.json().catch(() => ({}))
  const message = body.message ?? ''

  // 400 "already exists" → idempotent skip, not a failure
  if (res.status === 400 && message.includes('already exists')) {
    return { status: 'skipped', name: event.name }
  }

  return { status: 'failed', name: event.name, detail: `HTTP ${res.status} — ${message}` }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const run = async () => {
  if (!API_TOKEN) {
    console.warn(
      'Warning: API_TOKEN is not set. Requests will be sent without an Authorization header.\n' +
      'Get a token with:  make get-token ROLE=admin\n' +
      'Then run:          API_TOKEN=<token> node scripts/seed-conferences.js\n'
    )
  }

  const headquarterId = await resolveHeadquarterId()

  console.log(`\nSeeding ${events.length} conferences → ${BASE_URL}/v2/conferences\n`)

  const results = { created: 0, skipped: 0, failed: 0 }

  for (const event of events) {
    const result = await createConference(event, headquarterId)
    results[result.status]++

    const icon = result.status === 'created' ? '✓' : result.status === 'skipped' ? '~' : '✗'
    const detail = result.detail ? `  (${result.detail})` : ''
    console.log(`  ${icon} [${result.status}] ${result.name}${detail}`)
  }

  console.log(
    `\nDone — ${results.created} created, ${results.skipped} skipped, ${results.failed} failed.`
  )

  if (results.failed > 0) process.exit(1)
}

run().catch(err => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
