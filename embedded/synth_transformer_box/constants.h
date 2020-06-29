#ifndef constants_h
#define constants_h

const byte PROTOCOL_VERSION = 0x01;
const byte COMMAND_ID_SAVE_SETTINGS_V1 = 0x10;
const byte COMMAND_ID_SAVE_SETTINGS_SUCCESSFUL_V1 = 0x11;
const byte COMMAND_ID_REQUEST_LOAD_SETTINGS_V1 = 0x20;
const byte COMMAND_ID_LOAD_SETTINGS_V1 = 0x21;

const bool DEBUG_SERIAL = false;

#endif
