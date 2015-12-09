var EventCallback = require('./event-callback');

function SubscribeObject(bleDevice, genericDevice, serviceID, serviceUUID, eventsInfo) {
  var _this = this;
  this.serviceID = serviceID;
  this.serviceUUID = serviceUUID;
  this.eventsInfo = eventsInfo;
  this.device = bleDevice;
  this.genericDevice = genericDevice;
  this.onEvents = [];

  for (var i in this.eventsInfo) {
    this.onEvents[i] = new EventCallback(this.genericDevice, this.serviceID, this.eventsInfo[i].name).onEvent;
  }

  this.subscribe = function(onChange, callback) {
    // onChange shall be ignored here
    var error = null;
    for (var i in _this.eventsInfo) {
      _this.device.notifyCharacteristic(_this.serviceUUID, _this.eventsInfo[i].uuid, true, _this.onEvents[i], function(err) {
        if (err) error = err;
      });
    }
    console.log('subscribe to : %s', _this.serviceUUID);
    callback(error);
  };

  this.unsubscribe = function(callback) {
    var error = null;
    for (var i in _this.eventsInfo) {
      _this.device.notifyCharacteristic(_this.serviceUUID, _this.eventsInfo[i].uuid, false, _this.onEvents[i], function(err) {
        if (err) error = err;
      });
    }
    callback(error);
    console.log('unsubscribe from : %s', _this.serviceUUID);
  };
};

module.exports = SubscribeObject;
