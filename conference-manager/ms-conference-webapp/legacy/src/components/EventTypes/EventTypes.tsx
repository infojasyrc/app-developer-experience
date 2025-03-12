import { ChangeEvent, useEffect, useState } from 'react'
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  makeStyles,
  createStyles,
} from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    eventTypeContainerControl: {
      margin: '10px 0px',
      width: '100%',
      textAlign: 'initial',
    },
    eventTypeContainer: {
      transformOrigin: 'top left',
      transform: 'translate(0, 1.5px) scale(0.75)',
    },
    radioGroupEventTypes: {
      height: '2em',
      flexDirection: 'initial',
    },
    radioOptionLabel: {
      height: '1.5em',
      marginTop: '0.2em',
    },
  })
)

export interface EventTypesProps {
  selectedEventType: string
  onUpdateEventType: (eventType: string) => void
}

export default function EventTypes({
  selectedEventType,
  onUpdateEventType,
}: EventTypesProps): JSX.Element {
  const [value, setValue] = useState(selectedEventType || '')
  const classes = useStyles()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    onUpdateEventType(event.target.value)
  }

  useEffect(() => {
    setValue(selectedEventType)
  }, [selectedEventType])

  return (
    <FormControl className={classes.eventTypeContainerControl}>
      <FormLabel className={classes.eventTypeContainer}>Event Type</FormLabel>
      <RadioGroup
        aria-label="Event Type"
        name="radioEventType"
        className={classes.radioGroupEventTypes}
        value={value}
        onChange={handleChange}
      >
        <FormControlLabel
          value="Recruiting"
          control={<Radio />}
          label="Recruiting"
          className={classes.radioOptionLabel}
        />
        <FormControlLabel
          value="Sales"
          control={<Radio />}
          label="Sales"
          className={classes.radioOptionLabel}
        />
      </RadioGroup>
    </FormControl>
  )
}
