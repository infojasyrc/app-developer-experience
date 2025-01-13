'use strict'

const UserAuthentication = require('./../../src/models/user-authentication')

const test = require('ava')
const sinon = require('sinon')

const AuthenticationService = require('./../../src/services/authentication.service')

let adminInstanceStub = {}
let sandbox = null

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  adminInstanceStub.revokeRefreshTokens = sandbox.stub()
  adminInstanceStub.getUser = sandbox.stub()
  adminInstanceStub.ref = sandbox.stub()
  adminInstanceStub.createUser = sandbox.stub()
  adminInstanceStub.updateUser = sandbox.stub()
  // adminInstanceStub.revokeRefreshTokens.returns(Promise.resolve({}))

  /*
  adminInstanceStub.getUser.returns(
    Promise.resolve({
      tokensValidAfterTime: new Date().toISOString(),
    })
  )
  */

  /*
  adminInstanceStub.ref.returns({
    set: () => {
      return Promise.resolve({})
    },
  })
  */
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Update user: change Password | Success response', async t => {
  const userId = 'ThisIsAGreatPassword'
  const newPassword = 'newPassword'

  adminInstanceStub.updateUser.returns(
    Promise.resolve({
      email: '',
      phoneNumber: '',
      emailVerified: true,
      password: '',
      displayName: '',
      photoURL: '',
      disabled: false,
    })
  )

  const authenticationService = new AuthenticationService(adminInstanceStub)

  const result = await authenticationService.changePassword(userId, newPassword)

  t.is(result.hasOwnProperty('message'), true, 'Expected message key')
  t.is(result.hasOwnProperty('data'), true, 'Expected data key')
  t.is(result.hasOwnProperty('responseCode'), true, 'Expected data key')
  t.is(result['responseCode'], 200, 'Expected 500 error response')
})

test.serial('Update user: change Password | Error response', async t => {
  const userId = 'pmBhQP2XYWQsdPB5g45pasa4teasdaTwYzM3uH22'
  const newPassword = 'newPassword'

  adminInstanceStub.updateUser.returns(Promise.reject({}))

  const authenticationService = new AuthenticationService(adminInstanceStub)

  const result = await authenticationService.changePassword(userId, newPassword)

  t.is(Object.prototype.hasOwnProperty.call(result, 'message'), true, 'Expected message key')
  t.is(Object.prototype.hasOwnProperty.call(result, 'data'), true, 'Expected data key')
  t.is(
    Object.prototype.hasOwnProperty.call(result, 'responseCode'),
    true,
    'Expected responseCode key'
  )
  t.is(result['responseCode'], 500, 'Expected 500 error response')
})

test.serial('Revoke token | Success response', async t => {
  const userId = 'thisIsAUserId'

  adminInstanceStub.getUser.returns({
    tokensValidAfterTime: Date(),
  })

  const authenticationService = new AuthenticationService(adminInstanceStub)

  const authenticationResponse = await authenticationService.revokeToken(userId)

  t.is(authenticationResponse.hasOwnProperty('message'), true, 'Expected message key')
  t.is(authenticationResponse.hasOwnProperty('data'), true, 'Expected data key')
})

test.serial('Create authentication user: success response', async t => {
  const userData = {
    email: 'email@test.com',
    emailVerified: false,
    password: 'password',
    displayName: 'Juan Perez',
    disabled: false,
  }

  adminInstanceStub.createUser.returns(Promise.resolve({ uid: 'ThisIsAUserId' }))

  const authenticationService = new AuthenticationService(adminInstanceStub)

  const newAuthUserResponse = await authenticationService.createUser(userData)

  t.is(
    Object.prototype.hasOwnProperty.call(newAuthUserResponse, 'message'),
    true,
    'Expected message key'
  )
  t.is(Object.prototype.hasOwnProperty.call(newAuthUserResponse, 'data'), true, 'Expected data key')
  t.is(
    Object.prototype.hasOwnProperty.call(newAuthUserResponse['data'], 'uid'),
    true,
    'Expected data key'
  )
})

test.serial('Get authentication model', t => {
  const dataFromRequest = {
    email: 'test@email.com',
    password: 'ThisIsAGReatPassword',
    name: 'Juan',
    lastName: 'Perez',
  }

  const authenticationService = new AuthenticationService(adminInstanceStub)

  const model = authenticationService.getModel(dataFromRequest)

  t.true(
    model instanceof UserAuthentication,
    'Expected model to be an instance of User Authentication'
  )
})
