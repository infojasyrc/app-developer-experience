'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

let sandbox = null

const mockHeadquarterService = {}
let headquarterController

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
  mockHeadquarterService.doList = sandbox.stub()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

const getController = () => {
  return proxyquire('./../../../../src/controllers/v1/headquarters/headquarters.controller', {
    './../../../../src/services/service.container': () => mockHeadquarterService,
  })
}

test.serial('Get headquarters', async t => {
  const req = mockRequest({})
  const res = mockResponse()

  const headquarterServiceResponse = {
    responseCode: 200,
    data: [],
    message: '',
  }
  mockHeadquarterService.doList.returns(Promise.resolve(headquarterServiceResponse))

  headquarterController = getController()

  await headquarterController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
