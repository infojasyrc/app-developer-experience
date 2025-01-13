'use strict'

const express = require('express')
const authenticationController = require('./authentication.controller')
const authenticateUserToken = require('../../../middlewares/auth-user-token')
const router = express.Router()

router.post('/revoke-token', authenticateUserToken, authenticationController.revokeToken)
router.post('/reset-password', authenticationController.resetPassword)
router.post('/create', authenticationController.create)

module.exports = router
