'use strict';

const express = require('express');
const rolesController = require('./roles.controller');
const roleController = require('./role.controller');

const router = express.Router();

router.get('/', rolesController.get);
router.get('/roles/:id', roleController.get);

module.exports = router;
