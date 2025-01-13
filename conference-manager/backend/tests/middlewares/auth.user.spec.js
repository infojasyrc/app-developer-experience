const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const fakeUser = { id: '123' }

const authenticateUserToken = function (testCase) {
  let stub
  switch (testCase) {
    case 'ValidToken':
      stub = {
        status: testCase,
        data: { id: '123' },
        message: 'Successfully verified Token',
        responseCode: 200,
      }
      break
    case 'InvalidToken':
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
  return proxyquire('../../src/middlewares/auth-user-token', {
    '../../src/services/service.container': stub
      ? sinon.stub().returns({
          verifyToken: sinon.stub().returns(stub),
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

test('should get a valid token', async t => {
  const { res, next } = t.context
  const req = { headers: { authorization: 'Bearer validtoken' } }

  const getUserTokenMiddleware = authenticateUserToken('ValidToken')
  await getUserTokenMiddleware(req, res, next)

  t.deepEqual(req.user, fakeUser)
  t.true(next.called)
  t.false(res.status.called, 'res.status should not be called')
  t.false(res.json.called, 'res.json should not be called')
})

test('returns 401 if no authorization header', async t => {
  const { res, next } = t.context
  const req = { headers: {} }

  const getUserTokenMiddleware = authenticateUserToken('InvalidToken')
  await getUserTokenMiddleware(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWith({ status: '401', message: 'Missing authorization headers data' }))
  t.false(next.called)
})

test('returns 401 if token is invalid', async t => {
  const { res, next } = t.context
  const req = { headers: { authorization: 'Bearer invalidtoken' } }

  const getUserTokenMiddleware = authenticateUserToken('InvalidToken')
  await getUserTokenMiddleware(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWith({ status: '401', message: 'Unauthorized' }))
  t.false(next.called)
})

test('returns 500 if an error occurs', async t => {
  const { res, next } = t.context
  const req = { headers: { authorization: 'Bearer validtoken' } }

  const getUserTokenMiddleware = authenticateUserToken('Error')
  await getUserTokenMiddleware(req, res, next)

  t.true(res.status.calledWith(500))
  t.true(
    res.json.calledWith({
      status: '500',
      message: 'Error occurred at authenticate user token - middleware',
    })
  )
  t.false(next.called)
})
