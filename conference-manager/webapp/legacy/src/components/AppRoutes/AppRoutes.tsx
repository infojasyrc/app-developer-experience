import { Route, Switch } from 'react-router-dom'

import EventsPage from '../../pages/Events/Events'
import EventPage from '../../pages/Event/Event'
import PlayEventPage from '../../pages/PlayEvent/PlayEvent'
import UsersPage from '../../pages/Users/Users'
import UserPage from '../../pages/User/User'
import Login from '../../pages/Login/Login'
import EventInfoPage from '../../pages/EventInfo/EventInfo'
import EventsAdminPage from '../../pages/EventsAdmin/EventsAdmin'
import EventEditPage from '../../pages/EventEdit/EventEdit'
import ProtectedRoutes from './ProtectedRoute/ProtectedRoutes'

import { useAuth } from '../../shared/hooks/useAuth'

export default function AppRoutes(): JSX.Element {
  const { user } = useAuth()
  // TODO: Implement here 2 components: user and admin routes
  return (
    <Switch>
      <Route path="/event-info/:id">
        <EventInfoPage />
      </Route>
      <Route path="/events/list">
        <ProtectedRoutes user={user?.isAdmin || false} component={EventsAdminPage} />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/play-event/:id">
        <PlayEventPage />
      </Route>
      <Route path="/users">
        <UsersPage />
      </Route>
      <Route path="/event/add">
        <ProtectedRoutes user={user?.isAdmin || false} component={EventPage} />
      </Route>
      <Route path="/event/edit/:id">
        <ProtectedRoutes user={user?.isAdmin || false} component={EventEditPage} />
      </Route>
      <Route path="/user/add">
        <UserPage />
      </Route>
      <Route path="/">
        <EventsPage />
      </Route>
    </Switch>
  )
}
