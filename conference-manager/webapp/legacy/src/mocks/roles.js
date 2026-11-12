export const roles = [
  {
    id: '1',
    name: 'Marketing'
  }, {
    id: '2',
    name: 'Human Resources'
  }
];

export const getRole = (id) => {
  const searchedIndex = roles.findIndex(role => role.id === id);

  return roles[searchedIndex];
}