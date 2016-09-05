function InvokeObject(serviceUUID, characteristicUUID, device, isRead, argName, dataType) {
  var _this = this;
  this.serviceUUID = serviceUUID;
  this.characteristicUUID = characteristicUUID;
  this.dataType = dataType;
  this.device = device;
  this.argName = argName;
  if (isRead) {
    this.invoke = function(args, callback) {
      _this.device.readDataCharacteristic(_this.serviceUUID, _this.characteristicUUID, function(err, data) {
        if (!err) {
          _this.convertFromBuffer(data, _this.dataType, function(error, value) {
            var output = {};
            if (err) {
              output[argName] = data;
            } else {
              output[argName] = value;
            }
            callback(null, output);
          });
        } else {
          callback(err, null);
        }
      });
    };
  } else {
    this.invoke = function(args, callback) {
      var key = Object.keys(args)[0]; // there could be only 1 arg in this case
      var value = args[key];
      _this.convertToBuffer(value, _this.dataType, function(err, data) {
        if (!err) {
          _this.device.writeDataCharacteristic(_this.serviceUUID, _this.characteristicUUID, data, callback);
        } else {
          callback(err, null);
        }
      });
    };
  }
};


InvokeObject.prototype.convertToBuffer = function(value, type, callback) {
  try {
    switch (type) {
      case 'uint8':
      case 'boolean':
        var buffer = new Buffer(1);
        buffer.writeUInt8(value, 0);
        callback(null, buffer);
        break;
      case 'sint8':
        var buffer = new Buffer(1);
        buffer.writeInt8(value, 0);
        callback(null, buffer);
        break;
      case 'uint16':
        var buffer = new Buffer(2);
        buffer.writeUInt16LE(value, 0);
        callback(null, buffer);
        break;
      case 'sint16':
        var buffer = new Buffer(2);
        buffer.writeInt16LE(value, 0);
        callback(null, buffer);
        break;
      case 'uint32':
        var buffer = new Buffer(4);
        buffer.writeUInt32LE(value, 0);
        callback(null, buffer);
        break;
      case 'sint32':
        var buffer = new Buffer(4);
        buffer.writeInt32LE(value, 0);
        callback(null, buffer);
        break;
      case 'float':
        var buffer = new Buffer(4);
        buffer.writeFloatLE(value, 0);
        callback(null, buffer);
        break;
      case 'double':
        var buffer = new Buffer(8);
        buffer.writeDoubleLE(value, 0);
        callback(null, buffer);
        break;
      case 'string':
        var buffer = new Buffer(value);
        callback(null, buffer);
        break;
      default:
        callback(new Error('cannot convert this type to buffer: ' + type), null);
        break;
    }
  } catch (e) {
    callback(new Error('convert buffer to value error: ' + e.message), null);
  }
}

InvokeObject.prototype.convertFromBuffer = function(data, type, callback) {
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
}

module.exports = InvokeObject;
