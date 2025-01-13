const schemaValidator = require('../validations/schema-validator')
const updateEventSchema = require('../validations/schemas/events/update-event')

async function updateEventMiddleware(req, res, next) {
  try {
    const validate = await schemaValidator(req.body, updateEventSchema)
    if (validate.error) {
      return res.status(422).json({ status: '422', message: validate.error })
    }
    next()
  } catch (error) {
    return res.status(500).json({ status: '500', message: 'Error occurred at update event' })
  }
}

module.exports = updateEventMiddleware
