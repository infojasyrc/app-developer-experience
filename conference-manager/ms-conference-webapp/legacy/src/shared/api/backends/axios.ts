import axios from 'axios'

export default class AxiosRequest {
  
  setToken = (token: string) => {
    axios.defaults.headers.common['Authorization'] = token;
  }
}
