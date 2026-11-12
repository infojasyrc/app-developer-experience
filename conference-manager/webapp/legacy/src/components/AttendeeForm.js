import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import {
  withStyles,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Button,
  FormGroup,
  Dialog,
  DialogContent,
} from '@material-ui/core'

import AttendeeFormHeaderStep from './AttendeeFormHeaderStep/AttendeeFormHeaderStep'
import NavigationLayout from '../hocs/NavigationLayout'
import TextFieldWithValidation from './TextField/TextFieldWithValidation'
import { withMessage } from '../hocs/Snackbar'

import EventsApi from '../shared/api/endpoints/events'
import database from '../database/database'
import DataService from '../database/dataService'
import { uuidv4, validateEmail } from '../shared/tools'
import { styles } from '../styles/AttendeeForm'

const strings = {
  title: 'Formulario',
  firstName: 'Nombre',
  lastName: 'Apellido',
  email: 'Correo electrónico',
  phoneNumber: 'Teléfono',
  company: 'Empresa',
  position: 'Cargo',
  university: 'Universidad',
  technologies: 'Tecnologías',
  others: 'Otros',
  experience: 'Experiencia',
  student: 'Soy estudiante',
  threeToFive: 'Entre 3 y 5 años',
  noExperience: 'Sin experiencia o menos de 1 año',
  moreThanFive: 'Más de 5 años',
  oneToThree: 'Entre 1 y 3 años',
  scrumLeader: 'Scrum Master/Líder',
  data: 'Datos',
  technologiesAndExperience: 'Tecnologías y Experiencia',
  finished: 'Guardado',
  save: 'Guardar',
  thankYou: '¡Gracias por registrarte!',
  savedData: 'Sus datos se han guardado',
  youMustEnterData: 'Debe ingresar este dato',
  next: 'Siguiente',
  back: 'Atrás',
  accept: 'Aceptar',
  cancel: 'Cancel',
}

class AttendeeForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      event: {},
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      company: '',
      position: '',
      university: '',
      java: false,
      ui: false,
      qa: false,
      php: false,
      mobile: false,
      fullStack: false,
      dotNet: false,
      others: false,
      student: false,
      threeToFive: false,
      noExperience: false,
      moreThanFive: false,
      oneToThree: false,
      scrumLeader: false,
      activeStep: 1,
      isLoading: false,
      enableSave: false,
      showThanks: false,
      validation: {
        firstName: {
          error: false,
          message: strings.youMustEnterData,
        },
        lastName: {
          error: false,
          message: strings.youMustEnterData,
        },
        email: {
          error: false,
          message: strings.youMustEnterData,
        },
        phoneNumber: {
          error: false,
          message: strings.youMustEnterData,
        },
      },
    }

    this.api = new EventsApi()
    this.db = new DataService(database, 'attendees')
  }

  componentDidMount = () => {
    const { match, showLoading, hideMessage } = this.props
    const id = match.params.id

    showLoading()

    this.api
      .getById(id)
      .then((event) => {
        this.setState(
          {
            event: event,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        hideMessage()
      })
  }

  isRecruitingEvent = () => {
    const { event } = this.state
    return event.eventType === 'recruiting'
  }

  handleTextChanged = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleCheckBoxChanged = (e) => {
    this.setState({
      [e.target.name]: e.target.checked,
    })
  }

  handleNextClicked = () => {
    this.setState({ activeStep: 2 })
  }

  handleBackClicked = () => {
    this.setState({ activeStep: 1 })
  }

  backToSlides = () => {
    const { history, match } = this.props
    history.push(`/play-event/${match.params.id}`)
  }

  handleCancelClicked = () => {
    this.backToSlides()
  }

  handleSaveClicked = () => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      position,
      university,
      java,
      ui,
      qa,
      php,
      mobile,
      fullStack,
      dotNet,
      others,
      student,
      threeToFive,
      noExperience,
      moreThanFive,
      oneToThree,
      scrumLeader,
    } = this.state
    const { match, showSaving, hideMessage } = this.props

    showSaving()
    this.setState({ isLoading: true })

    const idEvent = match.params.id
    const id = uuidv4()

    const attendee = {
      id,
      idEvent,
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      position,
      university,
      java,
      ui,
      qa,
      php,
      mobile,
      fullStack,
      dotNet,
      others,
      student,
      threeToFive,
      noExperience,
      moreThanFive,
      oneToThree,
      scrumLeader,
    }

    this.db
      .add(attendee)
      .then(() => {
        this.api
          .addAttendees(idEvent, [attendee])
          .then(() => {
            this.db
              .delete(id)
              .then(() => {
                this.setState(
                  {
                    isLoading: false,
                    activeStep: this.isRecruitingEvent() ? 2 : 1,
                    showThanks: true,
                  },
                  () => {
                    hideMessage()
                  }
                )
              })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(
                  'Error while deleting attendee from IndexedDb',
                  error
                )
                hideMessage()
              })
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Error while uploading attendee to server', error)
            this.setState(
              {
                isLoading: false,
                activeStep: 2,
                showThanks: true,
              },
              () => hideMessage()
            )
          })
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error while saving attendee to IndexedDb', error)
        this.setState(
          {
            isLoading: false,
          },
          () => hideMessage()
        )
      })
  }

  handleAcceptClicked = () => {
    this.backToSlides()
  }

  checkValidation = () => {
    const { validation } = this.state

    for (let key in validation) {
      if (!validation.hasOwnProperty(key)) {
        continue
      }

      if (validation[key].error) {
        return false
      }
    }

    return true
  }

  handleRequiredFieldBlurred = (e) => {
    const { validation } = this.state
    validation[e.target.name].error = !e.target.value || e.target.value === ''

    if (e.target.id === 'email' && e.target.value.length > 0) {
      validation[e.target.name].error = !validateEmail(e.target.value)
    }
    const enableSave = this.checkValidation()
    this.setState({ validation, enableSave })
  }

  renderRequiredTextField = (inputTextData) => {
    const { classes } = this.props

    if (inputTextData.type) {
      return (
        <TextFieldWithValidation
          id={inputTextData.id}
          type={inputTextData.type}
          className={classes.textField}
          variant="outlined"
          required={true}
          label={inputTextData.label}
          value={inputTextData.value}
          error={inputTextData.error}
          errorMessage={inputTextData.errorMessage}
          onChange={this.handleTextChanged}
          onBlur={this.handleRequiredFieldBlurred}
        />
      )
    }

    return (
      <TextFieldWithValidation
        id={inputTextData.id}
        className={classes.textField}
        variant="outlined"
        required={true}
        label={inputTextData.label}
        value={inputTextData.value}
        error={inputTextData.error}
        helperText={inputTextData.errorMessage}
        onChange={this.handleTextChanged}
        onBlur={this.handleRequiredFieldBlurred}
      />
    )
  }

  renderTextField = (name, label, value) => {
    const { classes } = this.props
    return (
      <TextField
        name={name}
        className={classes.textField}
        label={label}
        value={value}
        margin="dense"
        variant="outlined"
        onChange={this.handleTextChanged}
      />
    )
  }

  renderCheckBox = (name, checked, label) => {
    return (
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              name={name}
              checked={checked}
              onChange={this.handleCheckBoxChanged}
            />
          }
          label={label}
        />
      </FormGroup>
    )
  }

  renderPersonalData = () => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      position,
      university,
      validation,
    } = this.state

    return (
      <Grid container>
        <Grid container direction="row" spacing={32}>
          <Grid item xs={12} sm={6}>
            {this.renderRequiredTextField({
              id: 'firstName',
              label: strings.firstName,
              value: firstName,
              error: validation.firstName.error,
              errorMessage: validation.firstName.message,
            })}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderRequiredTextField({
              id: 'lastName',
              label: strings.lastName,
              value: lastName,
              error: validation.lastName.error,
              errorMessage: validation.lastName.message,
            })}
          </Grid>
        </Grid>
        <Grid container direction="row" spacing={32}>
          <Grid item xs={12} sm={6}>
            {this.renderRequiredTextField({
              id: 'email',
              type: 'email',
              label: strings.email,
              value: email,
              error: validation.email.error,
              errorMessage: validation.email.message,
            })}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderRequiredTextField({
              id: 'phoneNumber',
              label: strings.phoneNumber,
              value: phoneNumber,
              error: validation.phoneNumber.error,
              errorMessage: validation.phoneNumber.message,
            })}
          </Grid>
        </Grid>
        <Grid container direction="row" spacing={32}>
          <Grid item xs={12} sm={6}>
            {this.renderTextField('company', strings.company, company)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderTextField('position', strings.position, position)}
          </Grid>
        </Grid>
        {this.isRecruitingEvent() ? (
          <Grid container direction="row">
            <Grid item xs={12}>
              {this.renderTextField(
                'university',
                strings.university,
                university
              )}
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    )
  }

  renderTechnologies = () => {
    const { java, ui, qa, php, mobile, fullStack, dotNet, others } = this.state

    return (
      <Grid container>
        <Grid container direction="row">
          <Grid item xs={12}>
            <h5>{strings.technologies}</h5>
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('java', java, 'Java')}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('dotNet', dotNet, '.Net')}
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('php', php, 'PHP')}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('fullStack', fullStack, 'Full Stack')}
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('mobile', mobile, 'Mobile')}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('ui', ui, 'UI')}
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('qa', qa, 'QA')}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('others', others, strings.others)}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderExperience = () => {
    const {
      student,
      threeToFive,
      noExperience,
      moreThanFive,
      oneToThree,
      scrumLeader,
    } = this.state

    return (
      <Grid container>
        <Grid container direction="row">
          <Grid item xs={12}>
            <h5>{strings.experience}</h5>
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('student', student, strings.student)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox(
              'noExperience',
              noExperience,
              strings.noExperience
            )}
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox('oneToThree', oneToThree, strings.oneToThree)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox(
              'threeToFive',
              threeToFive,
              strings.threeToFive
            )}
          </Grid>
        </Grid>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox(
              'moreThanFive',
              moreThanFive,
              strings.moreThanFive
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderCheckBox(
              'scrumLeader',
              scrumLeader,
              strings.scrumLeader
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderThankYou = () => {
    const { classes } = this.props
    return (
      <React.Fragment>
        <h2 className={classes.thanksTitle}>{strings.thankYou}</h2>
        <h3 className={classes.thanksSubTitle}>{strings.savedData}</h3>
        <Button
          className={classes.thanksButton}
          variant="contained"
          color="primary"
          onClick={this.handleAcceptClicked}
        >
          {strings.accept}
        </Button>
      </React.Fragment>
    )
  }

  renderNextButton = () => {
    const { enableSave } = this.state
    const { classes } = this.props
    return (
      <Button
        className={classes.primaryButton}
        disabled={!enableSave}
        variant="contained"
        color="primary"
        onClick={this.handleNextClicked}
      >
        {strings.next}
      </Button>
    )
  }

  renderBackSaveButton = () => {
    const { enableSave } = this.state
    const { classes } = this.props
    return (
      <React.Fragment>
        <Button
          className={classes.primaryButton}
          disabled={!enableSave}
          variant="contained"
          color="primary"
          onClick={this.handleSaveClicked}
        >
          {strings.save}
        </Button>
        <Button
          className={classes.secondaryButton}
          variant="outlined"
          color="primary"
          onClick={this.handleBackClicked}
        >
          {strings.back}
        </Button>
      </React.Fragment>
    )
  }

  renderCancelSaveButton = () => {
    const { enableSave } = this.state
    const { classes } = this.props
    return (
      <React.Fragment>
        <Button
          className={classes.primaryButton}
          disabled={!enableSave}
          variant="contained"
          color="primary"
          onClick={this.handleSaveClicked}
        >
          {strings.save}
        </Button>
        <Button
          className={classes.secondaryButton}
          variant="outlined"
          color="primary"
          onClick={this.handleCancelClicked}
        >
          {strings.cancel}
        </Button>
      </React.Fragment>
    )
  }

  renderActiveStep = (step) => {
    const { classes } = this.props
    const { event } = this.state

    if (step === 1) {
      return (
        <Grid container>
          <Grid container className={classes.stepContainer} direction="row">
            <AttendeeFormHeaderStep
              eventType={event.eventType}
              activeStep={1}
            />
          </Grid>
          <Grid container direction="row">
            {this.renderPersonalData()}
          </Grid>
          <Grid container className={classes.buttonsContainer} direction="row">
            {this.isRecruitingEvent()
              ? this.renderNextButton()
              : this.renderCancelSaveButton()}
          </Grid>
        </Grid>
      )
    }

    return (
      <Grid container>
        <Grid container className={classes.stepContainer} direction="row">
          <AttendeeFormHeaderStep eventType={event.eventType} activeStep={2} />
        </Grid>
        <Grid container direction="row">
          {this.renderTechnologies()}
        </Grid>
        <Grid container direction="row">
          {this.renderExperience()}
        </Grid>
        <Grid container className={classes.buttonsContainer} direction="row">
          {this.renderBackSaveButton()}
        </Grid>
      </Grid>
    )
  }

  render() {
    const { activeStep, showThanks } = this.state
    const { classes } = this.props

    return (
      <NavigationLayout title={strings.title} showLogo={true}>
        <Paper className={classes.container}>
          {this.renderActiveStep(activeStep)}
        </Paper>
        <Dialog
          open={showThanks}
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
          fullWidth={true}
        >
          <DialogContent>{this.renderThankYou()}</DialogContent>
        </Dialog>
      </NavigationLayout>
    )
  }
}

export default withMessage(withRouter(withStyles(styles)(AttendeeForm)))
