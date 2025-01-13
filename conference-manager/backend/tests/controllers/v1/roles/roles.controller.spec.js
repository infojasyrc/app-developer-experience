'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

let sandbox = null

let rolesController

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Do list all roles', async t => {
  const req = mockRequest({
    params: {},
  })
  const res = mockResponse()

  rolesController = proxyquire('./../../../../src/controllers/v1/roles/roles.controller', {
    './../../../../src/services/service.container': () => {
      return {
        doList: () => {
          return Promise.resolve({
            responseCode: 200,
            data: [],
            message: 'Getting data successfully',
          })
        },
      }
    },
  })

  await rolesController.get(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
