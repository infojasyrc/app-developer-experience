'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')
const { ObjectId } = require('mongodb')
const reqEvent = require('../../../fixtures/create.event.mock')

const BaseController = require('../../../../src/controllers/v1/base.controller')
const eventUpdateServiceResponse = require('../../../fixtures/event.update.service')
const reqEventUpdate = require('../../../fixtures/event.update.req')

let sandbox = null

let eventController
let eventsService = null
const mockStorageService = {}
let baseController
let authService = {}

const uidUser = 'sRrmUhxMgrhA1WeMyQp9CzzxyO92'

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  eventsService = {}
  eventsService.findById = sandbox.stub()
  eventsService.remove = sandbox.stub()
  eventsService.addAttendees = sandbox.stub()
  eventsService.create = sandbox.stub()
  eventsService.update = sandbox.stub()
  authService.verifyToken = sandbox.stub()

  mockStorageService.eraseList = sandbox.stub()

  baseController = new BaseController()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

const getController = service => {
  return proxyquire('./../../../../src/controllers/v1/events/event.controller', {
    './../../../../src/services/service.container': serviceName => {
      switch (serviceName) {
        case 'events':
        default:
          return {
            addAttendees: service.addAttendees,
            findById: service.findById,
            remove: service.remove,
            verifyToken: authService.verifyToken,
            create: service.create,
            update: service.update,
          }
        case 'storage':
          return {
            eraseList: mockStorageService.eraseList,
          }
      }
    },
  })
}

test.serial('Check post event: create event', async t => {
  const req = reqEvent
  const res = mockResponse()
  const eventResponse = {
    status: true,
    data: {
      images: [],
      name: 'Pink day',
      date: '2023-03-15T17:00:00.000',
      owner: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
      type: 'Sales',
      tags: 'Devops',
      headquarter: '64b979b96d50f43aaefa1a50',
      description: 'Dress up green!',
      address: '121 Main Street',
      phoneNumber: '',
      status: 'created',
      year: 2023,
      _id: new ObjectId('64c274758a0505e5cc885f75'),
    },
    message: 'Event was successfully created.',
    responseCode: 200,
  }

  await eventsService.create.returns(eventResponse)
  eventController = getController(eventsService)

  await eventController.post(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(eventResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Event was successfully created.')
})

test.serial('Check post event: catch error', async t => {
  const req = reqEvent
  const res = mockResponse()

  eventsService.create.returns(Promise.reject())

  eventController = getController(eventsService)

  await eventController.post(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with error response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Check update event: update event', async t => {
  const req = reqEventUpdate
  const res = mockResponse()

  await eventsService.update.returns(eventUpdateServiceResponse)
  eventController = getController(eventsService)

  await eventController.update(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(eventUpdateServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Event was updated successfully')
})

test.serial('Check updatet event: catch error', async t => {
  const req = reqEventUpdate
  const res = mockResponse()

  eventsService.update.returns(Promise.reject())

  eventController = getController(eventsService)

  await eventController.update(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with error response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Check get event: validate params', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  eventController = getController(eventsService)

  await eventController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(400), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Check get event: retrieve event', async t => {
  const eventId = 'aaaaaaaaa'
  const description = 'Mocked Description'
  const req = mockRequest({
    params: {
      id: eventId,
    },
  })
  const res = mockResponse()
  const eventServiceResponse = {
    data: {
      id: eventId,
      description: description,
    },
    message: 'Getting event information successfully',
    responseCode: 200,
  }

  eventsService.findById.withArgs(eventId).returns(Promise.resolve(eventServiceResponse))

  eventController = getController(eventsService)

  await eventController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(eventServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
  t.true(
    res.json.calledWith({
      status: baseController.successStatus,
      data: {
        id: eventServiceResponse.data.id,
        description: eventServiceResponse.data.description,
      },
      message: eventServiceResponse.message,
    }),
    'Expected response json was executed'
  )
})

test.serial('Check get event: catch error', async t => {
  const eventId = 'aaaaaaaaa'
  const req = mockRequest({
    params: {
      id: eventId,
    },
  })
  const res = mockResponse()

  eventsService.findById.withArgs(eventId).returns(Promise.reject())

  eventController = getController(eventsService)

  await eventController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with error response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Add attendees: success response', async t => {
  const eventId = 'aaaaaaaaa'
  const attendees = [
    {
      name: 'Juan Perez',
    },
    {
      name: 'Andres Ivan',
    },
  ]

  const req = mockRequest({
    params: {
      id: eventId,
    },
    body: {
      attendees: attendees,
    },
    headers: {
      authorization: 'Bearer  MyTOKEN',
    },
  })
  const res = mockResponse()
  const eventServiceResponse = {
    responseCode: 200,
    data: {
      id: eventId,
      attendees: attendees,
    },
    message: '',
  }
  const token = req.headers.authorization.replace('Bearer ', '')
  const authServiceResponse = {
    status: true,
    data: { verified: true, id: uidUser },
    message: 'Successfully verified Token',
    responseCode: 200,
  }
  authService.verifyToken.withArgs(token).returns(Promise.resolve(authServiceResponse))

  eventsService.addAttendees
    .withArgs(eventId, uidUser)
    .returns(Promise.resolve(eventServiceResponse))

  eventController = getController(eventsService)

  await eventController.addAttendees(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(eventServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
  t.true(
    res.json.calledWith({
      status: baseController.successStatus,
      data: eventServiceResponse.data,
      message: eventServiceResponse.message,
    }),
    'Expected response json was executed'
  )
})

test.serial('Delete event: success response', async t => {
  const deleteEventServiceResponse = {
    data: {},
    message: 'Event successfully deleted',
    responseCode: 200,
  }

  const req = mockRequest({
    params: {
      id: new ObjectId('64c4290b5a5f16c9838feaa4'),
    },
  })
  const res = mockResponse()

  eventsService.remove.withArgs(req.params.id).returns(Promise.resolve(deleteEventServiceResponse))

  eventController = getController(eventsService)

  await eventController.remove(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Delete event: success response with images', async t => {
  const eventId = '1vZHkInPqe1bShakHXiN'
  const infoEventServiceResponse = {
    data: {
      images: [
        {
          id: '0e2a46f4-e21b-4db6-a724-dadbca3b34fc',
          url: 'https://firebasestorage.googleapis.com/2F0e2a46f4aaaa-e21bcccc-4db6-a724-dadbca3b34fc',
        },
      ],
    },
    message: 'Getting event information successfully',
    responseCode: 200,
  }
  const deleteEventServiceResponse = {
    data: {},
    message: 'Event removed successfully',
    responseCode: 200,
  }

  const req = mockRequest({
    params: {
      id: eventId,
    },
  })
  const res = mockResponse()

  eventsService.findById.withArgs(eventId).returns(Promise.resolve(infoEventServiceResponse))

  eventsService.remove.withArgs(eventId).returns(Promise.resolve(deleteEventServiceResponse))

  eventController = getController(eventsService)

  await eventController.remove(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Delete event: error response', async t => {
  const req = mockRequest({
    params: {
      id: new ObjectId('64c4290b5a5f16c9838feaa4'),
    },
  })
  const res = mockResponse()

  eventsService.remove.withArgs(req.params.id).returns(Promise.reject())
  eventController = getController(eventsService)
  await eventController.remove(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
