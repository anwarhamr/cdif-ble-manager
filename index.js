var util = require('util');
var events = require('events');
var NobleDevice = require('noble-device');
var YeelightBlue = require('cdif-yeelight-blue');
var SensorTag = require('cdif-sensortag');

var connect = function(user, pass, callback) {
  this.device.connectAndSetup(function(err) {
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

var collectDeviceInformation = function(device) {
  device.device.readDeviceName(function(err, deviceName) {
    if(!err) {
      device.friendlyName = deviceName;
    }
  });
  device.device.readSerialNumber(function(err, serialNumber) {
    if(!err) {
      device.serialNumber = serialNumber;
    }
  });
  device.device.readFirmwareRevision(function(err, firmwareRevision) {
    if(!err) {
      device.firmwareRevision = firmwareRevision;
    }
  });
  device.device.readHardwareRevision(function(err, hardwareRevision) {
    if(!err) {
      device.hardwareRevision = hardwareRevision;
    }
  });
  device.device.readSoftwareRevision(function(err, softwareRevision) {
    if(!err) {
      device.softwareRevision = softwareRevision;
    }
  });
  device.device.readManufacturerName(function(err, manufacturerName) {
    if(!err) {
      device.manufacturerName = manufacturerName;
    }
  });
}

function BleDeviceManager() {
  this.onDiscoverBleDevice = function(bleDevice) {
    var device;
    var peripheral = bleDevice._peripheral;
    //TODO: in the future device type check should follow GATT standard profiles
    if (YeelightBlue.is(peripheral)) {
      var yeelightBlueDevice = new YeelightBlue(bleDevice);
      device = yeelightBlueDevice;
    }
    else if (SensorTag.is(peripheral)) {
      var sensorTagDevice = new SensorTag(bleDevice);
      device = sensorTagDevice;
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
NobleDevice.Util.mixin(BleDevice, NobleDevice.DeviceInformationService);

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
