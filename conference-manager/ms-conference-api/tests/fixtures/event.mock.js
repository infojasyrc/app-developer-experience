'use strict'

const MockHeadquarter = require('./headquarter')

class MockEvent {
  constructor() {}

  generate(eventData) {
    const event = {
      name: eventData.name || 'Event Name',
      address: '120 Main street',
      date: '2019-05-12T19:00',
      headquarter: MockHeadquarter.getBuenosAires(),
      images: [],
      responsable: {
        id: 'tlbhNksEGawqAOLKWUEL',
        name: 'Juan Perez',
      },
      phoneNumber: '9999999999',
      placeName: '',
      status: eventData.status || 'created',
      year: 2019,
    }

    if (eventData.id) {
      event.id = eventData.id
    }
    return event
  }

  generateList(eventsData) {
    return eventsData.map(event => this.generate(event))
  }
}

module.exports = MockEvent
