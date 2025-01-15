'use strict'

const test = require('ava')

const setupBaseService = require('./../../src/services/base.service')

let baseService

test.beforeEach(() => {
  baseService = new setupBaseService()
})

test('Initial base service', t => {
  t.is(baseService.hasOwnProperty('returnData'), true, 'Expected returnData property')
  t.is(baseService.returnData.hasOwnProperty('data'), true, 'Expected data property')
  t.is(baseService.returnData.hasOwnProperty('message'), true, 'Expected message property')
  t.is(baseService.returnData.hasOwnProperty('status'), true, 'Expected status property')
  t.is(
    baseService.returnData.hasOwnProperty('responseCode'),
    true,
    'Expected responseCode property'
  )
})
