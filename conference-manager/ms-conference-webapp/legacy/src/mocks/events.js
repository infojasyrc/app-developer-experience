import {uuidv4} from '../shared/tools';
import {getHeadquarterByName} from './headquarters';
import {users} from './users';

let staticEvents;

const getEvents = () => {
  if (staticEvents) {
    return staticEvents;
  }

  staticEvents = [
    {
      id: uuidv4(),
      name: 'Event 1',
      date: '2019-03-15T17:00:00.000',
      headquarter: getHeadquarterByName('Trujillo'),
      placeName: 'UADE',
      address: 'Some address 1',
      phoneNumber: '11111111',
      status: 'created',
      responsable: users[1],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }, {
      id: uuidv4(),
      name: 'Event With very large title that no one will ever read because they are afraid i' +
          't will break all layout and maybe, even possible destroy scentient life in the u' +
          'niverse just by snapping your fingers',
      date: '2019-04-22T11:45:00.000',
      headquarter: getHeadquarterByName('Trujillo'),
      placeName: 'UADE',
      address: 'Some address 2',
      phoneNumber: '2222222',
      status: 'open',
      responsable: users[0],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=1',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=2',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=3',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=4',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=5',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=6',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=7',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=8',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=9',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=10',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=11',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=12',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }, {
      id: uuidv4(),
      name: 'Event 3',
      date: '2019-03-10T16:25:00.000',
      headquarter: getHeadquarterByName('Trujillo'),
      placeName: 'UADE',
      address: 'Some address 2',
      phoneNumber: '2222222',
      status: 'paused',
      responsable: users[1],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }, {
      id: uuidv4(),
      name: 'Event 4',
      date: '2019-03-12T16:25:00.000',
      headquarter: getHeadquarterByName('Lima'),
      placeName: 'UADE',
      address: 'Some address 1',
      phoneNumber: '1111111',
      status: 'closed',
      responsable: users[1],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }, {
      id: uuidv4(),
      name: 'Event 5',
      date: '2019-03-12T16:20:00.000',
      headquarter: getHeadquarterByName('Lima'),
      placeName: 'UADE',
      address: 'Some address 1',
      phoneNumber: '1111111',
      status: 'created',
      responsable: users[1],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }, {
      id: uuidv4(),
      name: 'Event 6',
      date: '2019-04-03T16:25:00.000',
      headquarter: getHeadquarterByName('Lima'),
      placeName: 'UADE',
      address: 'Some address 1',
      phoneNumber: '1111111',
      status: 'created',
      responsable: users[1],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }, {
      id: uuidv4(),
      name: 'Event 7',
      date: '2019-04-03T16:25:00.000',
      headquarter: getHeadquarterByName('Arequipa'),
      placeName: 'UADE',
      address: 'Some address 1',
      phoneNumber: '1111111',
      status: 'created',
      responsable: users[1],
      images: [
        {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }, {
          id: uuidv4(),
          name: 'Some name',
          url: 'https://picsum.photos/1024/768?image=',
          thumbnailUrl: 'https://picsum.photos/100/150'
        }
      ]
    }
  ];

  return staticEvents;
}

export const events = getEvents();

export const getEvent = (id) => {
  const searchedIndex = staticEvents.findIndex(event => event.id === id);

  return staticEvents[searchedIndex];
};