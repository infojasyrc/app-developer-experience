import { useState, useContext, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import Login from '../../components/Login/Login'
import { Authentication } from '../../shared/api'
import EventsApi from '../../shared/api/endpoints/events'
import { AuthContext } from '../../shared/contexts/Auth/AuthContext'
import { useAuth } from '../../shared/hooks/useAuth'
import UsersAPI from '../../shared/api/endpoints/users';

export default function LoginPage(): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false);
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('eventId')
  const { setLoginData } = useContext(AuthContext)
  const history = useHistory()
  const state = useAuth()

  const api = Authentication()

  const handleLoginClicked = async (userName: string, password: string) => {
    setLoading(true)
    try {
      const result = await api.login({ email: userName, password })
      const resultToken = await result.user.getIdToken()
      const verifyUser = await UsersAPI().getVerifyUser(result.user.uid).then();

      setLoading(false)
      window.localStorage.setItem('token', JSON.stringify(resultToken))

      setLoginData({ ...verifyUser, id: verifyUser.uid, isAuth: true })

      if (eventId) {
        const eventsApi = EventsApi()
        await eventsApi.addAttendees(eventId, {
          email: userName,
          password,
        })
      }
      handleRedirect(state)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setErrorMessage(true)
    }
  }
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const user = await api.googleSignIn()

      if (user) {
        window.localStorage.setItem('token', JSON.stringify(user.token))
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Google login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedirect = useCallback((userState) => {

    const { email, isAdmin } = userState
    let shouldRedirectTo = '/login'

    if (email) {
      shouldRedirectTo = isAdmin ? '/events/list' : '/'
    } else if (eventId) {
      shouldRedirectTo = `/event-info/${eventId}`
    }
    history.push(shouldRedirectTo)
  }, [eventId, history])

  useEffect(() => {
    handleRedirect(state)
  }, [handleRedirect, state])

  return (
    <Login
      onLogin={handleLoginClicked}
      googleOnLogin={handleGoogleLogin}
      loading={loading}
      errorMessage={errorMessage}
    />
  )
}
