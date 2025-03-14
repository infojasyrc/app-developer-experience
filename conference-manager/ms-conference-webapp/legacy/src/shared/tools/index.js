/* eslint-disable no-mixed-operators */
import Moment from 'moment'

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0
    let v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export const validateEmail = (emailText) => {
  const emailPattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return emailPattern.test(emailText)
}

export const isValidMaxImageSize = (fileSize) => {
  return fileSize <= 2200000
}

export const isValidImageType = (imageType) => {
  return (
    imageType === 'image/jpeg' ||
    imageType === 'image/png' ||
    imageType === 'image/jpg'
  )
}

export const getCurrentYear = () => {
  return Moment().format('YYYY')
}

export const convertYears = (number = 0) => {
  const currentYear = parseInt(getCurrentYear())
  const result = (currentYear + number).toString()
  return result
}

export const convertArr18n = (t, str) => {
  return t(str, { returnObjects: true })
}
