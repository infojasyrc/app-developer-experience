const Joi = require('joi')

const updateEventSchema = Joi.object().keys({
  name: Joi.string(),
  description: Joi.string(),
  headquarter: Joi.string(),
  eventDate: Joi.date(),
  address: Joi.string(),
  type: Joi.string().regex(/^(Recruiting|Sales)$/),
  capacity: Joi.number().allow('', null),
  phoneNumber: Joi.string().allow('', null),
  status: Joi.string().regex(/^(active|inactive)$/),
})

module.exports = updateEventSchema
