const schemaValidator = require('../validations/schema-validator')
const createEventSchema = require('../validations/schemas/events/create-event')

async function createEventMiddleware(req, res, next) {
  try {
    const validate = await schemaValidator(req.body, createEventSchema)
    if (validate.error) {
      return res.status(422).json({ status: '422', message: validate.error })
    }
    next()
  } catch (error) {
    return res.status(500).json({ status: '500', message: 'Error occurred at create event' })
  }
}

module.exports = createEventMiddleware
