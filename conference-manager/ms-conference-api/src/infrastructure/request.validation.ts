import express from 'express'

import getEnvironmentVariables from '../infrastructure/environment'
import serviceContainer from '../services/service.container'

const checkPublicUrls = (request: express.Request) => {
  return (
    request.path.includes('/v1/authenticate') ||
    request.path.includes('/v1/events') ||
    request.path.includes('/v1/token') ||
    request.path.includes('/v1/healthcheck') ||
    request.path.includes('/v1/open-api') ||
    request.path.includes('/v1/headquarters') ||
    request.path.includes('/v2') ||
    request.path.includes('/swagger')
  )
}

const requestvalidation = async (request: any, response: any, next: any) => {
  const environmentVariables = getEnvironmentVariables()
  // This validation enables insecure endpoints
  if (!environmentVariables.REQUIRES_AUTH) {
    next()
    return
  }

  if (checkPublicUrls(request)) {
    next()
    return
  }

  try {
    const token = request.headers['authorization']?.replace('Bearer ', '')

    const authService: any = await serviceContainer('authentication')
    const authVerifyResponse = await authService?.verifyToken(token)

    if (!authVerifyResponse.status) {
      return response.status(401).json({ status: '401', message: 'Unauthorized', data: {} })
    }

    request.user = { id: authVerifyResponse.data.id }
  } catch (error) {
    console.log(error)
    return response
      .status(500)
      .json({ status: '500', message: 'Error occurred during token verification', data: {} })
  }
  next()
}

export { requestvalidation }
