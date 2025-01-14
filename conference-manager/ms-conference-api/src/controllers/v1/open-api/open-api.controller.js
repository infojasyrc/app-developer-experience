const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const getTemplate = (request, response) => {
  const filePath = './../../../templates'
  const fileName = 'api.yml'
  const ymlPath = path.join(__dirname, filePath, fileName)

  if (fs.existsSync(ymlPath)) {
    const contentFile = fs.readFileSync(ymlPath, 'utf-8')
    const ymlData = yaml.load(contentFile)
    return response.json(ymlData)
  } else {
    response.status(404).json({ error: 'File not found' })
  }
}

module.exports = { getTemplate }
