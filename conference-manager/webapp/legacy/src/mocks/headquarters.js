import {uuidv4} from '../shared/tools';

let staticHeadquarters;

const getHeadquarters = () => {
  if (staticHeadquarters) {
    return staticHeadquarters;
  }

  staticHeadquarters = [
    {
      id: uuidv4(),
      name: 'Trujillo'
    }, {
      id: uuidv4(),
      name: 'Piura'
    }, {
      id: uuidv4(),
      name: 'Cuzco'
    }, {
      id: uuidv4(),
      name: 'Lima'
    }, {
      id: uuidv4(),
      name: 'Arequipa'
    }
  ];

  return staticHeadquarters;
}

export const headquarters = getHeadquarters();

export const getHeadquarterByName = (name) => {
  const index = headquarters.findIndex(headquarter => headquarter.name === name);

  return headquarters[index];
}