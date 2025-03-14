import React, {Component} from 'react';

import {withStyles} from '@material-ui/core';

import {styles} from './../../styles/AttendeeFormHeaderStep';

const strings = {
  step: 'Paso',
  stepOf: 'de'
}

class AttendeeFormHeaderStep extends Component {

  render() {
    const {eventType, activeStep} = this.props;

    if (eventType === 'recruiting') {
      return (
        <div className="">
          <label>{strings.step}</label>
          &nbsp;
          <strong>{activeStep}</strong>
          &nbsp;
          <label>{strings.stepOf}</label>
          &nbsp;
          <label>2</label>
        </div>
      );
    }

    return null;
  }
}

export default withStyles(styles)(AttendeeFormHeaderStep);

