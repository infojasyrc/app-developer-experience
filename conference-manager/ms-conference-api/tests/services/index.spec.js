'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

let sandbox = null
let database = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  const getMockProviders = () => {
    return {
      clientAuth: sandbox.stub(),
      adminAuth: sandbox.stub(),
      dbInstance: sandbox.stub(),
      storage: () => {
        return {
          bucket: sandbox.stub(),
        }
      },
    }
  }

  const setupDatabase = proxyquire('./../../src/services', {
    './../providers': getMockProviders,
    './auth.codes.service': () => {},
    './user.service': sandbox.stub(),
    './attendees.service': () => {},
    './events.service': sandbox.stub(),
    './authentication.service': sandbox.stub(),
    './roles.service': () => {},
    './headquarters.service': sandbox.stub(),
    './storage.service': () => {},
    './accounts.service': () => {},
  })
  database = await setupDatabase()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
  database = null
})

test('Check database services', async t => {
  t.is(database.hasOwnProperty('authenticationService'), true, 'Expected authentication service')
  t.is(database.hasOwnProperty('userService'), true, 'Expected user service')
  t.is(database.hasOwnProperty('attendeesService'), true, 'Expected attendee service')
  t.is(database.hasOwnProperty('eventsService'), true, 'Expected events service')
  t.is(database.hasOwnProperty('rolesService'), true, 'Expected roles service')
  t.is(database.hasOwnProperty('headquartersService'), true, 'Expected headquarters service')
})
