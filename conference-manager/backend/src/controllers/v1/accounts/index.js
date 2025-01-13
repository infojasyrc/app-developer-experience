'use strict';

const express = require('express');
const accountsController = require('./accounts.controller');

const router = express.Router();

router.get('/', accountsController.getAll);
router.get('/check-balance', accountsController.checkBalance);

module.exports = router;
