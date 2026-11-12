import { createStyles, makeStyles, Button } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    section: {},
    disabled: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.grey[300],
    },
  })
)

export type FormButtonsProps = {
  roleCancel?: string
  roleSave?: string
  disableMainButton: boolean
  onSubmit: () => void
  onCancel: () => void
}

export default function FormButtons({
  roleCancel,
  roleSave,
  onSubmit,
  onCancel,
}: FormButtonsProps): JSX.Element {
  const classes = useStyles()

  const handleSave = () => {
    onSubmit()
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <>
      <Button role={roleCancel} variant="outlined" color="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button
        variant="contained"
        role={roleSave}
        color="primary"
        classes={{
          disabled: classes.disabled,
        }}
        disabled={false}
        onClick={handleSave}
      >
        Save
      </Button>
    </>
  )
}
