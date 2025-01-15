'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

const AuthenticationService = require('./../../../../src/services/authentication.service')

let sandbox = null

let authenticationController
const mockAuthenticationService = {}

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  const authenticationService = new AuthenticationService({})

  mockAuthenticationService.revokeToken = sandbox.stub()
  mockAuthenticationService.createUser = sandbox.stub()
  mockAuthenticationService.getModel = authenticationService.getModel
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

// TODO: this mock should be upgraded to be considered async
const getController = () => {
  return proxyquire('./../../../../src/controllers/v1/authentication/authentication.controller', {
    './../../../../src/services/service.container': service => {
      switch (service) {
        case 'authentication':
          return mockAuthenticationService
        case 'authCode':
          return {
            addAuthCode: () => {
              return Promise.resolve({
                responseCode: 200,
                data: {
                  userId: 'thisIsAUserId',
                  code: 'thisIsAnAuthCode',
                  created: Date(),
                },
              })
            },
          }
        case 'users':
          return {
            findByUserId: () => {
              return Promise.resolve({
                responseCode: 200,
                data: {},
                message: '',
              })
            },
          }
        case 'session':
          return {
            getUserSession: () => {
              return Promise.resolve({
                responseCode: 200,
                data: 'thisIsAUserId',
                message: 'Getting data successfully',
              })
            },
          }
      }
    },
  })
}

test('Revoke token: catch error', async t => {
  const req = mockRequest({
    params: {},
    headers: {
      authorization: 'thisIsAToken',
    },
  })
  const res = mockResponse()

  mockAuthenticationService.revokeToken.returns(Promise.reject({ message: 'Error revoking token' }))

  authenticationController = getController()

  await authenticationController.revokeToken(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Revoke token: success response', async t => {
  const serviceResponse = {
    responseCode: 200,
    data: {},
  }
  const req = mockRequest({
    params: {},
    headers: {
      authorization: 'thisIsAToken',
    },
  })
  const res = mockResponse()

  mockAuthenticationService.revokeToken.returns(Promise.resolve(serviceResponse))

  authenticationController = getController()

  await authenticationController.revokeToken(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(serviceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Create user authentication: error response for parameters validation', async t => {
  const req = mockRequest({
    params: {},
    headers: {},
    body: {},
  })
  const res = mockResponse()

  const authenticationController = getController()

  await authenticationController.create(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(400), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.skip('Create user authentication: error response for service execution', async t => {
  const req = mockRequest({
    params: {},
    body: {
      email: 'email@test.com',
      password: 'ThisIsAGReatPassword',
      name: 'Juan',
      lastName: 'Perez',
    },
    headers: {},
  })
  const res = mockResponse()

  mockAuthenticationService.createUser.returns(Promise.reject({ error: 'This is an error' }))

  const authenticationController = getController()

  await authenticationController.create(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(500), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.skip('Create user authentication: success response', async t => {
  const serviceResponse = {
    responseCode: 200,
    data: {},
    message: 'Added a user authentication successfully',
  }
  const req = mockRequest({
    params: {},
    body: {
      email: 'email@test.com',
      password: 'ThisIsAGReatPassword',
      name: 'Juan',
      lastName: 'Perez',
    },
    headers: {},
  })
  const res = mockResponse()

  mockAuthenticationService.createUser.returns(Promise.resolve(serviceResponse))

  const authenticationController = getController()

  await authenticationController.create(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(
    res.status.calledWith(serviceResponse.responseCode),
    'Expected response status with success response'
  )
  t.true(res.json.called, 'Expected response json was executed')
})
