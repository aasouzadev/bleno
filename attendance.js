const bleno = require('bleno');

const attendees = [];
const settings = {
  service_id: '12ab',
  characteristic_id: '34cd'
};

// Event listener for changes in Bluetooth state
bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('AttendanceApp', [settings.service_id]);
  } else {
    bleno.stopAdvertising();
  }
});

// Event listener for when advertising starts
bleno.on('advertisingStart', function(error) {
  if (error) {
    console.error('Error starting advertising:', error);
  } else {
    console.log('Advertising started..');
    // Define the services and characteristics
    const service = new bleno.PrimaryService({
      uuid: settings.service_id,
      characteristics: [
        new bleno.Characteristic({
          uuid: settings.characteristic_id,
          properties: ['read', 'write'],
          onWriteRequest: function(data, offset, withoutResponse, callback) {
            try {
              // Parse incoming data as JSON
              const attendee = JSON.parse(data.toString());
              // Add timestamp
              attendee.time_entered = Date.now();
              // Store attendee data
              attendees.push(attendee);
              console.log('New attendee:', attendee);
              callback(this.RESULT_SUCCESS);
            } catch (error) {
              console.error('Error parsing data:', error);
              callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
            }
          }
        })
      ]
    });
    // Set the services
    bleno.setServices([service]);
  }
});
