import React, { useState } from 'react';
import logo from './logo.png';
import './App.css';
import BlufiParam from './espConsts';
import { postDeviceMode, postStaWifiInfo } from './utils';

function App() {
  const [SSID, setSSID] = useState("");
  const [password, setPassword] = useState("");

  const [bleAvaliable, setBleAvaliable] = useState(false);
  const [gattServer, setGattServer] = useState(null);
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);

  const [notification, setNotification] = useState("");

  const [notifyCharacteristic, setNotifyCharacteristic] = useState(null);
  const [writeCharacteristic, setWriteCharacteristic] = useState(null);

  const isBLEAvaliable = () => {
    if(navigator.bluetooth === undefined){
      return;
    }
    navigator.bluetooth.getAvailability()
    .then(isBluetoothAvailable => setBleAvaliable(isBluetoothAvailable));
  }

  const bleScan = () => {
    const options = {
      // "filters": [{
      //   "name": "BLUFI_DEVICE"
      // }],
      acceptAllDevices: true,
      // optionalServices: ['generic_access']
      optionalServices: [BlufiParam.UUID_SERVICE]
    };
    // console.log(navigator.bluetooth);
    const device = navigator.bluetooth.requestDevice(options);
    return device.then((device)=>{
      // console.log("BLE Scan: ", device);

      device.addEventListener('gattserverdisconnected', onDisconnected);
      setDevice(device);
      setConnected(device.gatt.connected);
    });
  };

  const readManufacturername = () => {
    return this.device.gatt.getPrimaryService("device_information")
    .then(service => service.getCharacteristic("manufacturer_name_string"))
    .then(characteristic => characteristic.readValue());
  }

  const onDisconnected = () => {
    setConnected(false);
    console.log('Device is disconnected.');
  }

  const connect = () => {
    if(!device){
      setDevice(null);
      setGattServer(null);
      console.log("Connect: No device selected");
      return "Device is not connected";
    }
    return device.gatt.connect().then((server) => {
      setDevice(server.device);
      setConnected(server.connected);
      // console.log("Services: ", server.getPrimaryService('generic_access'))
      setGattServer(server);
      // console.log("Connect: ", server);
    });
  }

  const getSupportedProperties = (characteristic) => {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return '[' + supportedProperties.join(', ') + ']';
  }

  // const blufiServiceUUID = '0000ffff-0000-1000-8000-00805f9b34fb';
  // const blufiWriteCharacteristicUUID = '0000ff01-0000-1000-8000-00805f9b34fb';
  // const blufiNotifyCharacteristicUUID = '0000ff02-0000-1000-8000-00805f9b34fb';

  const ab2str = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }
  const str2ab = (str) => {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  const handleNotifications = (event) => {
    // console.log("Notification: ", event)
    //setNotification(event);
    const value = event.target.value;
    console.log("Notification: ", value)
    console.log("Notification: ", value.buffer)
    // setNotification(value);
  };
  const attachNotifyCharacteristics = () => {
    return gattServer.getPrimaryService(BlufiParam.UUID_SERVICE)
      .then(service => service.getCharacteristic(BlufiParam.UUID_NOTIFICATION_CHARACTERISTIC))
      .then(notifyCharacteristic => {
        // console.log("Notify char", notifyCharacteristic);
        // console.log("Starting notifications");
        setNotifyCharacteristic(notifyCharacteristic);
        notifyCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        return notifyCharacteristic.startNotifications()
      })
  }
  const attachWriteCharacteristics = () => {
    return gattServer.getPrimaryService(BlufiParam.UUID_SERVICE)
      .then(service => service.getCharacteristic(BlufiParam.UUID_WRITE_CHARACTERISTIC))
      .then(writeCharacteristic => {
        // console.log("Write char", writeCharacteristic);
        setWriteCharacteristic(writeCharacteristic);
      })
  }

  const writeConfigureMessage = () => {
    const configurationParams = {
      ssid: SSID,
      ssidPassword: password
    }
    if(!writeCharacteristic){
      return;
    }
    // console.log('Writing SSID: ', configurationParams.ssid)
    // console.log('Writing password: ', configurationParams.ssidPassword)
    postStaWifiInfo(configurationParams, writeCharacteristic);
  }

  const writeModeMessage = () => {
    // console.log(writeCharacteristic);
    if(!writeCharacteristic){
      return;
    }
    console.log("writeModeMessage: Write Char: ", writeCharacteristic)
    // const value = "Hello";
    // const encoder = new TextEncoder('utf-8');
    // // return writeCharacteristic.writeValue(encoder.encode(value));
    //
    // // const resp = writeCharacteristic.writeValue(encoder.encode(value));
    // // console.log("WriteMSG:", resp);
    // // resp.then(res => {console.log("WriteMSG:", res)})
    // var hex = '0808000101'
    //
    // var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    //   return parseInt(h, 16)
    // }))

    const data = postDeviceMode(BlufiParam.OP_MODE_STA, writeCharacteristic)
    console.log('Write MSG: Data = ', data)

    // return writeCharacteristic.writeValue(data);

    // const resetEnergyExpended = Uint8Array.of(1);
    // return writeCharacteristic.writeValue(resetEnergyExpended);
    // return writeCharacteristic.getDescriptors()
    //   .then(descriptors => {
    //     console.log('> Descriptors: ' +
    //       descriptors.map(c => c.uuid).join('\n' + ' '.repeat(19)));
    //   })

    // const encoder = new TextEncoder('utf-8');
    // const value = "Hello";
    // writeCharacteristic.writeValue(encoder.encode(value))

    // return gattServer.getPrimaryService(blufiServiceUUID)
    //   .then(service => service.getCharacteristic(blufiWriteCharacteristicUUID))
    //   .then(writeCharacteristic => {
    //     console.log("Write char", writeCharacteristic);
    //     setWriteCharacteristic(writeCharacteristic);
    //   })
  }

  const listServices = () => {
    if(!device || !gattServer){
      setDevice(null);
      setGattServer(null);
      console.log("Connect: No device selected");
      return "Device is not connected";
    }

    return gattServer != null && gattServer.getPrimaryService(BlufiParam.UUID_SERVICE)
      .then(service => {
        console.log(service)

        service.getCharacteristics().then(characteristics => {
          console.log('> Service: ' + service.uuid);
          characteristics.forEach(characteristic => {
            console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
                getSupportedProperties(characteristic));
          });
        })
      .catch(error => console.log("Error: ", error));
        // let queue = Promise.resolve();

        // services.forEach(service => {
        //   console.log(service);
          // queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
          //   console.log('> Service: ' + service.uuid);
          //   characteristics.forEach(characteristic => {
          //     console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
          //         getSupportedProperties(characteristic));
          //   });
          // }));
        // });
    })
  }

  const disconnect = () => {
    if(!device){
      setDevice(null);
      setGattServer(null);
      console.log("Disconnect: No device selected");
      return "Device is not connected";
    }
    if(notifyCharacteristic) {
      if(connected){
        notifyCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
      }
      setWriteCharacteristic(null);
      setNotifyCharacteristic(null);
      // notifyCharacteristic.stopNotifications()
    }
    if(connected){
      console.log("Disconnect: settings state")
      setConnected(false);
      return device.gatt.disconnect();
    }
  }

  if(gattServer != null && connected) {
    attachNotifyCharacteristics();
    attachWriteCharacteristics();
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {isBLEAvaliable()}
        <p>BLE Avaliable: {bleAvaliable ? "True" : "False"} <br /></p>
        { device &&
        <>
          <p align="left">
             Device ID: {device.id} <br />
             Device Name: {device.name} <br />
             Connected: {connected ? "True" : "False"} <br />
             Notifications: {notification} <br />
             SSID: {SSID} <br />
             Password: {password} <br />
          </p>
          <form onSubmit={() => {/*handleSubmit*/}}>
           <label>
             SSID:
             <input type="text" value={SSID} onChange={(e) => setSSID(e.target.value)} />
           </label>
           <br/>
           <label>
             Password:
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
           </label>
           <br/>
           <input disabled={!connected || !device} type="submit" value="Configure WiFi" />
          </form>
        </>
        }

        <button onClick={bleScan} disabled={!bleAvaliable || connected}>
          Select BLE Device
        </button>
        <button onClick={connect} disabled={connected || !device}>
          Connect BLE Device
        </button>
        <button onClick={listServices} disabled={!connected || !device}>
          List GATT Services
        </button>
        <button onClick={writeModeMessage} disabled={!connected || !device}>
          Write Message to BLE Device
        </button>
        <button onClick={writeConfigureMessage} disabled={!connected || !device}>
          Write SSID/Password
        </button>
        <button onClick={disconnect} disabled={!connected || !device}>
          Disconnect BLE Device
        </button>
      </header>
    </div>
  );
}

export default App;
