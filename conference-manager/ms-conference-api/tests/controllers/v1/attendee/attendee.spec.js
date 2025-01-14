'use strict'

const test = require('ava')
const { attendee, technologies, expertise } = require('./../../../fixtures/attendee')

test('Attende', t => {
  const expectedAttend = Object.assign({}, attendee)

  t.deepEqual(expectedAttend, attendee, 'Expected same element')
  t.is(technologies.length, 10, 'Expected 10 elements')
  t.is(expertise.length, 6), 'Expected 6 elements'
})
