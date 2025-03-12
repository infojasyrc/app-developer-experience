import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface NavigationWrapperProps {
  path: string
  children: ReactNode
}

export default function NavigationWrapper({
  path,
  children,
}: NavigationWrapperProps): JSX.Element {
  return <Link to={path}>{children}</Link>
}
