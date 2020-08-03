import BlufiParam, { FrameCtrlData, BlufiClientParam, BlufiConfigureParamType } from './espConsts';

export const stringToHex = (str: string) => {
  //converting string into buffer
  const bufStr = Buffer.from(str, 'utf8');

  //with buffer, you can convert it into hex with following code
  return bufStr.toString('hex');
}

const uint8ArrayToHex = (arr: Uint8Array) => {
  return Buffer.from(arr).toString('hex');
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getPackageType = (typeValue: number) => typeValue & 0b11;
export const getTypeValue = (type: number, subtype: number) => (subtype << 2) | type;
export const getSubType = (typeValue: number) => ((typeValue & 0b11111100) >> 2);

const mutexBuffer = new SharedArrayBuffer(32);
const mutex = new Int32Array(mutexBuffer);

const gattWrite = (data: Uint8Array, writeCharacteristic: any) => {
  writeCharacteristic.writeValue(data);
}

export const postDeviceMode = (opMode: number, writeCharacteristic: any) => {
  const type = getTypeValue(BlufiParam.CtrlFrame.PACKAGE_VALUE, BlufiParam.CtrlFrame.SUBTYPE_SET_OP_MODE);
  const data = [opMode];

  const dataBufferView = new Uint8Array(data);
  return post(BlufiClientParam.mEncrypted, BlufiClientParam.mChecksum, true, type, dataBufferView, writeCharacteristic);
}

export const postStaWifiInfo = async (params: BlufiConfigureParamType, writeCharacteristic: any) => {
  const encoder = new TextEncoder();
  const ssidBytes = encoder.encode(params.ssid);
  const passwordBytes = encoder.encode(params.ssidPassword);
  // console.log(uint8ArrayToHex(ssidBytes));
  // console.log(uint8ArrayToHex(passwordBytes));

  /*
    int ssidType = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_STA_WIFI_SSID);
  */
  console.log("Sending SSID")
  const ssidType = getTypeValue(BlufiParam.DataFrame.PACKAGE_VALUE, BlufiParam.DataFrame.SUBTYPE_STA_WIFI_SSID);
  post(BlufiClientParam.mEncrypted, BlufiClientParam.mChecksum, BlufiClientParam.mRequireAck, ssidType, ssidBytes, writeCharacteristic);

  await sleep(1000);

  /*
    int pwdType = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_STA_WIFI_PASSWORD);
  */
  console.log("Sending Password")
  const pwdType = getTypeValue(BlufiParam.DataFrame.PACKAGE_VALUE, BlufiParam.DataFrame.SUBTYPE_STA_WIFI_PASSWORD);
  post(BlufiClientParam.mEncrypted, BlufiClientParam.mChecksum, BlufiClientParam.mRequireAck, pwdType, passwordBytes, writeCharacteristic);

  await sleep(1000);

  /*
    int comfirmType = getTypeValue(Type.Ctrl.PACKAGE_VALUE, Type.Ctrl.SUBTYPE_CONNECT_WIFI);
    return post(false, false, mRequireAck, comfirmType, (byte[]) null);
  */
  console.log("Sending Confirm")
  const confirmType = getTypeValue(BlufiParam.CtrlFrame.PACKAGE_VALUE, BlufiParam.CtrlFrame.SUBTYPE_CONNECT_WIFI);
  post(false, false, BlufiClientParam.mRequireAck, confirmType, new Uint8Array(), writeCharacteristic);

  // atomicSendValue = 0;
}

export const post = (encrypt: boolean, checksum: boolean, requireAck: boolean, type: number, data: Uint8Array, writeCharacteristic: any) => {
  console.log("POST WriteChar: ", writeCharacteristic)
  if(data.length === 0){
    console.log('Running postNonData')
    return postNonData(encrypt, checksum, requireAck, type, writeCharacteristic);
  } else {
    console.log('Running postContainData')
    return postContainData(encrypt, checksum, requireAck, type, data, writeCharacteristic);
  }
}

let atomicSendValue = 0;
const generateSendSequence = () => {
  return atomicSendValue++ & 0xff;
}

export const postNonData = async (encrypt: boolean, checksum: boolean, requireAck: boolean, type: number, writeCharacteristic: any) => {
  /*
    int frameCtrl = FrameCtrlData.getFrameCTRLValue(encrypt, checksum, DIRECTION_OUTPUT, requireAck, false);
    int sequence = generateSendSequence();
    int dataLen = 0;
  */
  const frameCtrl = getFrameCTRLValue(encrypt, checksum, BlufiParam.DIRECTION_OUTPUT, requireAck, false);
  const sequence = generateSendSequence();
  const dataLen = 0;
  /*
    byte[] postBytes = getPostBytes(type, frameCtrl, sequence, dataLen, null);
    LOGGER.log(Level.INFO, "Writing Bytes: " + toHex(postBytes));
    gattWrite(postBytes);
  */
  let postBytes = getPostBytes(type, frameCtrl, sequence, dataLen, new Uint8Array());
  gattWrite(postBytes, writeCharacteristic);
}

const DEFAULT_PACKAGE_LENGTH: number = 20;
const PACKAGE_HEADER_LENGTH: number = 4;
const MIN_PACKAGE_LENGTH: number = 7;
export const postContainData = async (encrypt: boolean, checksum: boolean, requireAck: boolean, type: number, data: Uint8Array, writeCharacteristic: any) => {
  const pkgLengthLimit = DEFAULT_PACKAGE_LENGTH;
  var postDataLengthLimit = pkgLengthLimit - PACKAGE_HEADER_LENGTH;
  postDataLengthLimit -= 2; // if flag, two bytes total length in data
  if (checksum) {
      postDataLengthLimit -= 2;
  }
  let byteInputStream = new ArrayBuffer(data.length);
  let byteInputStreamView = new Uint8Array(byteInputStream);

  // TODO: verify fixed max byte size to set for output buffer
  let byteOutputStream = new ArrayBuffer(32);
  let byteOutputStreamView = new Uint8Array(byteOutputStream);

  let dateBuf = new ArrayBuffer(postDataLengthLimit);
  let dateBufView = new Uint8Array(dateBuf);

  let totalInputStreamBytesRead = 0;
  let totalOutputStreamBytesWritten = 0;

  // initialize byteInputStream
  for(let i=0; i < data.length; i++){
    byteInputStreamView[i] = data[i];
  }
  while(true){
    /*
      int read = dataIS.read(dateBuf, 0, dateBuf.length);
      if (read == -1) {
          break;
      }
    */
    let bytesRead = 0;
    let bytesWritten = 0;
    for(let i=0; i < dateBufView.length; i++){
      if(totalInputStreamBytesRead + i < byteInputStreamView.length){
        dateBufView[i] = byteInputStreamView[totalInputStreamBytesRead + i];
        bytesRead += 1;
      }
    }
    totalInputStreamBytesRead += bytesRead;
    if(bytesRead === 0){
      break;
    }

    /* postOS.write(dateBuf, 0, read); */
    for(let i=0; i < bytesRead; i++){
      byteOutputStreamView[i] = dateBufView[i];
    }
    bytesWritten += bytesRead;

    /*
      postOS.write(dateBuf, 0, read);
      if (dataIS.available() == 2) {
          postOS.write(dataIS.read());
          postOS.write(dataIS.read());
      }
    */
    const dataISavaliable = totalInputStreamBytesRead - byteInputStreamView.length;
    if(dataISavaliable === 2){
      byteOutputStreamView[bytesRead] = byteInputStreamView[totalInputStreamBytesRead];
      byteOutputStreamView[bytesRead+1] = byteInputStreamView[totalInputStreamBytesRead+1];
      totalInputStreamBytesRead += 2;
      bytesWritten += 2;
    }

    /*
      boolean frag = dataIS.available() > 0;
      int frameCtrl = FrameCtrlData.getFrameCTRLValue(encrypt, checksum, DIRECTION_OUTPUT, requireAck, frag);
      int sequence = generateSendSequence();
    */
    const frag = (totalInputStreamBytesRead - byteInputStreamView.length) > 0;
    console.log('encrypt: ', encrypt)
    console.log('checksum: ', checksum)
    console.log('requireAck: ', requireAck)
    console.log('frag: ', frag)
    const frameCtrl = getFrameCTRLValue(encrypt, checksum, BlufiParam.DIRECTION_OUTPUT, requireAck, frag);
    const sequence = generateSendSequence();

    /*
      if (frag) {
          int totalLen = postOS.size() + dataIS.available();
          byte[] tempData = postOS.toByteArray();
          postOS.reset();
          postOS.write(totalLen & 0xff);
          postOS.write(totalLen >> 8 & 0xff);
          postOS.write(tempData, 0, tempData.length);
      }
    */
    if(frag){
      const totalLen = totalOutputStreamBytesWritten + (totalInputStreamBytesRead - byteInputStreamView.length);

      let tempData = new ArrayBuffer(bytesWritten);
      let tempDataView = new Uint8Array(byteOutputStream);
      for(let i=0; i < tempDataView.length; i++){
        tempDataView[i] = byteOutputStreamView[i];
      }

      // reset
      byteOutputStream = new ArrayBuffer(byteOutputStreamView.length);
      byteOutputStreamView = new Uint8Array(byteOutputStream);
      // write
      byteOutputStreamView[0] = totalLen & 0xff;
      byteOutputStreamView[1] = totalLen >> 8 & 0xff;
      for(let i=0; i < tempDataView.length; i++){
        byteOutputStreamView[2 + i] = tempDataView[i];
      }
      bytesWritten = 2 + tempDataView.length;
    }
    console.log('post: ', byteOutputStream);
    console.log('type: ', type)
    console.log('frameCtrl: ', frameCtrl)
    console.log('sequence: ', sequence)
    console.log('bytesWritten: ', bytesWritten)
    console.log('byteOutputStreamView: ', byteOutputStreamView)
    /*
      byte[] postBytes = getPostBytes(type, frameCtrl, sequence, postOS.size(), postOS.toByteArray());
      postOS.reset();
    */
    let postBytes = getPostBytes(type, frameCtrl, sequence, bytesWritten, byteOutputStreamView);
    console.log('Post Bytes: ', uint8ArrayToHex(postBytes))
    console.log('Valid Buffer Size: ', postBytes.length)

    gattWrite(postBytes, writeCharacteristic);
    // sleep here since this is in a while loop 
    await sleep(1000);

    // return postBytes;
  }
}

// private byte[] getPostBytes(int type, int frameCtrl, int sequence, int dataLength, byte[] data)
const getPostBytes = (type: number, frameCtrl: number, sequence: number, dataLength: number, data: Uint8Array) => {
  /*
    ByteArrayOutputStream byteOS = new ByteArrayOutputStream();
    byteOS.write(type);
    byteOS.write(frameCtrl);
    byteOS.write(sequence);
    byteOS.write(dataLength);
  */
  let byteOutputStream = new ArrayBuffer(32);
  let byteOutputStreamView = new Uint8Array(byteOutputStream);
  byteOutputStreamView[0] = type;
  byteOutputStreamView[1] = frameCtrl;
  byteOutputStreamView[2] = sequence;
  byteOutputStreamView[3] = dataLength;
  let bytesWritten = 4;

  /*
    FrameCtrlData frameCtrlData = new FrameCtrlData(frameCtrl);
    byte[] checksumBytes = null;
    if (frameCtrlData.isChecksum()) {
        byte[] willCheckBytes = new byte[]{(byte) sequence, (byte) dataLength};
        if (data != null) {
            ByteArrayOutputStream os = new ByteArrayOutputStream(willCheckBytes.length + data.length);
            os.write(willCheckBytes, 0, willCheckBytes.length);
            os.write(data, 0, data.length);
            willCheckBytes = os.toByteArray();
        }
        int checksum = BlufiCRC.calcCRC(0, willCheckBytes);
        byte checksumByte1 = (byte) (checksum & 0xff);
        byte checksumByte2 = (byte) ((checksum >> 8) & 0xff);
        checksumBytes = new byte[]{checksumByte1, checksumByte2};
    }
  */
  let frameCtrlData = frameCtrl;
  let checksumBytes = new ArrayBuffer(32);
  let checksumBytesView = new Uint8Array(checksumBytes);
  let checksumBytesWritten = 0;
  if(frameCtrlisChecksum(frameCtrlData)){
    // TODO
  }

  /*
    if (frameCtrlData.isEncrypted() && data != null) {
        BlufiAES aes = new BlufiAES(mAESKey, AES_TRANSFORMATION, generateAESIV(sequence));
        data = aes.encrypt(data);
    }
  */
  if(frameCtrlisEncrypted(frameCtrlData) && data.length != 0){
    // TODO
  }

  /*
    if (data != null) {
        byteOS.write(data, 0, data.length);
    }
  */
  if(data.length != 0){
    for(let i=0; i < dataLength; i++){
      byteOutputStreamView[bytesWritten + i] = data[i];
    }
    bytesWritten += dataLength;
  }

  /*
    if (checksumBytes != null) {
        byteOS.write(checksumBytes[0]);
        byteOS.write(checksumBytes[1]);
    }
  */
  if(checksumBytesWritten != 0){
    byteOutputStreamView[bytesWritten++] = checksumBytesView[0];
    byteOutputStreamView[bytesWritten++] = checksumBytesView[1];
  }

  // create output array buffer with appropriate size
  let returnByteOutputStream = new ArrayBuffer(bytesWritten);
  let returnByteOutputStreamView = new Uint8Array(returnByteOutputStream);
  for(let i=0; i < bytesWritten; i++){
    returnByteOutputStreamView[i] = byteOutputStreamView[i];
  }
  /*
    return byteOS.toByteArray();
  */
  return returnByteOutputStreamView;

}


/* FrameCtrl functions */
const frameCtrlCheck = (value: number, position: number) => {
  return ((value >> position) & 1) == 1;
}

const frameCtrlisEncrypted = (value: number) => {
  return frameCtrlCheck(value, FrameCtrlData.FRAME_CTRL_POSITION_ENCRYPTED);
}

const frameCtrlisChecksum = (value: number) => {
  return frameCtrlCheck(value, FrameCtrlData.FRAME_CTRL_POSITION_CHECKSUM);
}

const frameCtrlrequireAck = (value: number) => {
  return frameCtrlCheck(value, FrameCtrlData.FRAME_CTRL_POSITION_REQUIRE_ACK);
}

const frameCtrlhasFrag = (value: number) => {
  return frameCtrlCheck(value, FrameCtrlData.FRAME_CTRL_POSITION_FRAG);
}

export const getFrameCTRLValue = (encrypted: boolean, checksum: boolean, direction: number, requireAck: boolean, frag: boolean) => {
  let frame = 0;
  if(encrypted){
    frame = frame | (1 << FrameCtrlData.FRAME_CTRL_POSITION_ENCRYPTED);
  }
  if(checksum){
    frame = frame | (1 << FrameCtrlData.FRAME_CTRL_POSITION_CHECKSUM);
  }
  if(direction === BlufiParam.DIRECTION_INPUT){
    frame = frame | (1 << FrameCtrlData.FRAME_CTRL_POSITION_DATA_DIRECTION);
  }
  if(requireAck){
    frame = frame | (1 << FrameCtrlData.FRAME_CTRL_POSITION_REQUIRE_ACK);
  }
  if(frag){
    frame = frame | (1 << FrameCtrlData.FRAME_CTRL_POSITION_FRAG);
  }
  return frame;
}
