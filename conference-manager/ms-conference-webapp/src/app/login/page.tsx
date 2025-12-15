"use client";
import { useState, useContext, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Login from '../../components/Login/Login'
import { Authentication } from '../../lib/api/legacy' // I will create this file later
import { EventsApi } from '../../lib/api/legacy' // I will create this file later
import { AuthContext } from '../../lib/contexts/Auth/AuthContext'
import { useAuth } from '../../lib/hooks/useAuth'
import { UsersAPI } from '../../lib/api/legacy' // I will create this file later

export default function LoginPage(): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false);
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const { setLoginData } = useContext(AuthContext)
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
    router.push(shouldRedirectTo)
  }, [eventId, router])

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
