import React, {Component} from 'react';
import {ActionsContext} from '../shared/contexts/ActionsContext';

export default class ActionsProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      action: {
        name: null,
        params: null
      },
      execute: (name, params) => {
        this.setState({
          action: {
            name: name,
            params: params
          }
        });
      }
    };
  }

  render() {
    const {children} = this.props;
    return (
      <ActionsContext.Provider value={this.state}>
        {children}
      </ActionsContext.Provider>
    );
  }
}
