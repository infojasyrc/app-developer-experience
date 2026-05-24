'use strict'

/**
 * Seed script — seeds users, headquarters and conferences via the API.
 *
 * Order:
 *   1. POST each user from mongo-init.js        → POST /v2/users
 *   2. POST each headquarter from mongo-init.js → POST /v2/headquarters
 *   3. POST each conference                     → POST /v2/conferences
 *
 * Idempotent: HTTP 400 "already exists" is treated as a skip, not a failure.
 *
 * Prerequisites:
 *   1. The API must be running        →  make launch-local-dev
 *   2. An admin JWT must be available →  make get-token ROLE=admin
 *      then export API_TOKEN=<token>
 *
 * Usage:
 *   API_TOKEN=<token> node scripts/seed-data.js
 *
 * Optional env overrides:
 *   MS_PORT        — API port   (default: value from .env or 5002)
 *   HEADQUARTER_ID — MongoDB ObjectId to use for conferences.
 *                    If omitted the script uses the first headquarter
 *                    returned by GET /v2/headquarters after seeding.
 */

const dotenv = require('dotenv')
dotenv.config()

const MS_PORT        = process.env.MS_PORT        || '5002'
const API_TOKEN      = process.env.API_TOKEN       || ''
const HEADQUARTER_ID = process.env.HEADQUARTER_ID  || ''

const BASE_URL = `http://localhost:${MS_PORT}`

// ─── Data (mirrors mongo-init.js) ────────────────────────────────────────────

const users = [
  {
    uid: 'sRrmUhxMgrhA1WeMyQp9CzzxyO92',
    firstName: 'User',
    lastName: 'App',
    email: 'testuser@chupito.com',
  },
  {
    uid: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
    firstName: 'User',
    lastName: 'Admin',
    email: 'adminuser@chupito.com',
  },
]

const headquarters = [
  { name: 'Bogota' },
  { name: 'Panama' },
  { name: 'Lima' },
]

const conferences = [
  {
    name: 'Google IO',
    description: 'This is the famous Google IO event',
    eventDate: '2024-05-08',
    status: 'active',
    type: 'Sales',
    tags: 'Android, Cloud, Web',
    address: 'Shoreline Amphitheatre, Mountain View, CA',
  },
  {
    name: 'Apple WWDC',
    description: 'This is the famous Apple WWDC event',
    eventDate: '2024-06-08',
    status: 'active',
    type: 'Sales',
    tags: 'iOS, macOS, Swift',
    address: 'Apple Park, Cupertino, CA',
  },
  {
    name: 'AWS Summit',
    description: 'This is the famous AWS Summit event',
    eventDate: '2024-11-08',
    status: 'active',
    type: 'Sales',
    tags: 'Cloud, DevOps, Infrastructure',
    address: 'Walter E. Washington Convention Center, Washington DC',
  },
  {
    name: 'Mobile World Congress',
    description: 'This is the Mobile World Congress event',
    eventDate: '2024-02-04',
    status: 'inactive',
    type: 'Sales',
    tags: 'Mobile, Connectivity, Innovation',
    address: 'Fira Gran Via, Barcelona, Spain',
  },
  {
    name: 'Black Hat',
    description: 'This is Black Hat event',
    eventDate: '2024-08-18',
    status: 'created',
    type: 'Sales',
    tags: 'Security, Hacking, CyberSecurity',
    address: 'Mandalay Bay Convention Center, Las Vegas, NV',
  },
  {
    name: 'Firebase Summit',
    description: 'This is Firebase Summit event',
    eventDate: '2024-10-18',
    status: 'created',
    type: 'Sales',
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

const isAlreadyExists = (status, body) =>
  status === 400 && (body.message ?? '').includes('already exists')

// ─── Users ────────────────────────────────────────────────────────────────────

const createUser = async (user) => {
  const res = await fetch(`${BASE_URL}/v2/users`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(user),
  })

  if (res.status === 201) {
    return { status: 'created', name: `${user.firstName} ${user.lastName}` }
  }

  const body = await res.json().catch(() => ({}))

  if (isAlreadyExists(res.status, body)) {
    return { status: 'skipped', name: `${user.firstName} ${user.lastName}` }
  }

  return {
    status: 'failed',
    name: `${user.firstName} ${user.lastName}`,
    detail: `HTTP ${res.status} — ${body.message ?? ''}`,
  }
}

const seedUsers = async () => {
  console.log(`Seeding ${users.length} users → ${BASE_URL}/v2/users\n`)

  const results = { created: 0, skipped: 0, failed: 0 }

  for (const user of users) {
    const result = await createUser(user)
    results[result.status]++

    const icon = result.status === 'created' ? '✓' : result.status === 'skipped' ? '~' : '✗'
    const detail = result.detail ? `  (${result.detail})` : ''
    console.log(`  ${icon} [${result.status}] ${result.name}${detail}`)
  }

  console.log(
    `\nUsers — ${results.created} created, ${results.skipped} skipped, ${results.failed} failed.\n`
  )

  return results.failed
}

// ─── Headquarters ─────────────────────────────────────────────────────────────

const createHeadquarter = async (hq) => {
  const res = await fetch(`${BASE_URL}/v2/headquarters`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ name: hq.name }),
  })

  if (res.status === 201) {
    const body = await res.json()
    return { status: 'created', name: hq.name, id: body._id }
  }

  const body = await res.json().catch(() => ({}))

  if (isAlreadyExists(res.status, body)) {
    return { status: 'skipped', name: hq.name }
  }

  return { status: 'failed', name: hq.name, detail: `HTTP ${res.status} — ${body.message ?? ''}` }
}

const seedHeadquarters = async () => {
  console.log(`Seeding ${headquarters.length} headquarters → ${BASE_URL}/v2/headquarters\n`)

  const results = { created: 0, skipped: 0, failed: 0 }

  for (const hq of headquarters) {
    const result = await createHeadquarter(hq)
    results[result.status]++

    const icon = result.status === 'created' ? '✓' : result.status === 'skipped' ? '~' : '✗'
    const detail = result.detail ? `  (${result.detail})` : ''
    console.log(`  ${icon} [${result.status}] ${result.name}${detail}`)
  }

  console.log(
    `\nHeadquarters — ${results.created} created, ${results.skipped} skipped, ${results.failed} failed.\n`
  )

  return results.failed
}

// ─── Headquarter resolution ───────────────────────────────────────────────────

const resolveHeadquarterId = async () => {
  if (HEADQUARTER_ID) {
    console.log(`Using headquarter from env: ${HEADQUARTER_ID}`)
    return HEADQUARTER_ID
  }

  console.log(`Fetching headquarters from ${BASE_URL}/v2/headquarters ...`)
  const res = await fetch(`${BASE_URL}/v2/headquarters`, { headers: buildHeaders() })

  if (!res.ok) {
    throw new Error(
      `GET /v2/headquarters returned ${res.status}. Ensure the API is running.`
    )
  }

  const list = await res.json()

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('No headquarters found after seeding. Cannot link conferences.')
  }

  const hq = list[0]
  console.log(`Using headquarter: "${hq.name}" (${hq._id})\n`)
  return hq._id
}

// ─── Conferences ──────────────────────────────────────────────────────────────

const createConference = async (conference, headquarterId) => {
  const payload = {
    name: conference.name,
    description: conference.description,
    eventDate: conference.eventDate,
    type: conference.type,
    tags: conference.tags,
    address: conference.address,
    headquarter: headquarterId,
  }

  const res = await fetch(`${BASE_URL}/v2/conferences`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  if (res.status === 201) {
    return { status: 'created', name: conference.name }
  }

  const body = await res.json().catch(() => ({}))

  if (isAlreadyExists(res.status, body)) {
    return { status: 'skipped', name: conference.name }
  }

  return { status: 'failed', name: conference.name, detail: `HTTP ${res.status} — ${body.message ?? ''}` }
}

const seedConferences = async (headquarterId) => {
  console.log(`Seeding ${conferences.length} conferences → ${BASE_URL}/v2/conferences\n`)

  const results = { created: 0, skipped: 0, failed: 0 }

  for (const conference of conferences) {
    const result = await createConference(conference, headquarterId)
    results[result.status]++

    const icon = result.status === 'created' ? '✓' : result.status === 'skipped' ? '~' : '✗'
    const detail = result.detail ? `  (${result.detail})` : ''
    console.log(`  ${icon} [${result.status}] ${result.name}${detail}`)
  }

  console.log(
    `\nConferences — ${results.created} created, ${results.skipped} skipped, ${results.failed} failed.`
  )

  return results.failed
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const run = async () => {
  if (!API_TOKEN) {
    console.warn(
      'Warning: API_TOKEN is not set. Requests will be sent without an Authorization header.\n' +
      'Get a token with:  make get-token ROLE=admin\n' +
      'Then run:          API_TOKEN=<token> node scripts/seed-data.js\n'
    )
  }

  const usersFailed = await seedUsers()
  const hqFailed = await seedHeadquarters()
  const headquarterId = await resolveHeadquarterId()
  const confFailed = await seedConferences(headquarterId)

  const totalFailed = usersFailed + hqFailed + confFailed
  if (totalFailed > 0) {
    console.error(`\n${totalFailed} item(s) failed to seed.`)
    process.exit(1)
  }

  console.log('\nDone.')
}

run().catch(err => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
