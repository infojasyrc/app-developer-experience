const isObjectEmpty = data => (Object.entries(data).length === 0 ? true : false)

const eventStatus = Object.freeze({
  created: 'created',
  active: 'active',
  inactive: 'inactive',
  deleted: 'deleted',
})

module.exports = { isObjectEmpty, eventStatus }
