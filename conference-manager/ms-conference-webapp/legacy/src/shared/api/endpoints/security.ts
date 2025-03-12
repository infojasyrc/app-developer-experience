import { requests } from '../baseRequest'

enum APIEndpoints {
  revoke = 'revoke-token',
  base = 'authenticate',
}

function Security() {
  const revokeToken = async () =>
    await requests.post(`${APIEndpoints.base}/${APIEndpoints.revoke}`, {})

  return { revokeToken }
}

export default Security
