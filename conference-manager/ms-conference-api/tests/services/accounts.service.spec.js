'use strict'

const test = require('ava')
const sinon = require('sinon')

const setupAccountsService = require('./../../src/services/accounts.service')

const collectionKey = 'accounts'
let sandbox = null
let dbInstanceStub = {}
let accountsService
const userId = 'thisIsAUserId'

test.beforeEach(() => {
  sandbox = sinon.createSandbox()

  dbInstanceStub.collection = sandbox.stub()
  dbInstanceStub.collection.withArgs(collectionKey).returns({
    where: () => {
      return {
        get: () => {
          return Promise.resolve([
            {
              id: 'aaaaaa',
              data: () => {
                return {
                  name: 'Cuenta Corriente',
                  balance: 20000000.88,
                  userId: userId,
                  default: true,
                }
              },
            },
            {
              id: 'bbbbbbbbb',
              data: () => {
                return {
                  name: 'Cuenta Ahorros',
                  balance: 20000000.88,
                  userId: userId,
                  default: false,
                }
              },
            },
          ])
        },
        where: () => {
          return {
            get: () => {
              return Promise.resolve([
                {
                  id: 'aaaaaa',
                  data: () => {
                    return {
                      name: 'Cuenta Corriente',
                      balance: 20000000.88,
                      userId: userId,
                      default: true,
                    }
                  },
                },
              ])
            },
          }
        },
      }
    },
    doc: () => {
      return {
        get: () => {
          return Promise.resolve({
            id: 'thisIsAnAccountId',
            data: () => {
              return {
                name: 'Cuenta Corriente',
                default: true,
                balance: 2000000.0,
                userId: 'thisIsAUserId',
              }
            },
          })
        },
        update: () => {
          return Promise.resolve({})
        },
      }
    },
  })

  accountsService = setupAccountsService(dbInstanceStub)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Check balance', async t => {
  const userBalance = await accountsService.checkBalance(userId)

  t.true(userBalance.hasOwnProperty('message'), 'Expected message key')
  t.true(userBalance.hasOwnProperty('data'), 'Expected data key')
  t.true(userBalance.data > 0, 'Expected a balance greater than 0')
})

test.serial('Get all accounts', async t => {
  const allAccounts = await accountsService.getAll(userId)

  t.true(allAccounts.hasOwnProperty('message'), 'Expected message key')
  t.true(allAccounts.hasOwnProperty('data'), 'Expected data key')
  t.true(allAccounts.data.length > 0, 'Expected accounts in data')
})

test.serial('Get default account', async t => {
  const defaultAccountResponse = await accountsService.getDefaultAccount(userId)

  t.true(defaultAccountResponse.hasOwnProperty('message'), 'Expected message key')
  t.true(defaultAccountResponse.hasOwnProperty('data'), 'Expected data key')
  t.true(defaultAccountResponse.data.hasOwnProperty('id'), 'Expected id property')
  t.true(defaultAccountResponse.data.hasOwnProperty('name'), 'Expected name property')
  t.true(defaultAccountResponse.data.hasOwnProperty('default'), 'Expected default property')
  t.true(defaultAccountResponse.data.default, 'Expected default account key as true')
})

test.serial('Update account by transaction amount', async t => {
  const accountId = 'thisIsAnAccountId'
  const transactionAmount = 200.0

  const accountResponse = await accountsService.updateBalance(accountId, transactionAmount)

  t.true(accountResponse.hasOwnProperty('message'), 'Expected message key')
  t.true(accountResponse.hasOwnProperty('data'), 'Expected data key')
})
