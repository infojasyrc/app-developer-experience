'use strict';

const attendee = {
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  company: '',
  position: '',
  university: ''
};

const technologies = [
  {
    id: 1,
    name: 'Java'
  }, {
    id: 2,
    name: 'QA'
  }, {
    id: 3,
    name: '.Net'
  }, {
    id: 4,
    name: 'Android'
  }, {
    id: 5,
    name: 'iOS'
  }, {
    id: 6,
    name: 'UI'
  }, {
    id: 7,
    name: 'PHP'
  }, {
    id: 8,
    name: 'NodeJS'
  }, {
    id: 9,
    name: 'Full Stack'
  }, {
    id: 10,
    name: 'Otros'
  }
];

const expertise = [
  {
    id: 1,
    name: 'Soy estudiante'
  }, {
    id: 2,
    name: 'Sin experiencia o menos de 1'
  }, {
    id: 3,
    name: 'Entre 1 y 3'
  }, {
    id: 4,
    name: 'Entre 3 y 5'
  }, {
    id: 5,
    name: 'Mas de 5'
  }, {
    id: 6,
    name: 'Scrum Master / Lider'
  }
];

module.exports = {
  attendee,
  technologies,
  expertise
};
