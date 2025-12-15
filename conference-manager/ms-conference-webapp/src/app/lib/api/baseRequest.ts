import axios from 'axios'
import { config } from '../../shared/environment'

const getUrl = (endpoint: string) => {
  return `${config.baseApiPath}${endpoint}`
}

function getToken() {
  if (typeof window !== 'undefined') {
    const storage = window.localStorage
    const storageData = storage.getItem('token')
    if (storageData) {
      try {
        const token = JSON.parse(storage.getItem('token') || '')
        return token
      } catch (error) {
        console.error('Error parsing token:', error)
        return null
      }
    }
  }
  return null
}


const baseRequest = () => {
  const token = getToken()
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
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
