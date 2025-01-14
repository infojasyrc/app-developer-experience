'use strict';

const firebaseAdminMock = {
  createUser: (data) => {
    return Promise.resolve({
      uid: 10000,
      email: 'email@test.com',
      emailVerified: false,
      password: 'aaaaaa',
      displayName: 'Juan Perez',
      photoURL: undefined,
      disabled: false,
      phoneNumber: undefined
    });
  },
  getUser: (uid) => {
    return Promise.resolve({
      uid: uid,
      email: '',
      emailVerified: '',
      password: 'aaaaaa',
      displayName: true,
      photoURL: '',
      disabled: false
    });
  },
  deleteUser: (uid) => {
    return Promise.resolve({});
  },
  listUsers: (numberOfRecords) => {
    return Promise.resolve({
      users: [{
          uid: 'aaaaaaaaaaaaaaaa',
          displayName: '',
          email: '',
          name: '',
          lastName: '',
          isAdmin: false,
          photoURL: '',
          disabled: false
        },
        {
          uid: 'bbbbbbbbbbbbbbb',
          displayName: '',
          email: '',
          name: '',
          lastName: '',
          isAdmin: false,
          photoURL: '',
          disabled: false
        }
      ]
    });
  },
  updateUser: (uid, data) => {
    return Promise.resolve({
      uid: uid,
      email: '',
      emailVerified: false,
      password: 'aaaaaa',
      phoneNumber: '',
      displayName: '',
      photoURL: '',
      disabled: false
    });
  }
};

module.exports = firebaseAdminMock;
