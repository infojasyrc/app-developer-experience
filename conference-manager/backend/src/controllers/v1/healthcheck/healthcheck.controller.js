const check = (request, response) => {
  return response.status(200).json({ status: 'OK' })
}

module.exports = { check }
