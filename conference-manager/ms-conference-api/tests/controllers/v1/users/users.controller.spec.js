'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const { mockRequest, mockResponse } = require('mock-req-res')

const BaseController = require('./../../../../src/controllers/v1/base.controller')

let sandbox = null

let usersController
const userService = {}
let baseController

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  userService.doList = sandbox.stub()
  baseController = new BaseController()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

const getController = () => {
  return proxyquire('./../../../../src/controllers/v1/users/users.controller', {
    './../../../../src/services/service.container': () => {
      return {
        doList: userService.doList,
      }
    },
  })
}

test.serial('Get all users', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  const userServiceResponse = {
    responseCode: 200,
    data: [],
    message: '',
  }

  userService.doList.returns(Promise.resolve(userServiceResponse))

  usersController = getController()

  await usersController.get(req, res)

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
