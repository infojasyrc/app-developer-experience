async function schemaValidator(data, schema) {
  const { error } = schema.validate(data)
  if (error) {
    const message = error.details.map(i => i.message).join(',')
    return { error: message }
  }
  return true
}

module.exports = schemaValidator
