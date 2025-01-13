'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

const BaseController = require('../../../../src/controllers/v1/base.controller')

let sandbox = null

let userController
let baseController
let userService
const mockUserService = {}
const authenticationService = {}
const mockEventsService = {}

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  const mockDBInstance = {}
  mockDBInstance.collection = sandbox.stub()

  mockUserService.findById = sandbox.stub()
  mockUserService.findByUserId = sandbox.stub()
  mockUserService.create = sandbox.stub()
  mockUserService.toggleEnable = sandbox.stub()
  mockUserService.update = sandbox.stub()
  mockUserService.getModel = sandbox.stub()
  mockUserService.checkUserAttendeeStatus = sandbox.stub()
  mockUserService.fetchUserEventsAttendance = sandbox.stub()

  mockEventsService.findById = sandbox.stub()
  mockEventsService.doList = sandbox.stub()

  authenticationService.changePasswordUsingAdminSDK = sandbox.stub()
  authenticationService.changeAvailability = sandbox.stub()

  baseController = new BaseController()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

const getController = () => {
  return proxyquire('./../../../../src/controllers/v1/users/user.controller', {
    './../../../../src/services/service.container': service => {
      switch (service) {
        case 'users':
        default: {
          return mockUserService
        }
        case 'authentication': {
          return authenticationService
        }
        case 'events':
          return mockEventsService
      }
    },
  })
}

test.serial('Get user: validate params', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  userController = getController()

  await userController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(400), 'Expected response status with an error response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get user: retrieve data', async t => {
  const userId = 'aaaaaaaaaaaaa'
  const req = mockRequest({
    params: {
      id: userId,
    },
  })
  const res = mockResponse()

  const userServiceResponse = {
    responseCode: 200,
    data: [],
    message: 'Getting user information successfully',
  }

  mockUserService.findById.withArgs(userId).returns(Promise.resolve(userServiceResponse))

  userController = getController()

  await userController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(userServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
  t.true(
    res.json.calledWith({
      status: baseController.successStatus,
      data: userServiceResponse.data,
      message: userServiceResponse.message,
    }),
    'Expected response json was executed'
  )
})

test.serial('Get user: error retrieving data', async t => {
  const userId = 'user_id'
  const req = mockRequest({
    params: {
      id: userId,
    },
  })
  const res = mockResponse()

  const expectedUserServiceResponse = {
    status: 'ERROR',
    data: {},
    message: 'Error getting user information',
  }

  mockUserService.findById.withArgs(userId).throws(new Error('Error getting user information'))

  await userController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with error response')
  t.true(res.json.called, 'Expected response json was executed')
  t.deepEqual(res.json.args[0][0], expectedUserServiceResponse)
})

test.serial('Create user: validate params', async t => {
  const req = mockRequest({
    body: {
      name: 'Juan',
      lastName: 'Perez',
      role: {},
    },
  })
  const res = mockResponse()

  userController = getController()

  await userController.post(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(400),
    'Expected response status with an error response for missing parameters'
  )
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Create user: success response', async t => {
  const userPostData = {
    name: 'Juan',
    lastName: 'Perez',
    email: 'test@unittest.com',
    role: {},
    uid: 'ThisIsAUserUId',
  }

  const req = mockRequest({
    body: userPostData,
  })
  const res = mockResponse()
  const userServiceResponse = {
    responseCode: 200,
    data: {},
    message: 'Adding user successfully',
  }

  mockUserService.create.returns(Promise.resolve(userServiceResponse))

  userController = getController()

  await userController.post(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(userServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
  t.true(
    res.json.calledWith({
      status: baseController.successStatus,
      data: userServiceResponse.data,
      message: userServiceResponse.message,
    }),
    'Expected response json was executed'
  )
})

test.serial('Update user: validate params', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  userController = getController()

  await userController.update(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(400),
    'Expected response status with an error response for missing parameters'
  )
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Update user: success response', async t => {
  const userId = 'aaaaaaaaaaaaaa'
  const userPostData = {
    name: 'Juan',
    lastName: 'Perez',
    email: 'test@unittest.com',
    role: {},
    isAdmin: false,
    disabled: false,
  }

  const req = mockRequest({
    params: {
      id: userId,
    },
    body: userPostData,
  })
  const res = mockResponse()
  const userServiceResponse = {
    responseCode: 200,
    data: {},
    message: 'Updating user successfully',
  }

  mockUserService.update.returns(Promise.resolve(userServiceResponse))

  userController = getController()

  await userController.update(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(userServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
  t.true(
    res.json.calledWith({
      status: baseController.successStatus,
      data: userServiceResponse.data,
      message: userServiceResponse.message,
    }),
    'Expected response json was executed'
  )
})

test.serial('Remove user: validate params', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  userController = getController()

  await userController.remove(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(400),
    'Expected response status with an error response for missing parameters'
  )
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Remove user: success response', async t => {
  const userId = 'aaaaaaaaaaaaaa'

  const req = mockRequest({
    params: {
      id: userId,
    },
  })
  const res = mockResponse()

  const userServiceResponse = {
    responseCode: 200,
    data: {
      userId: 'ThisIsAUserId',
      name: 'Juan',
      lastName: 'Perez',
      isAdmin: false,
      isEnabled: false,
    },
    message: 'User was disabled successfully',
  }
  const authResponse = {
    responseCode: 200,
    data: {
      email: 'test@email.com',
      disabled: true,
    },
    message: 'User was disabled successfully',
  }

  mockUserService.toggleEnable.returns(Promise.resolve(userServiceResponse))

  authenticationService.changeAvailability.returns(Promise.resolve(authResponse))

  userController = getController()

  await userController.remove(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(userServiceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get user attendance: validate params', async t => {
  const req = mockRequest({
    params: {},
    user: { id: 'user-id' },
  })
  const res = mockResponse()

  userController = getController()

  await userController.getUserAttendance(req, res)

  t.true(res.status.calledWith(400), 'Expected response status with an error response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get user attendance: success response', async t => {
  const eventId = 'event'
  const userId = 'user-id'

  const userServiceResponse = {
    status: true,
    data: {
      attendanceConfirmed: true,
    },
    message: 'User is an attendee of the event.',
  }

  mockUserService.checkUserAttendeeStatus.returns(Promise.resolve(userServiceResponse))

  const req = mockRequest({
    params: {
      id: 'event-id',
    },
    user: {
      id: 'user-id',
    },
  })

  let res = mockResponse()
  res = {
    statusCode: 200,
    json: sinon.stub(),
  }

  userController = getController()
  userController.userService = mockUserService

  await userController.getUserAttendance(req, res)

  t.is(res.statusCode, 200, 'Expected response status to be 200')
  t.deepEqual(
    res.json.firstCall.args[0],
    userServiceResponse,
    'Expected response json to match the data'
  )
})

test.serial('Get user events attendance: success', async t => {
  const fetchUserEventsAttendanceResponse = {
    status: true,
    data: [
      {
        id: 'event-1',
        name: 'Event 1',
        status: 'created',
        eventDate: '2023-08-16T18:30:00.000',
        description: 'Oops! No description',
        subscribed: true,
      },
      {
        id: 'event-2',
        name: 'Event 2',
        status: 'created',
        eventDate: '2024-02-15T06:30:00.000',
        description: 'Oops! No description',
        subscribed: false,
      },
    ],
    message: 'Events retrieved successfully.',
  }

  const req = mockRequest({
    user: {
      id: 'user-id',
    },
  })

  const res = mockResponse()

  mockUserService.fetchUserEventsAttendance.resolves(fetchUserEventsAttendanceResponse)

  userController = getController()

  await userController.getUserEventsAttendance(req, res)

  t.true(res.status.calledWith(200))
  t.true(
    res.json.calledWith({
      status: fetchUserEventsAttendanceResponse.status,
      data: fetchUserEventsAttendanceResponse.data,
      message: fetchUserEventsAttendanceResponse.message,
    })
  )
})

test.serial('Get user events attendance: error verifying user attendance', async t => {
  const userId = 'user-id'

  userService = {
    fetchUserEventsAttendance: sinon.stub().throws(new Error('Error verifying user attendance')),
  }

  const req = mockRequest({
    user: { id: userId },
  })
  const res = mockResponse()

  await userController.getUserEventsAttendance(req, res)

  t.true(res.status.calledWith(500))
  t.deepEqual(res.json.args[0][0], {
    status: 'ERROR',
    data: {},
    message: 'Error verifying user attendance',
  })
})
