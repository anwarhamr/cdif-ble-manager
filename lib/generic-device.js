var util = require('util');
var async = require('async');
var CdifDevice = require('cdif-device');
var wellKnownServices = require('./gatt-services.json');
var wellKnownCharacteristics = require('./gatt-characteristics.json');
var Appearance = require('./org.bluetooth.characteristic.gap.appearance.json');

var GENERIC_ACCESS_SERVICE_UUID                     = '1800';
var DEVICE_NAME_UUID                                = '2a00';
var APPEARANCE_UUID                                 = '2a01';
var DEVICE_INFORMATION_SERVICE_UUID                 = '180a';
var SYSTEM_ID_UUID                                  = '2a23';
var MODEL_NUMBER_UUID                               = '2a24';
var SERIAL_NUMBER_UUID                              = '2a25';
var MANUFACTURER_NAME_UUID                          = '2a29';

var GenericDevice = function(bleDevice) {
  var spec = require('./device-template.json');
  this.device = bleDevice;
  CdifDevice.call(this, spec);
};

util.inherits(GenericDevice, CdifDevice);

GenericDevice.prototype.addActions = function(property, name, actionList) {
  var actionName = null;
  if (property === 'read') {
    actionName = 'read ' + name;
    actionList[actionName] = {};
    actionList[actionName].argumentList = {};
    actionList[actionName].argumentList[name] = {};
    actionList[actionName].argumentList[name].direction = 'out';
    actionList[actionName].argumentList[name].relatedStateVariable = name;
  }
  if (property === 'write' || property === 'writeWithoutResponse') {
    actionName = 'write ' + name;
    actionList[actionName] = {};
    actionList[actionName].argumentList = {};
    actionList[actionName].argumentList[name] = {};
    actionList[actionName].argumentList[name].direction = 'in';
    actionList[actionName].argumentList[name].relatedStateVariable = name;
  }
};

GenericDevice.prototype.addStateVariables = function(property, name, serviceStateTable) {
  if (property === 'notify' || property === 'indicate') {
    serviceStateTable[name].sendEvents = true;
  }
};


GenericDevice.prototype.addActionsAndStateVariables = function(characteristics, service) {
  var uuid = characteristics.uuid;
  if (wellKnownCharacteristics[uuid] != null) {
    var name = wellKnownCharacteristics[uuid].name;
    var dataType = wellKnownCharacteristics[uuid].dataType;
    var allowedValueRange = wellKnownCharacteristics[uuid].allowedValueRange;
    service.serviceStateTable[name] = {};
    service.serviceStateTable[name].dataType = wellKnownCharacteristics[uuid].dataType;
    if (allowedValueRange) {
      service.serviceStateTable[name].allowedValueRange = allowedValueRange;
    }
    service.serviceStateTable[name].sendEvents = false;
    var properties = characteristics.properties;
    for (var i in properties) {
      this.addActions(properties[i], name, service.actionList);
      this.addStateVariables(properties[i], name, service.serviceStateTable);
    }
  }
};

GenericDevice.prototype.addServiceSpec = function(gatt_service, serviceList) {
  var gatt_service_uuid = gatt_service.uuid;
  if (wellKnownServices[gatt_service_uuid] != null) {
    var serviceID = wellKnownServices[gatt_service_uuid].name;
    var serviceIDString = 'urn:bluetooth-org:serviceID:' + serviceID;
    var service = serviceList[serviceIDString] = {};
    service.serviceType = wellKnownServices[gatt_service_uuid].type;
    service.serviceStateTable = {};
    service.actionList = {};
    for (var i in gatt_service.characteristics) {
      this.addActionsAndStateVariables(gatt_service.characteristics[i], service);
    }
  }
};

GenericDevice.prototype.updateSpec = function() {
  var _this = this;
  var hasError = false;
  var spec = {};
  spec.configId = 1; //this value can be updated if device module upgraded fw
  spec.specVersion = {};
  spec.specVersion.major = 1;
  spec.specVersion.minor = 0;
  spec.device = {};
  spec.device.userAuth = false;
  spec.device.deviceType = 'urn:bluetooth-org:device:Unknown:1';
  spec.device.serviceList = {};
  // build services spec
  // console.log(this.device._peripheral._noble._characteristics['f1a3d9fcef28']['1802']);
  var gatt_services = this.device._peripheral.services;
  for (var i in gatt_services) {
    this.addServiceSpec(gatt_services[i], spec.device.serviceList);
  }
  // add device information if available
  async.parallel([
    function(callback) {
      _this.device.readStringCharacteristic(GENERIC_ACCESS_SERVICE_UUID, DEVICE_NAME_UUID, function(err, data) {
        if (err) callback(null, null);
        else {
          spec.device.friendlyName = data;
          callback(null, data);
        }
      });
    },
    function(callback) {
      _this.device.readStringCharacteristic(DEVICE_INFORMATION_SERVICE_UUID, MODEL_NUMBER_UUID, function(err, data) {
        if (err) callback(null, null);
        else {
          spec.device.modelNumber = data;
          callback(null, data);
        }
      });
    },
    function(callback) {
      _this.device.readStringCharacteristic(DEVICE_INFORMATION_SERVICE_UUID, SERIAL_NUMBER_UUID, function(err, data) {
        if (err) callback(null, null);
        else {
          spec.device.serialNumber = data;
          callback(null, data);
        }
      });
    },
    function(callback) {
      _this.device.readStringCharacteristic(DEVICE_INFORMATION_SERVICE_UUID, MANUFACTURER_NAME_UUID, function(err, data) {
        if (err) callback(null, null);
        else {
          spec.device.manufacturer = data;
          callback(null, data);
        }
      });
    },
    function(callback) {
      _this.device.readUInt16LECharacteristic(GENERIC_ACCESS_SERVICE_UUID, APPEARANCE_UUID, function(err, data) {
        if (!err) {
          console.log('appearance: '+ data);
          var enumeration = Appearance.Characteristic.Value[0].Field[0].Enumerations[0].Enumeration;
          for (var i in enumeration) {
            if (enumeration[i].$.key == data) {
              spec.device.deviceType = 'urn:bluetooth-org:device:' + enumeration[i].$.value + ':1';
            }
          }
          callback(null, data);
        } else {
          callback(null, null);
        }
      });
    }
  ], function(err, results) {
    if (err) console.error(err);
    _this.emit('specupdate', spec);
  });
};



module.exports = GenericDevice;
