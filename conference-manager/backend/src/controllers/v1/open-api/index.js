'use strict'

const express = require('express')
const openApiController = require('./open-api.controller')
const router = express.Router()

router.get('/', openApiController.getTemplate)

module.exports = router
