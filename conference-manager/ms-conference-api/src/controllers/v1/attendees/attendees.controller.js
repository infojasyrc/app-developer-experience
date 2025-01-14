'use strict'

const { parse } = require('json2csv')

const serviceContainer = require('../../../services/service.container')

const get = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.params.id) {
    return response
      .status(200)
      .json({ status: 'OK', data: {}, message: 'Missing eventId parameter' })
  }

  const id = request.params.id

  const fields = [
    {
      label: 'Nombre',
      value: 'firstName',
      default: '',
    },
    {
      label: 'Apellido',
      value: 'lastName',
      default: '',
    },
    {
      label: 'E-Mail',
      value: 'email',
      default: '',
    },
    {
      label: 'Teléfono',
      value: 'phoneNumber',
      default: '',
    },
    {
      label: 'Compañía',
      value: 'company',
      default: '',
    },
    {
      label: 'Cargo',
      value: 'position',
      default: '',
    },
    {
      label: 'Universidad',
      value: 'university',
      default: '',
    },
    {
      label: 'Java',
      value: row => (row.java ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: '.Net',
      value: row => (row.dotNet ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'PHP',
      value: row => (row.php ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Mobile',
      value: row => (row.mobile ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Full Stack',
      value: row => (row.fullstack ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'UI',
      value: row => (row.ui ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'QA',
      value: row => (row.qa ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Otros',
      value: row => (row.others ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Estudiante',
      value: row => (row.student ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Sin Experiencia',
      value: row => (row.noExperience ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: '1 a 3',
      value: row => (row.oneToThree ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: '3 a 5',
      value: row => (row.threeToFive ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Más de 5',
      value: row => (row.moreThanFive ? 'Sí' : 'No'),
      default: '',
    },
    {
      label: 'Scrum/Líder',
      value: row => (row.scrumLeader ? 'Sí' : 'No'),
      default: '',
    },
  ]

  const options = {
    fields: fields,
    quotes: '"',
    withBOM: true,
    delimiter: ';',
  }

  try {
    let eventResponse = await eventsService.findById(id)

    const event = eventResponse.data

    const csv = parse(event.attendees, options)

    response.set('Content-Type', 'application/octet-stream')
    response.set('Content-disposition', `attachment;filename=${event.name}.csv`)
    response.status(200)
    response.send(new Buffer(csv))
  } catch (error) {
    console.error('Error while exporting attendees', error)
    response
      .status(500)
      .json({ status: 'ERROR', data: {}, message: 'Error while exporting attendees' })
  }
}

module.exports = {
  get,
}
