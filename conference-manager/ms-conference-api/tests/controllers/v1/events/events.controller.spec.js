'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

const BaseController = require('./../../../../src/controllers/v1/base.controller')

let sandbox = null

let eventsController
let baseController

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  baseController = new BaseController()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

const getController = doListImplementation => {
  return proxyquire('./../../../../src/controllers/v1/events/events.controller', {
    './../../../../src/services/service.container': () => {
      return {
        doList: doListImplementation,
      }
    },
  })
}

test.skip('Check get events: validate params', async t => {
  const req = mockRequest({
    params: {},
    query: {},
  })
  const res = mockResponse()

  let eventsService = {}
  const setupDBService = getSetupDBService(eventsService)

  eventsController = getController(setupDBService)

  await eventsController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(400), 'Expected response status with failure response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get all events', async t => {
  const requestParameters = {
    params: {},
    query: {},
  }
  const req = mockRequest(requestParameters)
  const res = mockResponse()
  const eventServiceResponse = {
    responseCode: 200,
    data: [],
    message: 'Getting events information successfully',
  }

  const eventsParameters = {
    year: new Date().getFullYear(),
    headquarterId: null,
    showAll: false,
    withAttendees: false,
  }

  const doListFunctionResponse = () => {
    return Promise.resolve(eventServiceResponse)
  }

  eventsController = getController(doListFunctionResponse)

  await eventsController.get(req, res)

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

test.serial('Get all events with headquarter', async t => {
  const requestParameters = {
    params: {},
    query: {
      headquarterId: 'headquarterId',
    },
  }
  const req = mockRequest(requestParameters)
  const res = mockResponse()
  const eventServiceResponse = {
    responseCode: 200,
    data: [],
    message: 'Getting events information successfully',
  }

  const eventsParameters = {
    year: new Date().getFullYear(),
    headquarterId: requestParameters.query.headquarterId,
    showAll: false,
    withAttendees: false,
  }

  const doListFunctionResponse = () => {
    return Promise.resolve(eventServiceResponse)
  }

  eventsController = getController(doListFunctionResponse)

  await eventsController.get(req, res)

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

test.serial('Check get events: catch error', async t => {
  const requestParameters = {
    params: {},
    query: {
      headquarterId: 'headquarterId',
    },
  }
  const req = mockRequest(requestParameters)
  const res = mockResponse()

  const eventsParameters = {
    year: new Date().getFullYear(),
    headquarterId: requestParameters.query.headquarterId,
    showAll: false,
    withAttendees: false,
  }

  const doListFunctionResponse = () => {
    return Promise.reject({ message: 'Error getting all events' })
  }

  eventsController = getController(doListFunctionResponse)

  await eventsController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get events with attendees: retrieve all', async t => {
  const requestParameters = {
    params: {},
    query: {
      withAttendees: 'true',
      headquarterId: 'headquarterId',
    },
  }
  const req = mockRequest(requestParameters)
  const res = mockResponse()
  const eventServiceResponse = {
    data: [],
    message: 'Getting events information successfully',
    responseCode: 200,
  }

  const eventsParameters = {
    year: new Date().getFullYear(),
    headquarterId: requestParameters.query.headquarterId,
    showAll: false,
    withAttendees: true,
  }

  const doListFunctionResponse = () => {
    return Promise.resolve(eventServiceResponse)
  }

  eventsController = getController(doListFunctionResponse)

  await eventsController.get(req, res)

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
