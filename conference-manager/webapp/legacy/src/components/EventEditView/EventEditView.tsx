import { Grid, TextField } from '@material-ui/core'
import { Box } from '@mui/material'

import { Conference, ConferenceDataValidation } from '../../shared/entities/conference'
import { Headquarter } from '../../shared/entities/headquarter'

import EventTypes from '../EventTypes/EventTypes'
import TextFieldWithValidation from '../TextField/TextFieldWithValidation'
import FormButtons from '../FormButtons/FormButtons'

//TODO: Get info from database (not provided)
import { mockTags } from '../../mocks/tags'

import { eventStyle } from '../../shared/styles/eventsAdmin'

export interface EventEditViewProps {
  eventData: Conference
  headquarters: Headquarter[]
  validation: ConferenceDataValidation
  isLoading: boolean
  onSubmit: () => void
  onBack: () => void
}

export const InputLabelProps = {
  shrink: true,
}

export default function EventEditView({
  eventData,
  headquarters,
  validation,
  isLoading,
  onSubmit,
  onBack,
}: EventEditViewProps): JSX.Element {
  const tags = mockTags

  const classes = eventStyle()

  if (isLoading) return <div>Loading...</div>

  //TODO: component table refactor(create), use in add event and edit event
  return (
    <Box component="form" autoComplete="off">
      <Grid container className={classes.container} sm={6} item>
        <h1>Edit event</h1>
        <Grid>
          <TextFieldWithValidation
            id="eventName"
            className={classes.textField}
            required={true}
            label="Title"
            value={eventData.name}
            error={validation.name.error}
            helperText={validation.name.message}
            onChange={(e) => (eventData.name = e.target.value)}
            InputLabelProps={InputLabelProps}
          />
        </Grid>
        <Grid>
          <TextFieldWithValidation
            id="eventDescription"
            className={classes.textField}
            required={true}
            label="Description"
            value={eventData.description}
            error={validation.name.error}
            helperText={validation.name.message}
            onChange={(e) => (eventData.description = e.target.value)}
            InputLabelProps={InputLabelProps}
          />
        </Grid>
        <Grid>
          <TextFieldWithValidation
            id="eventDate"
            className={classes.textField}
            required={true}
            label="Date"
            value={eventData.eventDate}
            error={validation.eventDate.error}
            helperText={validation.eventDate.message}
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => (eventData.eventDate = e.target.value)}
          />
        </Grid>
        <Grid>
          {/* TODO: This should be refactor */}
          {JSON.stringify(headquarters)}
          {eventData.headquarter && (<span>{eventData.headquarter._id}</span>)}
        </Grid>
        <Grid>
          <TextField
            id="eventAddress"
            name="address"
            className={classes.textField}
            label="Address"
            value={eventData.address}
            margin="dense"
            onChange={(e) => (eventData.address = e.target.value)}
            InputLabelProps={InputLabelProps}
          />
        </Grid>
        <Grid>
          <TextField
            name="phoneNumber"
            className={classes.textField}
            label="Phone"
            value={eventData.phoneNumber}
            margin="dense"
            onChange={(e) => (eventData.phoneNumber = e.target.value)}
            InputLabelProps={InputLabelProps}
          />
        </Grid>
        <Grid className={classes.disabled}>
          {/* TODO: This should be refactor */}
          {JSON.stringify(tags)}
          {eventData.tags}
        </Grid>

        <Grid>
          {/* TODO: This should be refactor */}
          <EventTypes
            selectedEventType={eventData.eventType}
            onUpdateEventType={() => {}}
          />
        </Grid>
        <Grid className={classes.contentButton}>
          <FormButtons
            roleSave="edit"
            roleCancel="redirect"
            disableMainButton={false}
            onCancel={onBack}
            onSubmit={onSubmit}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
