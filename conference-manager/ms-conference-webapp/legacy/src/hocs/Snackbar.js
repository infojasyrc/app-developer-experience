import React from 'react';
import {Snackbar, SnackbarContent} from '@material-ui/core';

export const withMessage = (Component) => {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        message: null,
        isError: false,
        show: false,
        autoHide: false
      };
    }

    showLoading = () => {
      this.showMessage('Loading data');
    }

    showSaving = () => {
      this.showMessage('Saving');
    }

    showMessage = (message, autoHide) => {
      let newState = {
        message: message,
        isError: false,
        show: true
      };

      if (autoHide) {
        newState.autoHide = true
      }

      this.setState(newState);
    }

    showError = (message, autoHide) => {
      let newState = {
        message: message,
        isError: true,
        show: true
      };

      if (autoHide) {
        newState.autoHide = true;
      }

      this.setState(newState);
    }

    hideMessage = () => {
      this.setState({message: null, isError: false, show: false, autoHide: false});
    }

    handleClose = () => {
      this.hideMessage();
    }

    render() {
      const {message, isError, show, autoHide} = this.state;

      const addedProps = {
        showLoading: this.showLoading,
        showSaving: this.showSaving,
        showMessage: this.showMessage,
        hideMessage: this.hideMessage,
        showError: this.showError
      };

      const messageSpan = <span id="message-id">{message
          ? message
          : ''}</span>;

      let snackbar = <Snackbar
        autoHideDuration={autoHide ? 3000 : null}
        anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
        open={show}
        message={messageSpan}
        onClose={this.handleClose}/>;

      if (isError) {
        snackbar = <Snackbar
          autoHideDuration={autoHide ? 3000 : null}
          anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
          open={show}
          onClose={this.handleClose}>
          <SnackbarContent
            aria-describedby="client-snackbar"
            style={{
            backgroundColor: '#ff0505'
          }}
            message={<span id = "client-snackbar" > {
            message
          } </span>}/>
        </Snackbar>;
      }

      return (
        <React.Fragment>
          <Component {...addedProps} {...this.props}/> {snackbar}
        </React.Fragment>
      );
    }
  };
}
