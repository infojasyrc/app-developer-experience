'use strict'

const get = (request, response) => {
  return response.status(200).json({
    status: 'OK',
  })
}

const post = (request, response) => {
  return response.status(200).json({
    status: 'OK',
  })
}

const update = (request, response) => {
  return response.status(200).json({
    status: 'OK',
  })
}

const remove = (request, response) => {
  return response.status(200).json({
    status: 'OK',
  })
}

module.exports = {
  get,
  post,
  update,
  remove,
}
