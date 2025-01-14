'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const serviceContainer = proxyquire('./../../src/services/service.container', {
  './': () => {
    return {
      eventsService: {
        create: () => {},
      },
      userService: {
        create: () => {},
      },
      authCodesService: {
        getAccessTokenByAuthCode: () => {},
        getAccessTokenByRefreshToken: () => {},
      },
    }
  },
})

test.beforeEach(() => {})

test.serial('Check events service', async t => {
  const eventService = await serviceContainer('events')

  t.true(eventService.hasOwnProperty('create'), 'Expected create property')
})

test.serial('Check users service', async t => {
  const userService = await serviceContainer('users')

  t.true(userService.hasOwnProperty('create'), 'Expected create property')
})

// TODO: Review throwsAsync to run this test
test.skip('Not service found', async t => {
  const error = await t.throwsAsync(async () => {
    await serviceContainer('event')
  })
  t.is(error, undefined)
})

test.serial('Check auth code service', async t => {
  const service = await serviceContainer('authCode')

  t.true(
    service.hasOwnProperty('getAccessTokenByAuthCode'),
    'Expected getAccessTokenByAuthCode property'
  )
  t.true(
    service.hasOwnProperty('getAccessTokenByRefreshToken'),
    'Expected getAccessTokenByRefreshToken property'
  )
})
