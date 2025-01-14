'use strict';

const {v4: uuidGenerator} = require('uuid');
const setupBaseService = require('./base.service');

module.exports = function setupStorageService(adminInstance) {

  const storage = adminInstance;
  let baseService = new setupBaseService();

  async function upload(file) {
    let responseData = {
      id: uuidGenerator(),
      url: ''
    };

    try {
      let eventsRef = storage.ref().child('events');

      const metadata = {
        contentType: 'image/jpeg'
      };

      const currentFileRef = await eventsRef
        .child(responseData.id)
        .put(file.buffer, metadata);

      responseData.url = await currentFileRef.ref.getDownloadURL();
      baseService.returnData.message = 'File uploaded succesfully';
    } catch (err) {
      console.error('Error while uploading file: ', err);
      baseService.returnData.message = 'Error while uploading file';
      baseService.returnData.responseCode = 500;
    }

    baseService.returnData.data = responseData;

    return baseService.returnData;
  }

  async function removeImage(id) {
    const eventsRef = storage.ref().child('events');

    const currentFileRef = eventsRef.child(id);

    await currentFileRef.delete();
  }

  async function erase(id) {

    try {
      removeImage(id);
      baseService.returnData.message = 'File deleted succesfully';
    } catch (err) {
      console.error('Error while deleting file: ', err);
      baseService.returnData.message = 'Error while deleting file';
      baseService.returnData.responseCode = 500;
    }

    return baseService.returnData;
  }

  async function eraseList(allImages) {
    try {
      for (let i = 0; i < allImages.length; i++) {
        removeImage(allImages[i].id);
      }
    } catch (err) {
      console.error('Errore removing all images: ', err);
    }
  }

  return {
    upload,
    erase,
    eraseList
  };
};
