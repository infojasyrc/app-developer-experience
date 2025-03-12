import {getRole} from './roles';
import {uuidv4, getBase64} from '../shared/tools';

let staticUsers;

const getUsers = () => {
  if (staticUsers) {
    return staticUsers;
  }

  staticUsers = [
    {
      id: 'af6s-232-d5g6-491',
      userId: 'af6s-232-d5g6-498',
      email: 'something1@mail.com',
      name: 'user1',
      lastName: 'user1',
      avatarUrl: 'https://i.pinimg.com/originals/73/5f/2d/735f2d59654f21f74bb15fb29883878d.jpg',
      isAdmin: true,
      role: getRole('1'),
      isEnabled: true
    }, {
      id: 'af6s-232-d5g6-492',
      userId: 'af6s-232-d5g6-498',
      email: 'something2@mail.com',
      name: 'user2',
      lastName: 'user2',
      avatarUrl: 'http://images6.fanpop.com/image/photos/40700000/Justice-League-2017-Portrait-Ben' +
          '-Affleck-as-Batman-ben-affleck-40755164-421-500.jpg',
      isAdmin: false,
      role: getRole('2'),
      isEnabled: true
    }, {
      id: 'af6s-232-d5g6-493',
      userId: 'af6s-232-d5g6-498',
      email: 'something3@mail.com',
      name: 'user3',
      lastName: 'user3',
      avatarUrl: 'https://i.etsystatic.com/10875973/c/539/428/56/65/il/291fb7/1243600748/il_340x27' +
          '0.1243600748_n3u4.jpg',
      isAdmin: true,
      role: getRole('2'),
      isEnabled: true
    }, {
      id: 'af6s-232-d5g6-494',
      userId: 'af6s-232-d5g6-498',
      email: 'something4@mail.com',
      name: 'user4',
      lastName: 'user4',
      avatarUrl: 'https://i.etsystatic.com/10875973/c/539/428/56/65/il/291fb7/1243600748/il_340x27' +
          '0.1243600748_n3u4.jpg',
      isAdmin: false,
      role: getRole('1'),
      isEnabled: true
    }, {
      id: 'af6s-232-d5g6-495',
      userId: 'af6s-232-d5g6-498',
      email: 'something5@mail.com',
      name: 'user5',
      lastName: 'user5',
      avatarUrl: 'http://images6.fanpop.com/image/photos/40700000/Justice-League-2017-Portrait-Ben' +
          '-Affleck-as-Batman-ben-affleck-40755164-421-500.jpg',
      isAdmin: true,
      role: getRole('2'),
      isEnabled: true
    }, {
      id: 'af6s-232-d5g6-496',
      userId: 'af6s-232-d5g6-498',
      email: 'something6@mail.com',
      name: 'user6',
      lastName: 'user6',
      avatarUrl: null,
      isAdmin: false,
      role: getRole('1'),
      isEnabled: false
    }
  ];

  return staticUsers;
}

export const users = getUsers();

export const getUser = (id) => {
  const searchedUserIndex = staticUsers.findIndex(user => user.id === id);

  return staticUsers[searchedUserIndex];
};

export const addUser = (user) => {
  user.id = uuidv4();
  user.role = getRole(user.role);

  if (user.avatarFile) {
    getBase64(user.avatarFile).then(src => {
      user.avatarUrl = src;
    });
  }

  staticUsers.push(user);
}

export const updateUser = (userToUpdate) => {
  const searchedUserIndex = staticUsers.findIndex(user => user.id === userToUpdate.id);

  const user = staticUsers[searchedUserIndex];
  user.email = userToUpdate.email;
  user.name = userToUpdate.name;
  user.lastName = userToUpdate.lastName;
  user.role = getRole(userToUpdate.role);
  user.isAdmin = userToUpdate.isAdmin;

  if (user.avatarFile) {
    getBase64(user.avatarFile).then(src => {
      user.avatarUrl = src;
    });
  }
}

export const activate = (id) => {
  const searchedUserIndex = staticUsers.findIndex(user => user.id === id);
  const user = staticUsers[searchedUserIndex];
  user.isEnabled = true;
}

export const deactivate = (id) => {
  const searchedUserIndex = staticUsers.findIndex(user => user.id === id);
  const user = staticUsers[searchedUserIndex];
  user.isEnabled = false;
}