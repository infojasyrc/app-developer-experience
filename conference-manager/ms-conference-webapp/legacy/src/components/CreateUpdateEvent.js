import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withStyles, TextField, Grid } from '@material-ui/core'

import EventTypes from './EventTypes/EventTypes'
import FormButtons from './FormButtons/FormButtons'
import SelectWithLoading from './DropDown/SelectWithLoading'
import TextFieldWithValidation from './TextField/TextFieldWithValidation'
import ImagesPreview from './ImagesPreview/ImagesPreview'

import NavigationLayout from '../hocs/NavigationLayout'

import EventsApi from '../shared/api/endpoints/events'
import ImagesApi from '../shared/api/endpoints/images'
import HeadquartersApi from '../shared/api/endpoints/headquarters'
import UsersApi from '../shared/api/endpoints/users'
import { styles } from '../styles/CreateUpdateEvent'
import {
  getBase64,
  isValidMaxImageSize,
  isValidImageType,
} from '../shared/tools'
import { withMessage } from '../hocs/Snackbar'

const defaultEventType = 'recruiting'

class CreateUpdateEvent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: null,
      name: '',
      date: '',
      headquarter: '',
      placeName: '',
      address: '',
      phoneNumber: '',
      status: '',
      responsable: null,
      images: [],
      eventType: defaultEventType,
      selectedImages: [],
      deletedImages: [],
      contentSelectedImages: [],
      headquarters: null,
      users: null,
      validation: {
        name: {
          error: false,
          message: 'You should provide a Title',
        },
        headquarter: {
          error: false,
          message: 'You should provide a HQ',
        },
        responsable: {
          error: false,
          message: 'You should provide a Responsable',
        },
        date: {
          error: false,
          message: 'You should provide a Date',
        },
      },
      enableSave: false,
      isLoading: false,
    }

    this.api = new EventsApi()
    this.hqApi = new HeadquartersApi()
    this.usersApi = new UsersApi()
    this.imagesApi = new ImagesApi()
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchEvent = () => {
    const { isAdding, showLoading, showError, hideMessage } = this.props

    if (isAdding) {
      this.setState(
        {
          isLoading: false,
        },
        () => {
          hideMessage()
        }
      )

      return
    }

    hideMessage()
    showLoading()

    const { match } = this.props
    const id = match.params.id

    this.api
      .getById(id)
      .then((event) => {
        this.setState(
          {
            id: id,
            name: event.name,
            date: event.date,
            headquarter: event.headquarter.id,
            placeName: event.placeName,
            address: event.address,
            phoneNumber: event.phoneNumber,
            status: event.status,
            responsable: event.responsable.id,
            images: event.images,
            eventType: event.eventType,
            enableSave: true,
            isLoading: false,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error)

        hideMessage()
        showError(error.message ? error.message : 'Error while loading event.')

        this.setState({ isLoading: false, enableSave: false })
      })
  }

  transformUsers = (users) => {
    return users.map((user) => {
      return {
        id: user.id,
        name: `${user.lastName}, ${user.name} - ${user.role.name}`,
      }
    })
  }

  fetchData = () => {
    const { showLoading, showError, hideMessage } = this.props
    hideMessage()
    showLoading()

    this.setState({ isLoading: true })

    Promise.all([this.hqApi.getAll(), this.usersApi.getAll()])
      .then((results) => {
        this.setState(
          {
            headquarters: results[0],
            users: this.transformUsers(results[1]),
          },
          () => {
            this.fetchEvent()
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error)

        hideMessage()
        showError(error.message ? error.message : 'Error while loading data.')

        this.setState({ isLoading: false })
      })
  }

  handleTextChanged = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleHeadquarterChanged = (e) => {
    this.setState({ headquarter: e.target.value })
  }

  handleDateChanged = (e) => {
    this.setState({ date: e.target.value })
  }

  handleResponsableChanged = (e) => {
    this.setState({ responsable: e.target.value })
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
    const enableSave = this.checkValidation()
    this.setState({ validation, enableSave })
  }

  handleImageValidation = (errorMessage) => {
    const { showError } = this.props
    showError(errorMessage, 3000)
  }

  handleSelectedFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const { selectedImages, contentSelectedImages } = this.state

    const file = e.target.files[0]

    // Validate 1MB for an image file
    if (!isValidMaxImageSize(file.size)) {
      this.handleImageValidation('Image should be lower than 2.2MB')
      return
    }

    // Validate image type
    if (!isValidImageType(file.type)) {
      this.handleImageValidation('Please, upload JPEG and PNG only')
      return
    }

    getBase64(file).then((result) => {
      selectedImages.push(file)
      contentSelectedImages.push(result)
      this.setState({ selectedImages, contentSelectedImages })
    })
  }

  handleDeleteImage = (idImage, type) => {
    if (type === 'image') {
      const { showMessage, hideMessage } = this.props

      hideMessage()
      showMessage('Deleting image')
      this.setState({ isLoading: true })

      const { deletedImages } = this.state

      deletedImages.push(idImage)

      this.setState({ deletedImages })
    }

    const { contentSelectedImages, selectedImages, images, id } = this.state

    if (id && images.length > 0) {
      const filteredImages = images.filter((imagen) => {
        return imagen.id !== idImage
      })
      this.setState({ images: filteredImages })
    }

    selectedImages.splice(idImage, 1)
    contentSelectedImages.splice(idImage, 1)

    this.setState({
      selectedImages: selectedImages,
      contentSelectedImages: contentSelectedImages,
    })
  }

  handleSaveClicked = () => {
    const { isAdding, showSaving, showMessage, showError, hideMessage } =
      this.props
    showSaving()
    this.setState({ isLoading: true })

    const {
      id,
      name,
      date,
      headquarter,
      headquarters,
      placeName,
      address,
      phoneNumber,
      status,
      responsable,
      selectedImages,
      deletedImages,
      users,
      eventType,
    } = this.state

    const selectedHeadquarter = headquarters.find((hq) => {
      return hq.id === headquarter
    })

    const selectedResponsable = users.find((user) => {
      return user.id === responsable
    })

    const event = {
      id,
      name,
      date,
      headquarter: selectedHeadquarter,
      placeName,
      address,
      phoneNumber,
      status,
      responsable: selectedResponsable,
      eventType,
    }

    let operation = null

    if (isAdding) {
      operation = this.api.add(event)
    } else {
      event.deletedImages = deletedImages
      operation = this.api.update(event)
    }

    operation
      .then((response) => {
        const { id } = response.data.data

        if (selectedImages && selectedImages.length > 0) {
          hideMessage()
          showMessage('Uploading Images')

          for (let index = 0; index < selectedImages.length; index++) {
            const image = selectedImages[index]

            this.imagesApi
              .add({ id, images: [image] })
              .then((result) => {
                this.api
                  .updateImages(id, result.data.data)
                  .then(() => {
                    if (index === selectedImages.length - 1) {
                      this.setState(
                        {
                          selectedImages: [],
                          isLoading: false,
                        },
                        () => {
                          hideMessage()
                          if (index === selectedImages.length - 1) {
                            this.props.history.push('/')
                          }
                        }
                      )
                    }
                  })
                  .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(
                      "Error while updating event's images data",
                      error
                    )
                    hideMessage()
                    showError(
                      error.message
                        ? error.message
                        : "Error while updating event's images data"
                    )
                    this.setState({ isLoading: false })
                  })
              })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('Error while uploading images', error)

                hideMessage()
                showError(
                  error.message
                    ? error.message
                    : "Error while updating event's images data"
                )

                this.setState({ isLoading: false })
              })
          }

          return
        }

        this.setState(
          {
            isLoading: false,
          },
          () => {
            hideMessage()
            this.props.history.push('/')
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error while saving event', error)
        hideMessage()
        showError(
          error.message
            ? error.message
            : "Error while updating event's images data"
        )
      })
  }

  handleCancelButton = () => {
    this.props.history.push('/')
  }

  updateEventType = (eventType) => {
    this.setState({ eventType: eventType })
  }

  renderHeadquarters = () => {
    const { headquarter, headquarters, validation } = this.state

    return (
      <SelectWithLoading
        attributeValue={headquarter ? headquarter : ''}
        attributeRequired={true}
        attributeOptions={headquarters}
        attributeName="headquarter"
        attributeLabel="HQ"
        error={validation.headquarter.error}
        errorMessage={validation.headquarter.message}
        onChange={this.handleHeadquarterChanged}
        onBlur={this.handleRequiredFieldBlurred}
      />
    )
  }

  renderUsers = () => {
    const { responsable, users, validation } = this.state
    return (
      <SelectWithLoading
        attributeValue={responsable ? responsable : ''}
        attributeRequired={true}
        attributeOptions={users}
        attributeName="responsable"
        attributeLabel="In charge"
        error={validation.responsable.error}
        errorMessage={validation.responsable.message}
        onChange={this.handleResponsableChanged}
        onBlur={this.handleRequiredFieldBlurred}
      />
    )
  }

  renderForm = () => {
    const { classes } = this.props
    const {
      name,
      date,
      placeName,
      address,
      phoneNumber,
      validation,
      eventType,
    } = this.state

    return (
      <Grid container>
        <Grid item xs={12} sm={6}>
          <TextFieldWithValidation
            id="name"
            className={classes.textField}
            required={true}
            label="Title"
            value={name}
            error={validation.name.error}
            helperText={validation.name.message}
            onChange={this.handleTextChanged}
            onBlur={this.handleRequiredFieldBlurred}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {this.renderHeadquarters()}
        </Grid>
        <Grid item xs={12} sm={6}>
          {this.renderUsers()}
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextFieldWithValidation
            id="date"
            className={classes.textField}
            required={true}
            label="Date"
            value={date}
            error={validation.date.error}
            helperText={validation.date.message}
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={this.handleDateChanged}
            onBlur={this.handleRequiredFieldBlurred}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="placeName"
            className={classes.textField}
            label="Place"
            value={placeName}
            margin="dense"
            onChange={this.handleTextChanged}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="address"
            className={classes.textField}
            label="Address"
            value={address}
            margin="dense"
            onChange={this.handleTextChanged}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="phoneNumber"
            className={classes.textField}
            label="Phone"
            value={phoneNumber}
            margin="dense"
            onChange={this.handleTextChanged}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <EventTypes
            selectedEventType={eventType}
            onUpdateEventType={this.updateEventType}
          />
        </Grid>
      </Grid>
    )
  }

  render() {
    const { isAdding } = this.props
    const { enableSave, images, contentSelectedImages } = this.state
    const title = isAdding ? 'Add event' : 'Edit event'
    return (
      <NavigationLayout title={title}>
        <Grid container justify="center" alignItems="center">
          {this.renderForm()}
          <ImagesPreview
            images={images}
            selectedImages={contentSelectedImages}
            enableEdit={true}
            onChange={this.handleSelectedFile}
            onDelete={this.handleDeleteImage}
          />
        </Grid>
        <FormButtons
          enableSave={enableSave}
          onSaveClick={this.handleSaveClicked}
          onCancelClick={this.handleCancelButton}
        ></FormButtons>
      </NavigationLayout>
    )
  }
}

export default withMessage(withRouter(withStyles(styles)(CreateUpdateEvent)))
