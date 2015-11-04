Introduction
------------
CDIF's Bluetooth LE manager implementation

Based on Sandeep Mistry's [noble-device](https://github.com/sandeepmistry/noble-device), the goal of this module is to provide common Bluetooth LE device management interface for CDIF framework

In addition to support [yeelight-blue](https://github.com/out4b/cdif-yeelight-blue) and [sensorTag](https://github.com/out4b/cdif-sensortag) extension modules, CDIF BLE manager module now support converting a device's well-known GATT profiles into CDIF's common device model.


This model is dynamically generated from the device's service discovery result. If a well-known characteristic have read / write property, respective read /write action calls will be generated. If the characteristic has notify or indicate property, the state variable's sendEvents property would be set to true so client can subscribe to event update from it. Below is a screen shot of the converted device model for [Pally Smart key finder](http://acesensor.com/product/pally-smart-key-finder/). And client can issue action call to trigger its immediate alert characteristic to buzz it (may need to turn off its passcode feature).

![alt tag](https://raw.githubusercontent.com/out4b/cdif-ble-manager/master/screenshot.png)


By doing this mapping, we hope to provide client web app developers a cleaner programming interface for Bluetooth LE devices which follows standardized Bluetooth LE profiles. In reality, there would be few manufacturers produce smart devices without their own extensions, however by doing this, we hope to give client apps a fall back so they can still access device's standardized profiles even they don't recognize those vendor-specific extensions, and also provide the ability to access BLE devices from remote places.

See following links for more details: <br/>


[https://github.com/out4b/cdif](https://github.com/out4b/cdif)
