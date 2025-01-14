'use strict'

const test = require('ava')
const sinon = require('sinon')

const setupAuthCodesService = require('./../../src/services/auth.codes.service')

const collectionKey = 'auth_codes'
const adminInstanceStub = {}
const dbInstanceStub = {}
let sandbox
let authCodesService

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  adminInstanceStub.createCustomToken = sandbox.stub()

  dbInstanceStub.collection = sandbox.stub()
  dbInstanceStub.collection.withArgs(collectionKey).returns({
    where: () => {
      return {
        get: () => {
          return Promise.resolve({
            docs: [
              {
                id: 'thisIsAuthCodeDocId',
                data: () => {
                  return { uid: 'thisIsAUserId' }
                },
              },
            ],
          })
        },
      }
    },
    doc: () => {
      return {
        update: () => {},
        set: () => {
          return Promise.resolve({})
        },
      }
    },
  })

  authCodesService = setupAuthCodesService(adminInstanceStub, dbInstanceStub)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Get access token by auth code', async t => {
  const code = '12345'
  const response = await authCodesService.getAccessTokenByAuthCode(code)

  t.true(response.hasOwnProperty('message'), 'Expected message key')
  t.true(response.hasOwnProperty('data'), 'Expected data key')
  t.true(response.data.hasOwnProperty('access_token'), 'Expected access_token key')
  t.true(response.data.hasOwnProperty('token_type'), 'Expected token_type key')
  t.true(response.data.hasOwnProperty('refresh_token'), 'Expected refresh_token key')
  t.true(response.data.hasOwnProperty('expires_in'), 'Expected expires_in key')
  t.true(response.data.hasOwnProperty('id_token'), 'Expected id_token key')
})

test.serial('Get access token by refresh token', async t => {
  const refreshToken = 'thisIsAToken'
  const response = await authCodesService.getAccessTokenByRefreshToken(refreshToken)

  t.true(response.hasOwnProperty('message'), 'Expected message key')
  t.true(response.hasOwnProperty('data'), 'Expected data key')
  t.true(response.data.hasOwnProperty('access_token'), 'Expected access_token key')
  t.true(response.data.hasOwnProperty('token_type'), 'Expected token_type key')
  t.true(response.data.hasOwnProperty('refresh_token'), 'Expected refresh_token key')
  t.true(response.data.hasOwnProperty('expires_in'), 'Expected expires_in key')
  t.true(response.data.hasOwnProperty('id_token'), 'Expected id_token key')
})

test.serial('Add authorization code', async t => {
  const userId = 'thisIsAUserId'
  const response = await authCodesService.addAuthCode(userId)

  t.true(response.hasOwnProperty('message'), 'Expected message key')
  t.true(response.hasOwnProperty('data'), 'Expected data key')
})
