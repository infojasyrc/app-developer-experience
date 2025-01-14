'use strict'

const test = require('ava')
const sinon = require('sinon')

const setupUserService = require('./../../src/services/attendees.service')

let collectionKey = 'attendees'
let sandbox = null
let attendeesService
let dbInstanceStub = null

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  dbInstanceStub = {}
  dbInstanceStub.collection = sandbox.stub()
  dbInstanceStub.collection.withArgs(collectionKey).returns({
    get: () => {
      return Promise.resolve([
        {
          id: 'aaaaaaaaaaaaaaaa',
          data: () => {
            return {
              userId: '1',
              name: '',
              lastname: '',
              isAdmin: true,
              avatarUrl: '',
            }
          },
        },
        {
          id: 'bbbbbbbbbbbbbbb',
          data: () => {
            return {
              userId: '2',
              name: '',
              lastname: '',
              isAdmin: false,
              avatarUrl: '',
            }
          },
        },
      ])
    },
    doc: path => {
      return {
        get: () => {
          return Promise.resolve({
            exists: true,
            data: () => {
              return {
                userId: '2',
                name: '',
                lastname: '',
                isAdmin: false,
                avatarUrl: '',
              }
            },
          })
        },
        delete: () => {
          return {}
        },
        set: data => {
          return {}
        },
        update: data => {
          return Promise.resolve({
            data,
          })
        },
      }
    },
    add: data => {
      return Promise.resolve({
        id: 10000,
      })
    },
  })

  attendeesService = setupUserService(dbInstanceStub)
})

test.afterEach(() => {
  // Restore sandbox
  sandbox && sandbox.restore()
})

test.serial('Create attendee', async t => {
  const data = {
    email: 'test@test.com',
    name: 'Juan',
    lastname: 'Perez',
  }

  let newUser = await attendeesService.create(data)

  t.is(newUser.hasOwnProperty('message'), true, 'Expected message key')
  t.is(newUser.hasOwnProperty('data'), true, 'Expected data key')
  t.is(newUser['data'].hasOwnProperty('documentId'), true, 'Expected documentId key')
})

test.serial('Do list all attendees', async t => {
  let allUsers = await attendeesService.doList()

  t.is(allUsers['data'].length, 2, 'Expected 2 elements')

  allUsers['data'].forEach(attendeeData => {
    t.is(attendeeData.hasOwnProperty('documentId'), true, 'Expected documentId key')
  })
})

test.serial('Get attendee', async t => {
  const docUserId = 'abcdefghi'

  let dataInfo = await attendeesService.findById(docUserId)

  t.is(dataInfo.hasOwnProperty('message'), true, 'Expected message key')
  t.is(dataInfo.hasOwnProperty('data'), true, 'Expected data key')
  t.is(dataInfo['data'].hasOwnProperty('documentId'), true, 'Expected documentId key')
  t.is(dataInfo['data'].hasOwnProperty('name'), true, 'Expected name key')
  t.is(dataInfo['data'].hasOwnProperty('lastname'), true, 'Expected lastname key')
  t.is(dataInfo['data'].hasOwnProperty('avatarUrl'), true, 'Expected avatarUrl key')
  t.is(dataInfo['data'].hasOwnProperty('isAdmin'), true, 'Expected isAdmin key')
  t.is(dataInfo['data']['documentId'], docUserId, 'Expected same document Id')
})

test.serial('Update attendee', async t => {
  const userId = 1,
    data = {
      name: 'Juan',
      lastname: 'Perez',
    }

  let dataAttendee = await attendeesService.update(userId, data)

  t.is(dataAttendee.hasOwnProperty('message'), true, 'Expected message key')
})

test.serial('Delete attendee', t => {
  const userId = 1

  let data = attendeesService.remove(userId)

  t.is(data.hasOwnProperty('message'), true, 'Expected message attribute')
})
