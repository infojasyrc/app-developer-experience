const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const Joi = require('joi')

const stubSchema = {
  eventIdSchema: sinon.stub().returns(
    Joi.object().keys({
      id: Joi.string()
        .required()
        .regex(/[0-9A-Fa-f]{6}/),
    })
  ),
}
const stubValidator = sinon.stub()
const eventIdMiddleware = function () {
  return proxyquire('../../src/middlewares/event-id', {
    '../../src/validations/schema-validator': stubValidator,
    '../../src/validations/schemas/events/event-id': sinon.stub().returns({
      eventIdSchema: sinon.stub().returns(stubSchema),
      '../../src/services/service.container': sinon.stub().returns({
        findByIdFromMongo: stubValidator,
      }),
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

test.skip('should validate successfully update event id req.params', async t => {
  const { res, next } = t.context
  const req = {
    params: {
      id: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
    },
  }
  const stubValidatorValue = true
  stubValidator.returns({
    schemaValidator: sinon.stub().returns(stubValidatorValue),
  })
  const getEventIdEventMiddleware = eventIdMiddleware()
  await getEventIdEventMiddleware(req, res, next)

  t.true(next.called)
  t.false(res.status.called, 'res.status should not be called')
  t.false(res.json.called, 'res.json should not be called')
})

test('returns 422 if req.params event id schema is not valid', async t => {
  const { res, next } = t.context
  const req = {
    params: { id: 'not24hexcharsid' },
  }
  const stubValidatorValue = {
    error: `"id" with value "${req.params.id}" fails to match the required pattern: /[0-9A-Fa-f]{6}/`,
  }
  stubValidator.returns(stubValidatorValue)
  const getEventIdEventMiddleware = eventIdMiddleware()
  await getEventIdEventMiddleware(req, res, next)

  t.true(res.status.calledWith(422))
  t.true(
    res.json.calledWith({
      status: '422',
      message: `"id" with value "${req.params.id}" fails to match the required pattern: /[0-9A-Fa-f]{6}/`,
    })
  )
  t.false(next.called)
})

test('returns 500 if an error occurs', async t => {
  const { res, next } = t.context
  const req = {}

  const getEventIdEventMiddleware = eventIdMiddleware(stubValidator.throws())
  await getEventIdEventMiddleware(req, res, next)

  t.true(res.status.calledWith(500))
  t.true(
    res.json.calledWith({
      status: '500',
      message: 'Error occurred at update event',
    })
  )
  t.false(next.called)
})
