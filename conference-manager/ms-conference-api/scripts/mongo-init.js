print('Start #################################################################')

db.createCollection('users')
db.createCollection('events')
db.createCollection('attendees')
db.createCollection('roles')

var headquarters = [
  {
    name: 'Bogota',
  },
  {
    name: 'Panama',
  },
  {
    name: 'Lima',
  },
]

var roles = [
  {
    name: 'Admin',
  },
  {
    name: 'Sales',
  },
  {
    name: 'Marketing',
  },
]

var users = [
  {
    uid: 'sRrmUhxMgrhA1WeMyQp9CzzxyO92',
    firstName: 'User',
    lastName: 'App',
    isAdmin: false,
    email: 'testuser@chupito.com',
    isSuperAdmin: false,
  },
  {
    uid: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
    firstName: 'User',
    lastName: 'Admin',
    isAdmin: true,
    email: 'adminuser@chupito.com',
    isSuperAdmin: false,
  },
]

var events = [
  {
    name: 'Google IO',
    description: 'This is the famous Google IO event',
    eventDate: '2024-05-08',
    status: 'active',
    eventType: 'Sales',
  },
  {
    name: 'Apple WWDC',
    description: 'This is the famous Apple WWDC event',
    eventDate: '2024-06-08',
    status: 'active',
    eventType: 'Sales',
  },
  {
    name: 'AWS Summit',
    description: 'This is the famous AWS Summit event',
    eventDate: '2024-11-08',
    status: 'active',
    eventType: 'Sales',
  },
  {
    name: 'Mobile World Congress',
    description: 'This is the Mobile World Congress event',
    eventDate: '2024-02-04',
    status: 'inactive',
    eventType: 'Sales',
  },
  {
    name: 'Black Hat',
    description: 'This is Black Hat event',
    eventDate: '2024-08-18',
    status: 'created',
    eventType: 'Sales',
  },
  {
    name: 'Firebase Summit',
    description: 'This is Firebase Summit event',
    eventDate: '2024-10-18',
    status: 'created',
    eventType: 'Sales',
  },
]

db.headquarters.insert(headquarters)
db.roles.insert(roles)
db.users.insert(users)
db.events.insert(events)

// TODO: get role and then set role in user
// db.getCollection('test').find()

print('END #################################################################')
