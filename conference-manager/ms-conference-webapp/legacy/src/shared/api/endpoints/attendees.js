import FileSaver from 'file-saver';
import BaseRequest from '../baseRequest';

export default class Attendees extends BaseRequest {
  constructor() {
    super();

    this.method = 'attendees';
  }

  download = async(id, name) => {
    const response = await this.getFile(`${this.method}/${id}`);
    return FileSaver.saveAs(response.data, `${name}.csv`);
  }
}
