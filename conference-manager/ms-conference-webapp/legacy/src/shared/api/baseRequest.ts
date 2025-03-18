import axios from 'axios'
import getEnvVariables from '../environment/environment'

const getUrl = (endpoint: string) => {
  const { baseApiPath } = getEnvVariables()
  return `${baseApiPath}${endpoint}`
}

const baseRequest = () => {
  const storage = window.localStorage
  const storageData = storage.getItem('token')

  if (storageData) {
    try {
      const token = JSON.parse(storage.getItem('token') || '')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing token:', error)
    }
  }

  const get = (endpoint: string, params: any = null) => {
    return axios.get(getUrl(endpoint), { params: params })
  }

  const getFile = (endpoint: string, params: any) => {
    if (!params) {
      return axios.get(getUrl(endpoint), { responseType: 'blob' })
    }

    return axios.get(getUrl(endpoint), {
      ...params,
      responseType: 'blob',
    })
  }

  const post = (endpoint: string, data: any, config?: any) => {
    if (!config) {
      return axios.post(getUrl(endpoint), data)
    }

    return axios.post(getUrl(endpoint), data, config)
  }

  const put = (endpoint: string, data: any = null) => {
    return axios.put(getUrl(endpoint), data)
  }

  const deleteEvent = (endpoint: string, params: any) => {
    return axios.delete(getUrl(endpoint), { params: params })
  }

  const deleteEndpoint = (endpoint: string) => {
    return axios.delete(getUrl(endpoint))
  }

  return { get, getFile, post, put, deleteEvent, deleteEndpoint }
}

export const requests = baseRequest()
