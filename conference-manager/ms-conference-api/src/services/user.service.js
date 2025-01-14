'use strict'

const BaseService = require('./base.service')
const User = require('./../models/user')

class UserService extends BaseService {
  constructor(dbInstance) {
    super()
    this.collection = dbInstance.collection('users')
  }

  /**
   * Create user document
   * @param {Object} userData
   */
  async create(userData) {
    let response
    const newUserData = {
      ...userData,
    }

    try {
      const newUserDoc = await this.collection.add(newUserData)
      newUserData.id = newUserDoc.id
      const successMessage = 'User was successfully created'

      response = this.getSuccessResponse(newUserData, successMessage)
    } catch (error) {
      const errorMessage = 'Error creating user document'
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  async doList() {
    let allUsers = []
    let response

    try {
      let userRefSnapshot = await this.collection.get()

      userRefSnapshot.forEach(doc => {
        let userData = doc.data()
        userData.id = doc.id
        allUsers.push(userData)
      })

      const successMessage = 'Getting all user list information successfully.'
      response = this.getSuccessResponse(allUsers, successMessage)
    } catch (err) {
      const errorMessage = 'Error getting user list information'
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  async findById(id) {
    try {
      const userRefSnapshot = await this.collection.findOne({ uid: id.toString() })

      if (!userRefSnapshot) {
        return this.getSuccessResponse({}, 'No existing data')
      }
      return this.getSuccessResponse(
        { id, ...userRefSnapshot },
        'Getting user information successfully'
      )
    } catch (err) {
      console.log('Error getting user information', err)
      return this.getErrorResponse('Error getting user information')
    }
  }
  async checkUserAttendeeStatus(eventId, userId, eventsService) {
    let response

    try {
      const eventData = await eventsService.findById(eventId)
      if (!eventData) {
        return this.getSuccessResponse(
          { attendanceConfirmed: false },
          'No existing data for this event'
        )
      }

      const userData = eventData.data.attendees.find(attendee => attendee === userId)
      if (!userData) {
        return this.getSuccessResponse(
          { attendanceConfirmed: false },
          'User not registered as an attendee for this event'
        )
      }

      return this.getSuccessResponse(
        { attendanceConfirmed: true },
        'User is an attendee of the event.'
      )
    } catch (err) {
      return this.getErrorResponse('Error getting user information')
    }
  }

  async findByUserId(userId) {
    let user = null
    let response

    try {
      let userRefSnapshot = await this.collection.where('uid', '==', userId).limit(1).get()

      if (userRefSnapshot.docs.length === 1) {
        user = userRefSnapshot.docs[0].data()
        user.id = userRefSnapshot.docs[0].id
      }

      const successMessage = 'Getting user information successfully'
      response = this.getSuccessResponse(user, successMessage)
    } catch (err) {
      const errorMessage = 'Error getting user information'
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  /**
   * Get user model
   * @param {Object} data
   */
  getModel(data) {
    return new User(data)
  }

  /**
   * Disable user for removing operation
   * @param {String} id
   */
  async toggleEnable(id) {
    let response
    try {
      const userInfoRef = await this.collection.doc(id).get()

      const userData = userInfoRef.data()
      userData.isEnabled = !userData.isEnabled

      await this.collection.doc(id).update({
        isEnabled: userData.isEnabled,
      })

      const successMessage = 'User was disabled successfully'
      response = this.getSuccessResponse(userData, successMessage)
    } catch (err) {
      const errorMessage = 'Error removing a user'
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  async update(userId, userData) {
    let userResponse = null
    let response

    try {
      await this.collection.doc(userId).update(userData)

      let userInfoRef = await this.collection.doc(userId).get()
      userResponse = {
        ...userInfoRef.data(),
        id: userId,
      }

      const successMessage = 'User was updated successfully'
      response = this.getSuccessResponse(userResponse, successMessage)
    } catch (err) {
      const errorMessage = 'Error updating a user'
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }
  async fetchUserEventsAttendance(userId, eventsService) {
    let response

    try {
      const eventsData = await eventsService.doList({})
      if (!eventsData) {
        return this.getSuccessResponse({}, 'No existing events to check')
      }
      const responseData = await this.addRegisteredField(userId, eventsData.data)

      return this.getSuccessResponse(responseData, 'Events retrieved successfully.')
    } catch (err) {
      return this.getErrorResponse('Error getting user information')
    }
  }
  async addRegisteredField(userId, events) {
    const updatedEvents = await events.map(
      ({ attendees, description, name, status, eventDate, _id }) => {
        const isUserSubscribed = attendees ? attendees.some(attendee => attendee === userId) : false
        const updatedDescription =
          description || 'Calling all curious minds! Exciting event details coming soon.'
        return {
          id: _id.toString(),
          name,
          status,
          eventDate,
          description: updatedDescription,
          subscribed: isUserSubscribed,
        }
      }
    )
    return updatedEvents
  }
}

module.exports = UserService
