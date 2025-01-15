const Joi = require('joi')

const eventIdSchema = Joi.object().keys({
  id: Joi.string()
    .required()
    .regex(/[0-9A-Fa-f]{6}/),
})

module.exports = eventIdSchema
