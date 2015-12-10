function EventCallback(genericDevice, serviceID, stateVarName, dataType) {
  var _this = this;
  this.device = genericDevice;
  this.serviceID = serviceID;
  this.stateVarName = stateVarName;
  this.dataType = dataType;

  this.onEvent = function(data) {
    var value = {};
    _this.convertFromBuffer(data, _this.dataType, function(err, output) {
      if (err) {
        return;
      }
      value[_this.stateVarName] = output;
      _this.device.setServiceStates(_this.serviceID, value, function(err) {
        if (err) {
          console.error('cannot set service states: ' + _this.serviceID);
        }
      });
    });
  };
};

EventCallback.prototype.convertFromBuffer = function(data, type, callback) {
  try {
    switch (type) {
      case 'boolean':
      case 'uint8':
        callback(null, data.readUInt8(0));
        break;
      case 'uint16':
        callback(null, data.readUInt16LE(0));
        break;
      case 'uint32':
        callback(null, data.readUInt32LE(0));
        break;
      case 'sint8':
        callback(null, data.readInt8(0));
        break;
      case 'sint16':
        callback(null, data.readInt16LE(0));
        break;
      case 'sint32':
        callback(null, data.readInt32LE(0));
        break;
      case 'float':
        callback(null, data.readFloatLE(0));
        break;
      case 'double':
        callback(null, data.readDoubleLE(0));
        break;
      case 'string':
        callback(null, data.toString());
        break;
      default:
        console.warn('cannot convert this type: ' + type + ' , return raw buffer data');
        callback(null, data);
        break;
    }
  } catch (e) {
    callback(new Error('convert data from buffer error: ' + e.message), null);
  }
};

module.exports = EventCallback;
