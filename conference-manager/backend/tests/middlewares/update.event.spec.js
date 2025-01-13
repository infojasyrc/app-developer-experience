const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const Joi = require('joi')

const stubSchema = {
  updateEventSchema: sinon.stub().returns(
    Joi.object().keys({
      name: Joi.string(),
      description: Joi.string(),
      headquarter: Joi.string(),
      date: Joi.date(),
      address: Joi.string(),
      type: Joi.string().regex(/^(Recruiting|Sales)$/),
      capacity: Joi.number().allow('', null),
      phoneNumber: Joi.string().allow('', null),
    })
  ),
}

const stubValidator = sinon.stub()
const updateEventMiddleware = function () {
  return proxyquire('../../src/middlewares/update-event', {
    '../../src/validations/schema-validator': stubValidator,
    '../../src/validations/schemas/events/update-event': sinon.stub().returns({
      updateEventSchema: sinon.stub().returns(stubSchema),
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

test('should validate successfully update event req.body', async t => {
  const { res, next } = t.context
  const req = {
    body: {
      name: 'FIXING FOR TESTS',
      description: 'Testing at demo day!',
    },
  }
  const stubValidatorValue = true
  stubValidator.returns({
    schemaValidator: sinon.stub().returns(stubValidatorValue),
  })
  const getUpdateEventMiddleware = updateEventMiddleware()
  await getUpdateEventMiddleware(req, res, next)

  t.true(next.called)
  t.false(res.status.called, 'res.status should not be called')
  t.false(res.json.called, 'res.json should not be called')
})

test('returns 422 if req.body update event schema is not valid', async t => {
  const { res, next } = t.context
  const req = {
    body: { notvalidKey: 'notValidType' },
  }
  const stubValidatorValue = {
    error: '"notvalidKey" is not valid ',
  }
  stubValidator.returns(stubValidatorValue)
  const getUpdateEventMiddleware = updateEventMiddleware()
  await getUpdateEventMiddleware(req, res, next)

  t.true(res.status.calledWith(422))
  t.true(
    res.json.calledWith({
      status: '422',
      message: '"notvalidKey" is not valid ',
    })
  )
  t.false(next.called)
})

test('returns 500 if an error occurs', async t => {
  const { res, next } = t.context
  const req = {}

  const getUpdateEventMiddleware = updateEventMiddleware(stubValidator.throws())
  await getUpdateEventMiddleware(req, res, next)

  t.true(res.status.calledWith(500))
  t.true(
    res.json.calledWith({
      status: '500',
      message: 'Error occurred at update event',
    })
  )
  t.false(next.called)
})
