"use client";
import { useState, useContext, useEffect, useCallback } from 'react'
import type { ReactElement } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Login from '../components/Login/Login'
import { Authentication } from '../shared/api'
import { AuthContext } from '../lib/contexts/Auth/AuthContext'
import { useAuth } from '../lib/hooks/useAuth'

export default function LoginPage(): ReactElement {
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
      // TODO: replace with real auth provider; for now, set server cookie
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { displayName: userName },
          credentials: { email: userName, password },
          token: 'placeholder-token',
        }),
      })

      setLoading(false)

      setLoginData({ isAuth: true, user: { id: userName, email: userName, firstName: '', lastName: '', isAdmin: undefined } })

      handleRedirect({ ...state, email: userName, isAdmin: state?.user?.isAdmin })
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
    const email = userState?.email || userState?.user?.email
    const isAdmin = userState?.isAdmin || userState?.user?.isAdmin
    let shouldRedirectTo = '/'

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
