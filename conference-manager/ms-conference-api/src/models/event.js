class Event {

  /**
   * Constructor
   * @param {Object} event 
   */
  constructor(event) {
    this.address = event.address;
    this.eventDate = event.eventDate;
    this.name = event.name;
    this.status = event.status;
    this.year = event.year;
    this.id = event.id || '';
  }
}

export default Event;
