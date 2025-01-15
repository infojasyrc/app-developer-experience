'use strict';

const express = require('express');
const profileController = require('./profile.controller');

const router = express.Router();

router.get('/', profileController.get);

module.exports = router;