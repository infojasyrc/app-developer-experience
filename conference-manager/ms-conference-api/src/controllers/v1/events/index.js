'use strict'

const express = require('express')
const eventsController = require('./events.controller')
const eventController = require('./event.controller')
const authenticateUserToken = require('../../../middlewares/auth-user-token')
const authenticateAdminUser = require('../../../middlewares/auth-user-admin')
const createEventMiddleware = require('../../../middlewares/create-event')
const eventIdtMiddleware = require('../../../middlewares/event-id')
const updateEventMiddleware = require('../../../middlewares/update-event')
const checkTokenToListEvents = require('../../../middlewares/check-token-list-events')

const router = express.Router()

router.get('/', checkTokenToListEvents, eventsController.get)

router.get('/:id', eventController.get)
router.post(
  '/',
  authenticateUserToken,
  authenticateAdminUser,
  createEventMiddleware,
  eventController.post
)
router.put(
  '/:id',
  authenticateUserToken,
  authenticateAdminUser,
  eventIdtMiddleware,
  updateEventMiddleware,
  eventController.update
)
router.delete(
  '/:id/delete',
  authenticateUserToken,
  authenticateAdminUser,
  eventIdtMiddleware,
  eventController.remove
)

router.put('/:id/images', eventController.updateImages)
router.put('/:id/open', eventController.open)
router.put('/:id/pause', eventController.pause)
router.put('/:id/close', eventController.close)
router.put('/:id/attendees', authenticateUserToken, eventController.addAttendees)
router.delete('/:id/:idImage', authenticateUserToken, eventController.deleteImage)

module.exports = router
