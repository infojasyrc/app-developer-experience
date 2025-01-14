'use strict'

const express = require('express')
const headquartersController = require('./headquarters.controller')
const headquarterController = require('./headquarter.controller')

const router = express.Router()

router.get('/', headquartersController.get)
router.get('/:id', headquarterController.get)

module.exports = router
