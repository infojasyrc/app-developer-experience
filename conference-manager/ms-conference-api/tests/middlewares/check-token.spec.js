const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const checkTokenListEvents = function (testCase) {
  let verifyTokenStub
  switch (testCase) {
    case 'ValidToken':
      verifyTokenStub = {
        status: testCase,
        data: { id: '123' },
        message: 'Successfully verified Token',
        responseCode: 200,
      }
      break
    case 'InvalidToken':
      verifyTokenStub = {
        status: false,
        data: {},
        message: 'Unverified Token',
        responseCode: 500,
      }
      break
    case 'Error':
      verifyTokenStub = null
      break
  }

  const findByIdStub = {
    data: {
      isAdmin: true,
    },
  }
  return proxyquire('../../src/middlewares/check-token-list-events', {
    '../../src/services/service.container': sinon.stub().returns({
      findById: sinon.stub().returns(findByIdStub),
      verifyToken: sinon.stub().returns(verifyTokenStub),
    }),
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

test('should get a valid token as admin', async t => {
  const { res, next } = t.context
  const req = { headers: { authorization: 'Bearer validtoken' }, query: { isAdmin: true } }

  const checkTokenMiddleware = checkTokenListEvents('ValidToken')
  await checkTokenMiddleware(req, res, next)

  t.deepEqual(req.query.isAdmin, true)
  t.true(next.called)
  t.false(res.status.called, 'res.status should not be called')
  t.false(res.json.called, 'res.json should not be called')
})

test('returns 401 if token is invalid', async t => {
  const { res, next } = t.context
  const req = { headers: { authorization: 'Bearer invalidtoken' } }

  const checkTokenMiddleware = checkTokenListEvents('InvalidToken')
  await checkTokenMiddleware(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(
    res.json.calledWith({ status: '401', message: 'Passed token is not valid to this transaction' })
  )
  t.false(next.called)
})

test('returns 500 if an error occurs', async t => {
  const { res, next } = t.context
  const req = { headers: { authorization: 'Bearer validtoken' } }

  const checkTokenMiddleware = checkTokenListEvents('Error')
  await checkTokenMiddleware(req, res, next)

  t.true(res.status.calledWith(500))
  t.true(
    res.json.calledWith({
      status: '500',
      message: 'Error occurred at check token list events',
    })
  )
  t.false(next.called)
})
