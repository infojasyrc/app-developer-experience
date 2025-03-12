const fs = require('fs')

const updateVersion = () => {
  const args = process.argv
  const fileName = '.env.production'

  if (args.length < 3) {
    // eslint-disable-next-line no-console
    console.info(
      'This tool updates Major, Minor and Patch versions. It should not be used ' +
        'for builds, since MeetApp is only built to be deployed to production and ' +
        'this might imply loosing a fix or improvement version.'
    )
    return
  }

  const operation = args[2]

  fs.readFile(fileName, 'utf-8', (err, content) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error while reading .env: ' + err)
      return
    }

    const lines = content.split(/\r?\n/)

    const versionLineIndex = getVersionLineIndex(lines)
    const versionLine = getCurrentVersion(lines, versionLineIndex)

    if (!versionLine) {
      return
    }

    const versionArray = versionLine.split('=')
    const versionString = versionArray[1]
    const newVersion = getNewVersion(operation, versionString)

    if (!newVersion) {
      return
    }

    versionArray[1] = newVersion
    const newVersionLine = versionArray.join('=')
    lines[versionLineIndex] = newVersionLine

    const writeStream = fs.createWriteStream(fileName)
    writeStream.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Error while writting new version to .env')
    })

    lines.forEach((line) => {
      writeStream.write(line + '\n')
    })

    writeStream.end()
  })
}

const getVersionLineIndex = (lines) => {
  if (lines.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('No version found to update')
    return -1
  }

  return lines.findIndex((line) => {
    return line.startsWith('REACT_APP_VERSION=')
  })
}

const getCurrentVersion = (lines, versionIndex) => {
  if (versionIndex < 0) {
    // eslint-disable-next-line no-console
    console.warn('No version found to update')
    return null
  }

  const versionLine = lines[versionIndex]
  const versionLineArray = versionLine.split('=')

  if (versionLineArray.length !== 2) {
    // eslint-disable-next-line no-console
    console.error(
      'The provided version format is incorrect. It should be on the form: ' +
        '<major>.<minor>.<patch>.<build>'
    )
    return null
  }

  return versionLine
}

const getNewVersion = (operation, versionString) => {
  const versionArray = versionString.split('.')

  if (versionArray.length !== 4) {
    // eslint-disable-next-line no-console
    console.error(
      'The provided version format is incorrect. It should be on the form: ' +
        '<major>.<minor>.<patch>.<build>'
    )
    return null
  }

  switch (operation) {
    case 'patch': {
      versionArray[2] = (parseInt(versionArray[2]) + 1).toString()
      versionArray[3] = 0
      break
    }
    case 'minor': {
      versionArray[1] = (parseInt(versionArray[1]) + 1).toString()
      versionArray[2] = 0
      versionArray[3] = 0
      break
    }
    case 'major': {
      versionArray[0] = (parseInt(versionArray[0]) + 1).toString()
      versionArray[1] = 0
      versionArray[2] = 0
      versionArray[3] = 0
      break
    }
    default: {
      // eslint-disable-next-line no-console
      console.error('Unknown command.')
      return null
    }
  }

  return versionArray.join('.')
}

updateVersion()
