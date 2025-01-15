const serviceContainer = require('../services/service.container')

async function authenticateUserToken(req, res, next) {
  try {
    if (!req.headers['authorization']) {
      return res.status(401).json({ status: '401', message: 'Missing authorization headers data' })
    }

    const token = req.headers['authorization'].replace('Bearer ', '')
    const authService = await serviceContainer('authentication')
    const authVerifyResponse = await authService.verifyToken(token)

    if (!token || !authVerifyResponse.status) {
      return res.status(401).json({ status: '401', message: 'Unauthorized' })
    }

    req.user = { id: authVerifyResponse.data.id }
    next()
  } catch (error) {
    return res
      .status(500)
      .json({ status: '500', message: 'Error occurred at authenticate user token - middleware' })
  }
}

module.exports = authenticateUserToken
