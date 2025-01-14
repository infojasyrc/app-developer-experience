'use strict';

const express = require('express');
const imagesController = require('./image.controller');

const router = express.Router();

router.post('/:id', imagesController.post);
router.delete('/:id', imagesController.erase);

module.exports = router;