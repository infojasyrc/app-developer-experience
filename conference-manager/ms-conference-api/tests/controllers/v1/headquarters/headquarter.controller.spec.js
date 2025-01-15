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
  mockHeadquarterService.getHeadquarter = sandbox.stub()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

function getController() {
  return proxyquire('./../../../../src/controllers/v1/headquarters/headquarter.controller', {
    './../../../../src/services/service.container': () => mockHeadquarterService,
  })
}

test.serial('Get headquarter information: validate params', async t => {
  const req = mockRequest({})
  const res = mockResponse()

  headquarterController = getController()

  await headquarterController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(400), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get headquarter information: retrieve data', async t => {
  const req = mockRequest({
    params: {
      id: 'aaaaaaaaaa',
    },
  })
  const res = mockResponse()

  const headquarterServiceResponse = {
    responseCode: 200,
    data: {},
    message: '',
  }
  mockHeadquarterService.getHeadquarter
    .withArgs(req.params.id)
    .returns(Promise.resolve(headquarterServiceResponse))

  headquarterController = getController()

  await headquarterController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
