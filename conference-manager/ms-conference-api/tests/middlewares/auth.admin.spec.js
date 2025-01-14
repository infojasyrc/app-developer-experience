const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const authenticateAdminUser = function (testCase) {
  let stub
  switch (testCase) {
    case 'isAdmin':
      stub = {
        data: {
          isAdmin: true,
        },
      }
      break
    case 'IsNotAdmin':
      stub = {
        status: false,
        data: {},
        message: 'Unverified Token',
        responseCode: 500,
      }
      break
    case 'Error':
      stub = null
      break
  }
  return proxyquire('../../src/middlewares/auth-user-admin', {
    './../../src/services/service.container': stub
      ? sinon.stub().returns({
          findById: sinon.stub().returns(stub),
        })
      : sinon.stub().throws(),
  })
}

test.beforeEach(t => {
  sinon.createSandbox()

  t.context.res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  }
  t.context.next = sinon.spy()
})

test.afterEach(() => {
  sinon.restore()
})

test('should get user is admin', async t => {
  const { res, next } = t.context
  const req = { user: { id: 'idOfAdminUser' } }

  const getUserAdminMiddleware = authenticateAdminUser('isAdmin')
  await getUserAdminMiddleware(req, res, next)

  t.true(next.called)
  t.false(res.status.called, 'res.status should not be called')
  t.false(res.json.called, 'res.json should not be called')
})

test('returns 401 if user is not admin', async t => {
  const { res, next } = t.context
  const req = { user: { id: 'notAdminUser' } }

  const getUserAdminMiddleware = authenticateAdminUser('IsNotAdmin')
  await getUserAdminMiddleware(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(
    res.json.calledWith({
      status: '401',
      message: 'Unauthorized, to perform this action admin role is required',
    })
  )
  t.false(next.called)
})

test('returns 500 if an error occurs', async t => {
  const { res, next } = t.context
  const req = { user: { id: 'userId' } }

  const getUserAdminMiddleware = authenticateAdminUser('Error')
  await getUserAdminMiddleware(req, res, next)

  t.true(res.status.calledWith(500))
  t.true(
    res.json.calledWith({
      status: '500',
      message: 'Error occurred at authenticate admin user',
    })
  )
  t.false(next.called)
})
