import React, {Component} from 'react';
import {UserContext} from '../contexts/UserContext';

export default class UserProvider extends Component {
  constructor(props) {
    super(props);

    const storage = window.localStorage;

    const emptyData = {
      isLoggedIn: false,
      selectedHeadquarter: null,
      user: {
        id: null,
        fullName: '',
        avatarUrl: null,
        role: null,
        isAdmin: false,
        token: ''
      }
    };

    const data = JSON.parse(storage.getItem('userData'));

    const stateToUse = data
      ? data
      : emptyData;

    this.state = {
      ...stateToUse,
      login: (user, token) => {
        const data = {
          isLoggedIn: true,
          user: {
            id: user.id,
            uid: user.uid,
            fullName: `${user.name} ${user.lastName}`,
            avatarUrl: user.avatarUrl,
            role: user.role,
            isAdmin: user.isAdmin,
            token: token
          }
        };

        storage.setItem('userData', JSON.stringify(data));
        this.setState(data);
      },
      logout: () => {
        storage.removeItem('userData');

        this.setState({
          isLoggedIn: false,
          user: {
            id: null,
            fullName: '',
            avatarUrl: null,
            role: null,
            isAdmin: false,
            token: ''
          }
        });
      },
      selectHeadquarter: (hq) => {
        const newState = this.state;

        newState.selectedHeadquarter = hq;

        storage.setItem('userData', JSON.stringify(newState));

        this.setState(newState);
      }
    };
  }

  render() {
    const {children} = this.props;
    return (
      <UserContext.Provider value={this.state}>
        {children}
      </UserContext.Provider>
    );
  }
}
