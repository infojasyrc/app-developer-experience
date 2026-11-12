import React, {Component} from 'react';
import {MuiThemeProvider} from '@material-ui/core/styles';

import {theme} from '../styles/MainTheme';

export default class ThemeProvider extends Component {
  render() {
    const {children} = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    );
  }
}