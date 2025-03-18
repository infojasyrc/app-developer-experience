import { useState } from 'react'
import { Grid } from '@material-ui/core'
import {
  Box,
  Button,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Edit, DeleteOutline } from '@material-ui/icons'
import Moment from 'moment'
import { useHistory } from 'react-router-dom'

import FullLayout from '../../hocs/FullLayout'
import Headquarters from '../Headquarters/Headquarters'
import DashboardFilters from '../Dashboard/DashboardFilters'
import {
  Conference,
  ConferenceFilters,
  ConferenceStatus,
  Headquarter
} from '../../shared/entities'
import { sortAscending, sortDescending } from '../../shared/tools/sorting'
// TODO: This sould be move to the page
import EventsApi from '../../shared/api/endpoints/events'

import { buttonIcon } from '../../shared/themes/buttons'
import { StatusEnum } from '../../shared/constants/constants'
import { modalStyle, title } from '../../shared/themes/modal'
import { eventStyle } from '../../shared/styles/eventsAdmin'

export interface EventsAdminViewProps {
  events: Conference[]
  allHeadquarters: Headquarter[]
  loadingEvents: boolean
  loadingHeadquarters: boolean
  selectedHeadquarter?: string
  updateEvents: (id: string | undefined) => void
  updateStatusEvents: (id: string | undefined, status: ConferenceStatus) => void
}

export default function EventAdminView({
  events,
  allHeadquarters,
  loadingEvents,
  loadingHeadquarters,
  selectedHeadquarter,
  updateEvents,
  updateStatusEvents,
}: EventsAdminViewProps): JSX.Element {
  const api = EventsApi()
  const [filteredEvents, setFilteredEvents] = useState<Conference[]>(events)
  const classes = eventStyle()
  const [open, setOpen] = useState<boolean>(false)
  let [idEvent, setId] = useState<string>('')
  let [modalTitle, setTitle] = useState<string>('')
  let [buttonSave, setButton] = useState<boolean>(true)

  const handleOpen = (id: string) => {
    setOpen(true)
    setId(id)
    setTitle('Are you sure?')
  }

  const handleClose = () => {
    setOpen(false)
    setButton(true)
    handleChangeFilters({ year: '', sortBy: '' })
  }

  //TODO: Create generic utility(used in components multiple)
  const getDatePart = (date: string) => Moment(date).format('D MMM YYYY')

  //TODO: Create generic utility(used in components multiple)
  const handleChangeFilters = (filters: ConferenceFilters) => {
    if (filters.sortBy) {
      const sortedAllEvents =
        filters.sortBy === 'newest'
          ? Array.from(events).sort(sortDescending)
          : Array.from(events).sort(sortAscending)

      setFilteredEvents(sortedAllEvents)
    } else {
      setFilteredEvents(events)
    }
  }

  //TODO: Create generic utility(used in components multiple)
  const handleHeadquarterChanged = (selectedHeadquarter: string) => {
    let filteredByHeadquarter: Conference[] = events

    if (selectedHeadquarter !== '-1') {
      filteredByHeadquarter = filteredByHeadquarter.filter(
        ({ headquarter, _id }: Conference) =>
          headquarter && _id === selectedHeadquarter
      )
    }

    setFilteredEvents(filteredByHeadquarter)
  }

  const history = useHistory()

  const handleLinkEditEvent = (id: string | undefined) =>
    history.push(`/event/edit/${id}`)

  const removeEvent = async () => {
    try {
      const data = await api.deleteEvent(idEvent)

      if (data.status === 200) {
        setTitle('Successfully deleted!')
        updateEvents(idEvent)
      } else {
        setTitle('Failed delete')
      }
    } catch (error) {
      setTitle('Failed delete')
      // eslint-disable-next-line no-console
      console.error(error)
    }

    setButton(false)
  }

  const updateStatus = async (event: Conference) => {
    let status: ConferenceStatus = StatusEnum.inactive
    if (event.status !== StatusEnum.active) status = StatusEnum.active
    const data = await api.update(event._id, { status })
    if (data.status === 200) updateStatusEvents(event._id, status)
  }

  const validateStatus = (status: ConferenceStatus) =>
    status !== StatusEnum.active

  if (loadingEvents) {
    return <>Loading...</>
  }

  return (
    <>
      {!loadingEvents && (
        <FullLayout title="Events">
          <h1>Events</h1>

          <Grid
            container
            justifyContent="center"
            className={classes.headquarterFilter}
          >
            {!loadingEvents ? (
              <Headquarters
                onChangeHeadquarter={handleHeadquarterChanged}
                allHeadquarters={allHeadquarters}
                selectedHeadquarter={selectedHeadquarter}
                loading={loadingHeadquarters}
              />
            ) : null}

            <DashboardFilters onChangeFilters={handleChangeFilters} />
          </Grid>

          <Grid container justifyContent="center">
            <TableContainer component={Paper} className={classes.table}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center"># subscriptions</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Publish</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredEvents.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="center">
                        {getDatePart(row.eventDate)}
                      </TableCell>
                      <TableCell align="center">15</TableCell>
                      <TableCell align="center">{row.status}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent={'center'}>
                          <Button
                            variant={
                              validateStatus(row.status)
                                ? 'contained'
                                : 'outlined'
                            }
                            color="success"
                            onClick={() => updateStatus(row)}
                          >
                            {validateStatus(row.status) ? 'enable' : 'disable'}
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          spacing={2}
                          direction="row"
                          justifyContent={'center'}
                        >
                          <Button
                            sx={buttonIcon}
                            onClick={() => handleLinkEditEvent(row._id)}
                          >
                            <Edit />
                          </Button>

                          <Button
                            sx={buttonIcon}
                            onClick={() => handleOpen(row._id)}
                          >
                            <DeleteOutline />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                sx={title}
              >
                {modalTitle}
              </Typography>

              <Button variant="outlined" color="info" onClick={handleClose}>
                Close
              </Button>

              {buttonSave ? (
                <Button variant="contained" color="error" onClick={removeEvent}>
                  Delete
                </Button>
              ) : (
                ''
              )}
            </Box>
          </Modal>
        </FullLayout>
      )}
    </>
  )
}
