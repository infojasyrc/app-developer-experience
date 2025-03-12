import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import { Grid, TextField } from '@material-ui/core'

import { Box } from '@mui/material'

import EventTypes from '../EventTypes/EventTypes'
import SelectWithLoading from '../DropDown/SelectWithLoading'
import TextFieldWithValidation from '../TextField/TextFieldWithValidation'
import FormButtons from '../FormButtons/FormButtons'

import {
  Conference,
  ConferenceDataValidation,
  Headquarter,
} from '../../shared/entities'

import { Tag } from '../../shared/entities/tag'
import { eventStyle } from '../../shared/styles/eventsAdmin'

export interface EventViewProps {
  headquarters: Headquarter[]
  tags: Tag[]
  eventData: Conference
  validation: ConferenceDataValidation
  isLoading: boolean
  onSubmit: (data: Conference) => void
  onCancel: () => void
}

export default function EventView({
  headquarters,
  tags,
  eventData,
  validation,
  isLoading,
  onSubmit,
  onCancel,
}: EventViewProps): JSX.Element {
  const getValues = (
    setValue: Dispatch<SetStateAction<string>>,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    return setValue(event.target.value)
  }

  const classes = eventStyle()

  const [getName, setEventName] = useState<string>(eventData.name)
  const [getType, setSelectedEventType] = useState<string>(eventData.eventType)
  const [getDescription, setEventDescription] = useState<string>(
    eventData.description
  )
  const [getDate, setEventDate] = useState<string>(eventData.eventDate)
  const [getAddress, setAddress] = useState<string>(eventData.address || '')
  const [getphone, setPhoneNumber] = useState<string>(
    eventData.phoneNumber || ''
  )
  const [getTag] = useState<string[]>(eventData.tags || [])
  const [getHeadquarter] = useState<Headquarter>(
    eventData.headquarter || ({} as Headquarter)
  )

  const updateEventType = (selectedEventType: string) => {
    setSelectedEventType(selectedEventType)
  }

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) =>
    getValues(setEventName, event)
  const onChangeDescription = (event: ChangeEvent<HTMLInputElement>) =>
    getValues(setEventDescription, event)
  const onChangeDate = (event: ChangeEvent<HTMLInputElement>) =>
    getValues(setEventDate, event)
  const onChangeAdress = (event: ChangeEvent<HTMLInputElement>) =>
    getValues(setAddress, event)
  const onChangePhoneNumber = (event: ChangeEvent<HTMLInputElement>) =>
    getValues(setPhoneNumber, event)

  return (
    <Box component="form" autoComplete="off">
      <Grid container className={classes.container} xs={12} sm={6} item>
        <h1>Add event</h1>

        <Grid>
          <TextFieldWithValidation
            id="eventName"
            className={classes.textField}
            required={true}
            label="Title"
            value={getName}
            error={validation.name.error}
            helperText={validation.name.message}
            onChange={onChangeName}
          />
        </Grid>

        <Grid>
          <TextFieldWithValidation
            id="eventDescription"
            className={classes.textField}
            required={true}
            label="Description"
            value={getDescription}
            error={validation.name.error}
            helperText={validation.name.message}
            onChange={onChangeDescription}
          />
        </Grid>

        <Grid>
          <TextFieldWithValidation
            id="eventDate"
            className={classes.textField}
            required={true}
            label="Date"
            value={getDate}
            error={validation.eventDate.error}
            helperText={validation.eventDate.message}
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={onChangeDate}
          />
        </Grid>

        <Grid>
          <SelectWithLoading
            attributeValue={getHeadquarter._id}
            attributeRequired={true}
            attributeOptions={headquarters}
            attributeName="headquarter"
            attributeLabel="HQ"
            error={false}
            errorMessage=""
            onChange={() => {}}
            isLoading={isLoading}
          />
        </Grid>

        <Grid>
          <TextField
            id="eventAddress"
            name="address"
            className={classes.textField}
            label="Address"
            value={getAddress}
            margin="dense"
            onChange={onChangeAdress}
          />
        </Grid>

        <Grid>
          <TextField
            name="phoneNumber"
            className={classes.textField}
            label="Phone"
            value={getphone}
            margin="dense"
            onChange={onChangePhoneNumber}
          />
        </Grid>

        <Grid>
          {/* TODO: Evaluate this component for event tags */}
          <SelectWithLoading
            attributeValue={getTag.join(' ')}
            attributeRequired={true}
            attributeOptions={tags}
            attributeName="tag"
            attributeLabel="Tag"
            error={false}
            errorMessage=""
            onChange={() => {}}
            isLoading={isLoading}
          />
        </Grid>

        <Grid>
          <EventTypes
            selectedEventType={getType}
            onUpdateEventType={updateEventType}
          />
        </Grid>

        <Grid className={classes.contentButton}>
          <FormButtons
            disableMainButton={false}
            onCancel={onCancel}
            onSubmit={() => onSubmit(eventData)}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
