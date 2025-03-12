import baseRequest from '../baseRequest';

export default class Images extends baseRequest {
  constructor() {
    super();
    this.method = 'image';
  }

  add = (data) => {
    const formData = new FormData();

    for (let index = 0; index < data.images.length; index++) {
      const image = data.images[index];
      formData.append(`file${index}`, image);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    return this.post(`${this.method}/${data.id}`, formData, config);
  }

  deleteImage = (imageId) => {
    return this.delete(`${this.method}/${imageId}`);
  }
}
