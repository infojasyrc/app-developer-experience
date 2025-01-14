'use strict'

const test = require('ava')
const sinon = require('sinon')

const setupRolesService = require('./../../src/services/roles.service')

const collectionKey = 'roles'
let rolesService
let dbInstanceStub = null
let sandbox = null

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  dbInstanceStub = {}
  dbInstanceStub.collection = sandbox.stub()
  dbInstanceStub.collection.withArgs(collectionKey).returns({
    get: () => {
      return Promise.resolve([
        {
          id: 'aaaaaaaa',
          data: () => {
            return {
              id: '1',
              name: 'Marketing',
            }
          },
        },
        {
          id: 'bbbbbbbb',
          data: () => {
            return {
              id: '2',
              name: 'Human Resources',
            }
          },
        },
      ])
    },
    doc: docId => {
      return {
        get: () => {
          return Promise.resolve({
            exists: true,
            data: () => {
              return {}
            },
          })
        },
      }
    },
  })

  rolesService = setupRolesService(dbInstanceStub)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Get roles', async t => {
  let roleData = await rolesService.doList()

  t.is(roleData.hasOwnProperty('data'), true, 'Expected data key')
  t.is(roleData.hasOwnProperty('message'), true, 'Expected message key')
})

test.serial('Get role', async t => {
  let roleData = await rolesService.getRole()

  t.is(roleData.hasOwnProperty('data'), true, 'Expected data key')
  t.is(roleData.hasOwnProperty('message'), true, 'Expected message key')
})
