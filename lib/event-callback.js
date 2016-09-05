function EventCallback(genericDevice, serviceID, stateVarName) {
  var _this = this;
  this.device = genericDevice;
  this.serviceID = serviceID;
  this.stateVarName = stateVarName;

  this.onEvent = function(data) {
    var value = {};
    value[_this.stateVarName] = data.readInt16LE(0);
    _this.device.setServiceStates(_this.serviceID, value, function(err) {
      if (err) {
        console.error('cannot set service states: ' + _this.serviceID);
      }
    });
  };
};

module.exports = EventCallback;
