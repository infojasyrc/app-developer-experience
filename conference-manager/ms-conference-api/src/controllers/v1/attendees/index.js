'use strict';

const express = require('express');
const attendeesController = require('./attendees.controller');
const attendeeController = require('./attendee.controller');

const router = express.Router();
// For attendees
router.get('/:id', attendeesController.get);
// For attendee
router.get('/', attendeeController.get);
router.post('/', attendeeController.post);
router.put('/:id/update', attendeeController.update);
router.delete('/:id/delete', attendeeController.remove);

module.exports = router;
