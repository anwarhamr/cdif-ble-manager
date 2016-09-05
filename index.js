var util = require('util');
var events = require('events');
var NobleDevice = require('noble-device');
var GenericDevice = require('./lib/generic-device');
var supported_modules = require('./modules.json');

var connect = function(user, pass, callback) {
  var _this = this;
  this.device.connectAndSetup(function(err) {
    if (!err) {
      if (_this instanceof GenericDevice) {
        _this._updateDeviceSpec();
      }
    }
    callback(err);
  });
};

var disconnect = function(callback) {
  this.device.disconnect(function(){
    callback(null);
  });
};

var getHWAddress = function(callback) {
  if (this.device._peripheral.address != null) {
    callback(null, this.device._peripheral.address);
  } else {
    callback(new Error('hw address not found'), null);
  }
};

function BleDeviceManager() {
  this.onDiscoverBleDevice = function(bleDevice) {
    var device = null;
    var peripheral = bleDevice._peripheral;

    for (var i in supported_modules) {
      var mod = require(supported_modules[i]);
      if (mod.is(peripheral)) {
        device = new mod(bleDevice);
        break;
      }
    }
    if (device === null) {
      device = new GenericDevice(bleDevice);
    }
    device._connect = connect.bind(device);
    device._disconnect = disconnect.bind(device);
    device._getHWAddress = getHWAddress.bind(device);
    this.emit('deviceonline', device, this);
  }.bind(this);
  this.discoverState = 'stopped';
}

util.inherits(BleDeviceManager, events.EventEmitter);

var BleDevice = function (peripheral) {
  NobleDevice.call(this, peripheral);
}

NobleDevice.Util.inherits(BleDevice, NobleDevice);

BleDeviceManager.prototype.discoverDevices = function() {
  if (this.discoverState === 'discovering') {
    return;
  }
  BleDevice.discoverAll(this.onDiscoverBleDevice);
  this.discoverState = 'discovering';
};

BleDeviceManager.prototype.stopDiscoverDevices = function() {
  BleDevice.stopDiscoverAll(this.onDiscoverBleDevice);
  this.discoverState = 'stopped';
};


module.exports = BleDeviceManager;
