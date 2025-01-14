'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupRolesService(dbInstance) {

  const collection = dbInstance.collection('roles');
  let baseService = new setupBaseService();

  async function doList() {
    let allRoles = [];

    try {
      let dataSnapshot = await collection.get();

      dataSnapshot.forEach((doc) => {
        let role = {
          id: doc.id,
          ...doc.data()
        };
        allRoles.push(role);
      });

      baseService.returnData.message = 'Getting all roles successfully';
    } catch (err) {
      console.error('Error getting documents: ', err);
      baseService.returnData.message = 'Error getting all roles';
      baseService.returnData.responseCode = 500;
    } finally {
      baseService.returnData.data = allRoles;
    }

    return baseService.returnData;
  }

  async function getRole(docId) {
    let role = null;

    try {
      let roleRef = await collection
        .doc(docId)
        .get();

      if (roleRef.exists) {
        role = roleRef.data();
        role.id = docId;
      }

      baseService.returnData.message = 'Getting role information successfully';
    } catch (err) {
      console.error('Error getting role information: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error getting role information';
    } finally {
      baseService.returnData.data = role;
    }

    return baseService.returnData;
  }

  return {
    doList,
    getRole
  };
};
