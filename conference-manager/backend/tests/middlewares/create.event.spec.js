const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const Joi = require('joi')

const stubSchema = {
  createEventSchema: sinon.stub().returns(
    Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().required(),
      headquarter: Joi.string().required(),
      date: Joi.date().required(),
      address: Joi.string().required(),
      type: Joi.string()
        .regex(/^(Recruiting|Sales)$/)
        .required(),
      tags: Joi.string()
        .regex(/^(Architecture|Design|Devops)$/)
        .required(),
      capacity: Joi.number().allow('', null),
      phoneNumber: Joi.string().allow('', null),
    })
  ),
}

const stubValidator = sinon.stub()
const createEventMiddleware = function () {
  return proxyquire('../../src/middlewares/create-event', {
    '../../src/validations/schema-validator': stubValidator,
    '../../src/validations/schemas/events/create-event': sinon.stub().returns({
      createEventSchema: sinon.stub().returns(stubSchema),
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

test('should validate successfully create event req.body', async t => {
  const { res, next } = t.context
  const req = {
    body: {
      name: 'Hackaton',
      date: '2023-03-15T17:00:00.000',
      headquarter: '64b979b96d50f43aaefa1a50',
      address: '121 Main Street',
      type: 'Sales',
      description: 'Test your abilities',
      tags: 'Devops',
    },
  }
  const stubValidatorValue = true
  stubValidator.returns({
    schemaValidator: sinon.stub().returns(stubValidatorValue),
  })
  const getCreateEventMiddleware = createEventMiddleware()
  await getCreateEventMiddleware(req, res, next)

  t.true(next.called)
  t.false(res.status.called, 'res.status should not be called')
  t.false(res.json.called, 'res.json should not be called')
})

test('returns 422 if req.body schema is not valid', async t => {
  const { res, next } = t.context
  const req = {
    body: {},
  }
  const stubValidatorValue = { error: '"name" is required' }
  stubValidator.returns(stubValidatorValue)
  const getCreateEventMiddleware = createEventMiddleware()
  await getCreateEventMiddleware(req, res, next)

  t.true(res.status.calledWith(422))
  t.true(
    res.json.calledWith({
      status: '422',
      message: '"name" is required',
    })
  )
  t.false(next.called)
})

test('returns 500 if an error occurs', async t => {
  const { res, next } = t.context
  const req = {}

  const getCreateEventMiddleware = createEventMiddleware(stubValidator.throws())
  await getCreateEventMiddleware(req, res, next)

  t.true(res.status.calledWith(500))
  t.true(
    res.json.calledWith({
      status: '500',
      message: 'Error occurred at create event',
    })
  )
  t.false(next.called)
})
