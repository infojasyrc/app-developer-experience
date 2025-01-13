'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAttendeesService(dbInstance) {

  const collection = dbInstance.collection('attendees');

  let baseService = new setupBaseService();

  async function create(data) {
    let newAttendee;
    let responseData = {
      documentId: null
    };

    try {
      newAttendee = await collection.add(data);
      responseData.documentId = newAttendee.id;
      baseService.returnData.message = 'Attendee was successfully created.';
    } catch (err) {
      console.error('Error adding an attendee: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error adding an attendee';
    } finally {
      baseService.returnData.data = responseData;
    }

    return baseService.returnData;
  }

  async function doList() {
    let allAttendees = [];

    try {
      let dataSnapshot = await collection.get();

      dataSnapshot.forEach((doc) => {
        let attendeeData = doc.data();
        attendeeData.documentId = doc.id;
        allAttendees.push(attendeeData);
      });

    } catch (err) {
      console.error('Error getting all attendees: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error getting all attendees';
    } finally {
      baseService.returnData.data = allAttendees;
    }

    return baseService.returnData;
  }

  async function findById(id) {
    let attendee = null;

    try {
      let attendeeSnapshot = await collection.doc(id).get();

      attendee = attendeeSnapshot.exists ?
        attendeeSnapshot.data() :
        null;
      attendee.documentId = id;
      baseService.returnData.message = 'Getting attendee information successfully';
    } catch (err) {
      console.error('Error getting attendee information', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error getting attendee information';
    } finally {
      baseService.returnData.data = attendee;
    }

    return baseService.returnData;
  }

  function remove(id) {
    try {
      let deleteDoc = collection.doc(id).delete();
      baseService.returnData.message = 'Attendee was deleted successfully';
    } catch (err) {
      console.error('Error removing an attendee: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error removing an attendee';
    }

    return baseService.returnData;
  }

  async function update(id, data) {
    try {
      await collection
        .doc(id)
        .update(data);
      baseService.returnData.message = 'Attendee was updated successfully';

    } catch (err) {
      console.error('Error updating attendee: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error updating attendee';
    }

    return baseService.returnData;
  }

  return {
    create,
    doList,
    findById,
    remove,
    update
  };
};
