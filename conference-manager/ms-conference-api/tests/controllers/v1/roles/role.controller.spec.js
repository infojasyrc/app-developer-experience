'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

let sandbox = null

let roleController
const mockRoleService = {}

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
  mockRoleService.getRole = sandbox.stub()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

const getController = () => {
  return proxyquire('./../../../../src/controllers/v1/roles/role.controller', {
    './../../../../src/services/service.container': () => {
      return mockRoleService
    },
  })
}

test.serial('Get role information: validate params', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  roleController = getController()

  await roleController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(400), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get role information: retrieve data', async t => {
  const req = mockRequest({
    params: {
      id: 'aaaaaaaaaa',
    },
  })
  const res = mockResponse()

  const roleResponse = {
    responseCode: 200,
    data: {},
    message: '',
  }
  mockRoleService.getRole.withArgs(req.params.id).returns(Promise.resolve(roleResponse))

  roleController = getController()

  await roleController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
