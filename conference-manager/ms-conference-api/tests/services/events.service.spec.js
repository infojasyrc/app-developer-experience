'use strict'

// require('dotenv').config({ path: '.env.test' })

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const { ObjectId } = require('mongodb')

const mockMongoDBCollectionList = require('./../util/mongodb.collection.list')

const EventsService = require('./../../src/services/events.service')

let collectionName = 'events'
let sandbox = null
let eventsService
let dbInstanceStub = null
let mockFind

proxyquire('../../src/infrastructure/environment', () => ({
  getEnvironmentVariables: () => ({
    APP_DB: 'mongodb',
  }),
}))

const findOneAndUpdateResponse = {
  value: {
    _id: new ObjectId('64c4290b5a5f16c9838feaa4'),
    images: [],
    name: 'Testing controller',
    date: '2023-07-28T17:00:00.000',
    owner: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
    type: 'Sales',
    tags: 'Devops',
    headquarter: '64b979b96d50f43aaefa1a50',
    description: 'Testing at demo day!',
    address: '121 Main Street',
    phoneNumber: '',
    status: 'created',
    year: 2023,
  },
}

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
  mockFind = sinon.stub()

  dbInstanceStub = {
    collection: sandbox.stub().returns({
      find: sandbox.stub().returns({
        toArray: sandbox.stub().returns(mockMongoDBCollectionList.get(collectionName, 2)),
      }),
      findOne: sandbox.stub().resolves({
        id: '647f965453db8aad4edf33d1',
        address: '121 Main Street',
        eventDate: '2023-06-15T17:00:00.000',
        name: 'Development Day',
        status: 'created',
        year: 2023,
        headquarter: '647f965453db8aad4edf33cf',
      }),
      deleteOne: sandbox.stub().resolves(),
      insertOne: sandbox.stub().resolves({ id: 10000 }),
      updateOne: sandbox.stub().resolves({}),
      findOneAndUpdate: sandbox.stub().resolves(findOneAndUpdateResponse),
    }),
  }

  eventsService = new EventsService(dbInstanceStub)
})

test.afterEach(() => {
  // Restore sandbox
  sandbox && sandbox.restore()
})

test.skip('Create event', async t => {
  const data = {
    name: 'Juan Perez',
    date: 'Perez',
    headquarter: {
      id: 'aaaaaaa',
      name: 'Buenos Aires',
    },
    status: 'created',
    placeName: '',
    address: '120 Main Street',
    phoneNumber: '',
    responsable: {},
  }

  let newEvent = await eventsService.create(data)
  t.is(newEvent.hasOwnProperty('message'), true, 'Expected message key')
  t.is(newEvent.hasOwnProperty('data'), true, 'Expected data key')

  t.is(newEvent['data'].hasOwnProperty('id'), true, 'Expected id key')
  t.is(newEvent['data'].hasOwnProperty('name'), true, 'Expected name key')
  t.is(newEvent['data'].hasOwnProperty('date'), true, 'Expected date key')
  t.is(newEvent['data'].hasOwnProperty('headquarter'), true, 'Expected headquarter key')
  t.is(newEvent['data'].hasOwnProperty('status'), true, 'Expected status key')
  t.is(newEvent['data'].hasOwnProperty('placeName'), true, 'Expected placeName key')
  t.is(newEvent['data'].hasOwnProperty('address'), true, 'Expected address key')
  t.is(newEvent['data'].hasOwnProperty('responsable'), true, 'Expected responsable key')
})

test.serial('Do list all events without params', async t => {
  let eventsData = await eventsService.doList({})

  t.is(eventsData.hasOwnProperty('message'), true, 'Expected message key')
  t.is(eventsData.hasOwnProperty('data'), true, 'Expected data key')

  eventsData['data'].forEach(eventData => {
    t.is(eventData.hasOwnProperty('id'), true, 'Expected id key')
    t.is(eventData.data.hasOwnProperty('name'), true, 'Expected name key')
    t.is(eventData.data.hasOwnProperty('date'), true, 'Expected date key')
    t.is(eventData.data.hasOwnProperty('headquarter'), true, 'Expected headquarter key')
    t.is(eventData.data.hasOwnProperty('placeName'), true, 'Expected placeName key')
    t.is(eventData.data.hasOwnProperty('address'), true, 'Expected address key')
    t.is(eventData.data.hasOwnProperty('responsable'), true, 'Expected responsable key')
    t.is(eventData.data.hasOwnProperty('status'), true, 'Expected status key')
  })
})

test.skip('Do list all events with year and headquarter', async t => {
  const eventsParams = {
    year: '2019',
    headquarterId: 'aaaaaaa',
  }

  let eventsData = await eventsService.doList(eventsParams)

  t.is(eventsData.hasOwnProperty('message'), true, 'Expected message key')
  t.is(eventsData.hasOwnProperty('data'), true, 'Expected data key')
  t.is(eventsData['data'].length, 2, 'Expected 2 elements')

  eventsData['data'].forEach(eventData => {
    t.is(eventData.hasOwnProperty('id'), true, 'Expected id key')
    t.is(eventData.hasOwnProperty('name'), true, 'Expected name key')
    t.is(eventData.hasOwnProperty('date'), true, 'Expected date key')
    t.is(eventData.hasOwnProperty('headquarter'), true, 'Expected headquarter key')
    t.is(eventData.hasOwnProperty('placeName'), true, 'Expected placeName key')
    t.is(eventData.hasOwnProperty('address'), true, 'Expected address key')
    t.is(eventData.hasOwnProperty('responsable'), true, 'Expected responsable key')
    t.is(eventData.hasOwnProperty('status'), true, 'Expected status key')
  })
})

test.serial('Find an event by id', async t => {
  const eventId = '647f965453db8aad4edf33d1'

  let eventData = await eventsService.findById(eventId)

  t.is(eventData.hasOwnProperty('message'), true, 'Expected message key')
  t.is(eventData.hasOwnProperty('data'), true, 'Expected data key')
  t.is(eventData['data'].hasOwnProperty('name'), true, 'Expected name key')
  t.is(eventData['data'].hasOwnProperty('address'), true, 'Expected address key')
  t.is(eventData['data'].hasOwnProperty('year'), true, 'Expected year key')
  t.is(eventData['data'].hasOwnProperty('status'), true, 'Expected status key')
  t.is(eventData['data']['id'], eventId, 'Expected same document Id')
})

test.serial(
  'Given an exception when the id is not a string of 12 bytes, or a string of 24 hex characters, or an integer',
  async t => {
    const eventId = '647f965453d'
    try {
      await eventsService.findById(eventId)
    } catch (error) {
      t.is(
        error.message,
        'Error getting event information: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer'
      )
    }
  }
)

test('Shoudl update event', async t => {
  const id = '64c4290b5a5f16c9838feaa4',
    data = {
      name: 'DEMO',
      description: 'Testing at demo day!',
      headquarter: '64b979b96d50f43aaefa1a50',
      date: '2023-03-15T17:00:00.000',
      address: '121 Main Street',
      type: 'Recruiting',
      capacity: 300,
      phoneNumber: '',
    }
  const eventRef = await eventsService.update(id, data)
  t.is(eventRef.hasOwnProperty('message'), true, 'Expected message key')
  t.is(eventRef.hasOwnProperty('data'), true, 'Expected data key')
})

test.skip('Update event deleting images', async t => {
  const eventId = 1,
    data = {
      name: 'Hackatrix 2019',
      date: '2019-03-15T17:00:00.000',
      headquarter: {},
      placeName: '',
      status: 'created',
      responsable: {},
      deletedImages: ['a5b3d252-79bf-4b88-8eb1-08e20f8a4ca3'],
    }

  let updatedData = await eventsService.update(eventId, data)

  t.is(updatedData.hasOwnProperty('message'), true, 'Expected message key')
  t.is(updatedData.hasOwnProperty('data'), true, 'Expected data key')
})

test.serial('Add attendees', async t => {
  const eventId = '1vZHkInPqe1bShakHXiN'
  const uidUser = 'sRrmUhxMgrhA1WeMyQp9CzzxyO92'

  let addAttendeesResponse = await eventsService.addAttendees(eventId, uidUser)

  t.is(addAttendeesResponse.hasOwnProperty('message'), true, 'Expected message key')
  t.is(addAttendeesResponse.hasOwnProperty('data'), true, 'Expected data key')
})

test.skip('Delete event', async t => {
  const eventId = '1vZHkInPqe1bShakHXiN'
  const deleteAttendeeResponse = await eventsService.remove(eventId)
  t.is(deleteAttendeeResponse.hasOwnProperty('message'), true, 'Expected message key')
  t.is(deleteAttendeeResponse.hasOwnProperty('data'), true, 'Expected data key')
})
