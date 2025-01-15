'use strict'

const test = require('ava')
const sinon = require('sinon')

const HeadquartersService = require('./../../src/services/headquarters.service')

const collectionKey = 'headquarters'
let sandbox = null
let dbInstanceStub = null

let headquartersService
const mockHeadquarterData = [
  {
    _id: '647f965453db8aad4edf33cf',
    name: 'Bogota',
  },
  {
    _id: '647f965453db8aad4edf33d0',
    name: 'Lima',
  },
]

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  dbInstanceStub = {
    collection: sandbox.stub().returns({
      find: sandbox.stub().returns({
        toArray: sandbox.stub().returns(mockHeadquarterData),
      }),
    }),
  }

  headquartersService = new HeadquartersService(dbInstanceStub)
})

test.afterEach(() => {})

test.serial('Do list headquarters', async t => {
  let headquarterData = await headquartersService.doList()

  t.is(headquarterData.hasOwnProperty('data'), true, 'Expected data key')
  t.is(headquarterData.hasOwnProperty('message'), true, 'Expected message key')
  t.is(headquarterData['data'].length, mockHeadquarterData.length, 'Expected 2 elements')
})

test.skip('Get headquarter', async t => {
  let data = 'aaaaaaa'

  let headquarterData = await headquartersService.getHeadquarter(data)

  t.is(headquarterData.hasOwnProperty('data'), true, 'Expected data key')
  t.is(headquarterData.hasOwnProperty('message'), true, 'Expected message key')
  t.is(headquarterData['data']['id'], data, 'Expected same value')
})
