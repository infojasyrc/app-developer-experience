const serviceContainer = require('../services/service.container')

const { isAuthEnabled } = require('./feature-flags')

async function authenticateAdminUser(req, res, next) {
  if (!isAuthEnabled()) {
    // When auth disabled treat all users as non-admin OR allow by policy; choose allow for simplicity
    return next()
  }
  try {
    const userService = await serviceContainer('users')
    const userData = await userService.findById(req.user.id)

    // TODO: create constant file for error handling
    if (!userData.data.isAdmin) {
      return res.status(401).json({
        status: '401',
        message: 'Unauthorized, to perform this action admin role is required',
      })
    }
    next()
  } catch (error) {
    return res
      .status(500)
      .json({ status: '500', message: 'Error occurred at authenticate admin user' })
  }
}

module.exports = authenticateAdminUser
