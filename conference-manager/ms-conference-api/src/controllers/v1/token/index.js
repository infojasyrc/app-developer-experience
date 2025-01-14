'use strict';

const express = require('express');
const tokenController = require('./token.controller');

const router = express.Router();

router.get('/access-token', tokenController.get);
router.post('/access-token', tokenController.post);

module.exports = router;
