const Joi = require('joi')

const createEventSchema = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  headquarter: Joi.string().required(),
  eventDate: Joi.date().required(),
  address: Joi.string().required(),
  type: Joi.string()
    .regex(/^(Recruiting|Sales|Networking)$/)
    .required(),
  tags: Joi.string()
    .regex(/^(Architecture|Design|Devops)$/)
    .required(),
  capacity: Joi.number().allow('', null),
  phoneNumber: Joi.string().allow('', null),
})

module.exports = createEventSchema
