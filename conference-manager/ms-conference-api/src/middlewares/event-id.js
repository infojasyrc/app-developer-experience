const schemaValidator = require('../validations/schema-validator')
const serviceContainer = require('../services/service.container')
const eventIdSchema = require('../validations/schemas/events/event-id')

async function eventIdtMiddleware(req, res, next) {
  try {
    const validate = await schemaValidator(req.params, eventIdSchema)
    if (validate.error) {
      return res.status(422).json({ status: '422', message: validate.error })
    }

    const eventService = await serviceContainer('events')
    const eventData = await eventService.findByIdFromMongo(req.params.id)

    if (!eventData) {
      return res.status(404).json({ status: '404', message: 'Passed event id was not found' })
    }
    next()
  } catch (error) {
    return res.status(500).json({ status: '500', message: 'Error occurred at update event' })
  }
}

module.exports = eventIdtMiddleware
