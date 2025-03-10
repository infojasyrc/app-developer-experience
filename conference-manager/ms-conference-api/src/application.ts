import express, { json, urlencoded } from 'express'

import { requestvalidation } from './infrastructure/request.validation'
import router from './controllers/v1'

const getApplication = () => {
  const expressApp = express()
  expressApp.use(json())
  expressApp.use(urlencoded({ extended: false }))
  // This is the validation for public endpoints and authorization token in the header
  expressApp.use(requestvalidation)
  expressApp.use('/v1', router)

  return expressApp
}

export { getApplication }
