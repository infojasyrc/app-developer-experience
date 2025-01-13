const serviceContainer = require('../services/service.container')

async function checkTokenToListEvents(req, res, next) {
  try {
    if (req.headers.authorization) {
      const authService = await serviceContainer('authentication')
      const userService = await serviceContainer('users')

      const token = req.headers['authorization'].replace('Bearer ', '')
      const authVerifyResponse = await authService.verifyToken(token)

      if (!token || !authVerifyResponse.status) {
        return res
          .status(401)
          .json({ status: '401', message: 'Passed token is not valid to this transaction' })
      }

      const userData = await userService.findById(authVerifyResponse.data.id)
      if (userData.data.isAdmin) {
        req.query.isAdmin = true
      }
    }
    next()
  } catch (error) {
    // This is because firebase was not initialize
    if (error.code === 'app/invalid-credential') {
      res.status(500).json({ status: '500', message: 'Authentication service was not initialize' })
    }
    return res
      .status(500)
      .json({ status: '500', message: 'Error occurred at check token list events' })
  }
}

module.exports = checkTokenToListEvents
