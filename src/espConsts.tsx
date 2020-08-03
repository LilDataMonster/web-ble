type CtrlType = {
  readonly PACKAGE_VALUE: number;
  readonly SUBTYPE_ACK: number;
  readonly SUBTYPE_SET_SEC_MODE: number;
  readonly SUBTYPE_SET_OP_MODE: number;
  readonly SUBTYPE_CONNECT_WIFI: number;
  readonly SUBTYPE_DISCONNECT_WIFI: number;
  readonly SUBTYPE_GET_WIFI_STATUS: number;
  readonly SUBTYPE_DEAUTHENTICATE: number;
  readonly SUBTYPE_GET_VERSION: number;
  readonly SUBTYPE_CLOSE_CONNECTION: number;
  readonly SUBTYPE_GET_WIFI_LIST: number;
}

type DataType = {
  readonly PACKAGE_VALUE: number;
  readonly SUBTYPE_NEG: number;
  readonly SUBTYPE_STA_WIFI_BSSID: number;
  readonly SUBTYPE_STA_WIFI_SSID: number;
  readonly SUBTYPE_STA_WIFI_PASSWORD: number;
  readonly SUBTYPE_SOFTAP_WIFI_SSID: number;
  readonly SUBTYPE_SOFTAP_WIFI_PASSWORD: number;
  readonly SUBTYPE_SOFTAP_MAX_CONNECTION_COUNT: number;
  readonly SUBTYPE_SOFTAP_AUTH_MODE: number;
  readonly SUBTYPE_SOFTAP_CHANNEL: number;
  readonly SUBTYPE_USERNAME: number;
  readonly SUBTYPE_CA_CERTIFICATION: number;
  readonly SUBTYPE_CLIENT_CERTIFICATION: number;
  readonly SUBTYPE_SERVER_CERTIFICATION: number;
  readonly SUBTYPE_CLIENT_PRIVATE_KEY: number;
  readonly SUBTYPE_SERVER_PRIVATE_KEY: number;
  readonly SUBTYPE_WIFI_CONNECTION_STATE: number;
  readonly SUBTYPE_VERSION: number;
  readonly SUBTYPE_WIFI_LIST: number;
  readonly SUBTYPE_ERROR: number;
  readonly SUBTYPE_CUSTOM_DATA: number;
}

type BlufiType = {
  readonly UUID_SERVICE: string;
  readonly UUID_WRITE_CHARACTERISTIC: string;
  readonly UUID_NOTIFICATION_CHARACTERISTIC: string;

  readonly CtrlFrame: CtrlType;
  readonly DataFrame: DataType;
  readonly DIRECTION_OUTPUT: number;
  readonly DIRECTION_INPUT: number;

  readonly OP_MODE_NULL: number;
  readonly OP_MODE_STA: number;
  readonly OP_MODE_SOFTAP: number;
  readonly OP_MODE_STASOFTAP: number;

  readonly SOFTAP_SECURITY_OPEN: number;
  readonly SOFTAP_SECURITY_WEP: number;
  readonly SOFTAP_SECURITY_WPA: number;
  readonly SOFTAP_SECURITY_WPA2: number;
  readonly SOFTAP_SECURITY_WPA_WPA2: number;

  readonly NEG_SET_SEC_TOTAL_LEN: number;
  readonly NEG_SET_SEC_ALL_DATA: number;
}

export const BlufiParam: BlufiType = {
  UUID_SERVICE: "0000ffff-0000-1000-8000-00805f9b34fb",
  UUID_WRITE_CHARACTERISTIC: "0000ff01-0000-1000-8000-00805f9b34fb",
  UUID_NOTIFICATION_CHARACTERISTIC: "0000ff02-0000-1000-8000-00805f9b34fb",

  DIRECTION_OUTPUT: 0,
  DIRECTION_INPUT: 1,

  OP_MODE_NULL: 0x00,
  OP_MODE_STA: 0x01,
  OP_MODE_SOFTAP: 0x02,
  OP_MODE_STASOFTAP: 0x03,

  SOFTAP_SECURITY_OPEN: 0x00,
  SOFTAP_SECURITY_WEP: 0x01,
  SOFTAP_SECURITY_WPA: 0x02,
  SOFTAP_SECURITY_WPA2: 0x03,
  SOFTAP_SECURITY_WPA_WPA2: 0x04,

  NEG_SET_SEC_TOTAL_LEN: 0x00,
  NEG_SET_SEC_ALL_DATA: 0x01,

  DataFrame: {
    PACKAGE_VALUE: 0x01,
    SUBTYPE_NEG: 0x00,
    SUBTYPE_STA_WIFI_BSSID: 0x01,
    SUBTYPE_STA_WIFI_SSID: 0x02,
    SUBTYPE_STA_WIFI_PASSWORD: 0x03,
    SUBTYPE_SOFTAP_WIFI_SSID: 0x04,
    SUBTYPE_SOFTAP_WIFI_PASSWORD: 0x05,
    SUBTYPE_SOFTAP_MAX_CONNECTION_COUNT: 0x06,
    SUBTYPE_SOFTAP_AUTH_MODE: 0x07,
    SUBTYPE_SOFTAP_CHANNEL: 0x08,
    SUBTYPE_USERNAME: 0x09,
    SUBTYPE_CA_CERTIFICATION: 0x0a,
    SUBTYPE_CLIENT_CERTIFICATION: 0x0b,
    SUBTYPE_SERVER_CERTIFICATION: 0x0c,
    SUBTYPE_CLIENT_PRIVATE_KEY: 0x0d,
    SUBTYPE_SERVER_PRIVATE_KEY: 0x0e,
    SUBTYPE_WIFI_CONNECTION_STATE: 0x0f,
    SUBTYPE_VERSION: 0x10,
    SUBTYPE_WIFI_LIST: 0x11,
    SUBTYPE_ERROR: 0x12,
    SUBTYPE_CUSTOM_DATA: 0x13,
  },
  CtrlFrame: {
    PACKAGE_VALUE: 0x00,
    SUBTYPE_ACK: 0x00,
    SUBTYPE_SET_SEC_MODE: 0x01,
    SUBTYPE_SET_OP_MODE: 0x02,
    SUBTYPE_CONNECT_WIFI: 0x03,
    SUBTYPE_DISCONNECT_WIFI: 0x04,
    SUBTYPE_GET_WIFI_STATUS: 0x05,
    SUBTYPE_DEAUTHENTICATE: 0x06,
    SUBTYPE_GET_VERSION: 0x07,
    SUBTYPE_CLOSE_CONNECTION: 0x08,
    SUBTYPE_GET_WIFI_LIST: 0x09,
  }
}

type FrameCtrlDataType = {
  readonly FRAME_CTRL_POSITION_ENCRYPTED: number;
  readonly FRAME_CTRL_POSITION_CHECKSUM: number;
  readonly FRAME_CTRL_POSITION_DATA_DIRECTION: number;
  readonly FRAME_CTRL_POSITION_REQUIRE_ACK: number;
  readonly FRAME_CTRL_POSITION_FRAG: number;
}

export const FrameCtrlData: FrameCtrlDataType = {
  FRAME_CTRL_POSITION_ENCRYPTED: 0,
  FRAME_CTRL_POSITION_CHECKSUM: 1,
  FRAME_CTRL_POSITION_DATA_DIRECTION: 2,
  FRAME_CTRL_POSITION_REQUIRE_ACK: 3,
  FRAME_CTRL_POSITION_FRAG: 4,
}

type BlufiClientParamType = {
  readonly mEncrypted: boolean;
  readonly mChecksum: boolean;
  readonly mRequireAck: boolean;
}

export const BlufiClientParam: BlufiClientParamType = {
  mEncrypted: false,
  mChecksum: false,
  mRequireAck: false,
}

export type BlufiConfigureParamType = {
  ssid: string;
  ssidPassword: string;
}

export default BlufiParam;
