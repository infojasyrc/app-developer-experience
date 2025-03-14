import { Button } from '@material-ui/core'

import { ConferenceStatus } from '../../shared/entities'

export interface PreviewActionsProps {
  status: ConferenceStatus
  conferenceId: string
  onOpen: (conferenceId: string) => void
  onPause: (conferenceId: string) => void
  onClose: (conferenceId: string) => void
  onEnter: (conferenceId: string) => void
  onSynchronize: (conferenceId: string) => void
}

interface CommonButtonsProps {
  conferenceId: string
  onSynchronize: (conferenceId: string) => void
}

const CommonButtons = ({
  conferenceId,
  onSynchronize,
}: CommonButtonsProps): JSX.Element => (
  <Button
    data-testid="upload-attendees-conference-button"
    onClick={() => onSynchronize(conferenceId)}
  >
    Upload attendees
  </Button>
)

export default function PreviewActions({
  status,
  conferenceId,
  onOpen,
  onPause,
  onClose,
  onEnter,
  onSynchronize,
}: PreviewActionsProps): JSX.Element {

  if (status === 'created') {
    return (
      <>
        <Button
          data-testid="open-conference-button"
          onClick={() => onOpen(conferenceId)}
        >
          Open
        </Button>
        <CommonButtons
          conferenceId={conferenceId}
          onSynchronize={onSynchronize}
        />
      </>
    )
  }

  if (status === 'opened') {
    return (
      <>
        <Button
          data-testid="pause-conference-button"
          onClick={() => onPause(conferenceId)}
        >
          Pause
        </Button>
        <Button
          data-testid="close-conference-button"
          onClick={() => onClose(conferenceId)}
        >
          Close
        </Button>
        <Button
          data-testid="enter-conference-button"
          onClick={() => onEnter(conferenceId)}
        >
          Go!
        </Button>
        <CommonButtons
          conferenceId={conferenceId}
          onSynchronize={onSynchronize}
        />
      </>
    )
  }

  if (status === 'paused') {
    return (
      <>
        <Button
          data-testid="unpause-conference-button"
          onClick={() => onOpen(conferenceId)}
        >
          Unpause
        </Button>
        <CommonButtons
          conferenceId={conferenceId}
          onSynchronize={onSynchronize}
        />
      </>
    )
  }

  return <></>
}
