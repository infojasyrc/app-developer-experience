'use strict'

const setupServiceProviders = require('./../providers')

const UserService = require('./user.service')
const setupAttendeesService = require('./attendees.service')
const EventsService = require('./events.service')
const AuthenticationService = require('./authentication.service')
const setupRolesService = require('./roles.service')
const HeadquartersService = require('./headquarters.service')
const setupStorageService = require('./storage.service')
const setupAccountsService = require('./accounts.service')
const setupSessionService = require('./session.service')
const setupAuthCodeService = require('./auth.codes.service')

module.exports = async () => {
  const serviceProviders = await setupServiceProviders()

  const authenticationService = new AuthenticationService(serviceProviders.adminAuth)
  const userService = new UserService(serviceProviders.clientMongo)
  const attendeesService = setupAttendeesService(serviceProviders.clientMongo)
  const eventsService = new EventsService(serviceProviders.clientMongo)
  const rolesService = setupRolesService(serviceProviders.clientMongo)
  const headquartersService = new HeadquartersService(serviceProviders.clientMongo)
  const storageService = serviceProviders.dbInstance
    ? setupStorageService(serviceProviders.bucket)
    : null
  const accountsService = serviceProviders.dbInstance
    ? setupAccountsService(serviceProviders.dbInstance)
    : null
  const sessionService = serviceProviders.dbInstance
    ? new setupSessionService(serviceProviders.adminAuth)
    : null
  const authCodesService = serviceProviders.dbInstance
    ? setupAuthCodeService(serviceProviders.adminAuth, serviceProviders.dbInstance)
    : null

  return {
    authCodesService,
    authenticationService,
    accountsService,
    attendeesService,
    eventsService,
    headquartersService,
    rolesService,
    storageService,
    userService,
    sessionService,
  }
}
