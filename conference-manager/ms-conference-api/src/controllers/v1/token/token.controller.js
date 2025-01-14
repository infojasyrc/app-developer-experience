'use strict'

const serviceContainer = require('../../../services/service.container')

const authorizationCodeGrantType = 'authorization_code'
const refreshTokenGrantType = 'refresh_token'

const handleAuthorizationCodeGrantType = async code => {
  const dbService = await serviceContainer('authCode')
  if (!code) {
    return { responseCode: 404, data: {} }
  }
  return await dbService.getAccessTokenByAuthCode(code)
}

const handleRefreshTokenGrantType = async refreshToken => {
  const dbService = await serviceContainer('authCode')

  if (!refreshToken) {
    return { responseCode: 404, data: {} }
  }
  return await dbService.getAccessTokenByRefreshToken(refreshToken)
}

const get = async (request, response) => {
  if (request.query.grant_type === authorizationCodeGrantType) {
    const responseData = await handleAuthorizationCodeGrantType(request.query.code)
    return response.status(responseData.responseCode).json(responseData.data)
  }

  if (request.query.grant_type === refreshTokenGrantType) {
    const responseData = await handleRefreshTokenGrantType(request.query.refresh_token)
    return response.status(responseData.responseCode).json(responseData.data)
  }

  return response.status(404).json({})
}

const post = async (request, response) => {
  if (request.body.grant_type === authorizationCodeGrantType) {
    const responseData = await handleAuthorizationCodeGrantType(request.body.code)
    return response.status(responseData.responseCode).json(responseData.data)
  }

  if (request.body.grant_type === refreshTokenGrantType) {
    const responseData = await handleRefreshTokenGrantType(request.body.refresh_token)
    return response.status(responseData.responseCode).json(responseData.data)
  }

  return response.status(404).json({})
}

module.exports = {
  get,
  post,
}
