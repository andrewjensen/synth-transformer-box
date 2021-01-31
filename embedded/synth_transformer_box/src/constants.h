#ifndef constants_h
#define constants_h

const byte PROTOCOL_VERSION = 0x01;
const byte MESSAGE_ID_SAVE_SETTINGS_V1 = 0x10;
const byte MESSAGE_ID_SAVE_SETTINGS_SUCCESSFUL_V1 = 0x11;
const byte MESSAGE_ID_REQUEST_LOAD_SETTINGS_V1 = 0x20;
const byte MESSAGE_ID_LOAD_SETTINGS_V1 = 0x21;
const byte MESSAGE_ID_COMMIT_SETTINGS_V1 = 0x30;
const byte MESSAGE_ID_COMMIT_SETTINGS_SUCCESSFUL_V1 = 0x31;

const bool DEBUG_SERIAL = false;

// TODO: figure out needed capacity
const int DOCUMENT_ALLOC_SIZE_FULL = 8192;
const int DOCUMENT_ALLOC_SIZE_ID_ONLY = 128;

enum ProgramStatus {
  Initializing = 1,
  FatalError = 2,
  Running = 3,
  NoSettings = 4,
};

#endif
