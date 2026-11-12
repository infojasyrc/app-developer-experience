import { useContext, ReactNode } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Paper } from '@material-ui/core'

import Header from '../Header/Header'
import NavigationBar from '../Navigation/NavigationBar'
import LayoutContext, { LayoutTypes } from '../../shared/contexts/LayoutContext'
import { AuthContext } from '../../shared/contexts/Auth/AuthContext'
import { useAuth } from '../../shared/hooks/useAuth'
import { Authentication } from '../../shared/api/'

import { mainStyles } from '../../shared/styles/main'

export interface MainProps {
  children: ReactNode
}

export default function Main({ children }: MainProps): JSX.Element {
  const { layout, title, showLogo } = useContext(LayoutContext)
  const { setLoginData } = useContext(AuthContext)
  const { isAuth, user } = useAuth()

  const classes = mainStyles()

  const location = useLocation()
  const history = useHistory()

  const shouldShowAppBars = location.pathname !== '/login'

  const handleLogout = () => {
    Authentication()
      .logout()
      .then(() => {
        setLoginData({ isAuth: false, user: undefined })
      })
    history.push('/')
    window.location.reload()
    localStorage.removeItem('token')
  }

  const handleGoToLogin = () => {
    history.push('/login')
  }

  const renderAppBar = (shouldShowAppBars: boolean): JSX.Element => {
    // TODO: This should be refactored to a separate component or be part of a layout component
    if (!shouldShowAppBars) {
      return <></>
    }
    return (
      <Header
        onLogin={handleGoToLogin}
        onLogout={handleLogout}
        isAuthenticated={isAuth}
        username={isAuth && user?.email ? user.email : ''}
      />
    )
  }

  return (
    <>
      {renderAppBar(shouldShowAppBars)}
      {layout === LayoutTypes.NAVIGATION && (
        <NavigationBar title={title} showLogo={showLogo} />
      )}

      <Paper className={classes.mainContainer}>
        <div className={classes.innerContainer}>{children}</div>
      </Paper>
    </>
  )
}
