'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

let sandbox = null

let authenticationController

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

function getController() {
  return proxyquire('./../../../../src/controllers/v1/token/token.controller', {
    './../../../../src/services/service.container': () => {
      return {
        getAccessTokenByAuthCode: () => {
          return Promise.resolve({
            responseCode: 200,
            data: {},
          })
        },
        getAccessTokenByRefreshToken: () => {
          return Promise.resolve({
            responseCode: 200,
            data: {},
          })
        },
      }
    },
  })
}

test.serial('Access token: get access token ', async t => {
  const req = mockRequest({
    params: {},
    body: {
      grant_type: 'authorization_code',
      code: 'thisIsACode',
    },
  })
  const res = mockResponse()

  authenticationController = getController()

  await authenticationController.post(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Access token: get refresh token ', async t => {
  const req = mockRequest({
    params: {},
    body: {
      grant_type: 'refresh_token',
      refresh_token: 'thisIsAToken',
    },
  })
  const res = mockResponse()

  authenticationController = getController()

  await authenticationController.post(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
