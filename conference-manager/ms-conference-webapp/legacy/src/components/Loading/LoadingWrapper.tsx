import { ReactNode } from 'react'
import { CircularProgress } from '@material-ui/core'

import { UIPosition } from '../../shared/entities'

export interface LoadingWrapperProps {
  isLoading: boolean
  middlePosition: UIPosition
  children: ReactNode
}

export default function LoadingWrapper({
  isLoading,
  children,
  middlePosition,
}: LoadingWrapperProps): JSX.Element {

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {isLoading && (
        <CircularProgress
          size={20}
          style={{
            position: 'absolute',
            top: middlePosition.top,
            left: middlePosition.left,
          }}
          data-testid="loader-wrapper"
        />
      )}
      {children}
    </div>
  )
}
