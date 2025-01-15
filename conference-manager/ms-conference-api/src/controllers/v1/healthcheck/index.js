'use strict';

const express = require('express');
const healthcheckController = require('./healthcheck.controller');
const router = express.Router();

router.get('/', healthcheckController.check);

module.exports = router;
