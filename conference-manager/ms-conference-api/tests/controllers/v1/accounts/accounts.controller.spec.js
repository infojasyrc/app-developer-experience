'use strict'

const test = require('ava')
const sinon = require('sinon')
const { mockRequest, mockResponse } = require('mock-req-res')
const proxyquire = require('proxyquire')

let sandbox = null

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

function getController() {
  return proxyquire('./../../../../src/controllers/v1/accounts/accounts.controller', {
    './../../../../src/services/service.container': serviceName => {
      switch (serviceName) {
        case 'accounts':
          return {
            checkBalance: () => {
              return Promise.resolve({
                responseCode: 200,
                data: 200.0,
                message: 'Getting data successfully',
              })
            },
            getAll: () => {
              return Promise.resolve({
                responseCode: 200,
                data: [
                  { id: 'a', balance: 200.0, name: 'Cuenta de Ahorros' },
                  { id: 'b', balance: 400.0, name: 'Cuenta Corriente' },
                ],
                message: 'Getting data successfully',
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

test.serial('Check get balance: success response', async t => {
  const req = mockRequest({
    params: {},
    body: {},
    headers: {
      authorization: 'thisIsAUserToken',
    },
    query: {},
  })
  const res = mockResponse()

  const accountsController = getController()

  await accountsController.checkBalance(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Check get balance: Response 403 for no token information', async t => {
  const req = mockRequest({
    params: {},
    body: {},
    headers: {},
    query: {},
  })
  const res = mockResponse()

  const accountsController = getController()

  await accountsController.checkBalance(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(403), 'Expected 403 response')
  t.true(res.json.called, 'Expected response json was executed')
})

test.serial('Get all accounts', async t => {
  const req = mockRequest({
    params: {},
    body: {},
    headers: {
      authorization: 'thisIsAUserToken',
    },
    query: {},
  })
  const res = mockResponse()

  const accountsController = getController()

  await accountsController.getAll(req, res)

  t.true(res.status.called, 'Expected response status was executed')
  t.true(res.status.calledWith(200), 'Expected response status with success response')
  t.true(res.json.called, 'Expected response json was executed')
})
