#ifndef serial_messages_h
#define serial_messages_h

#include "Screen.h"
#include "Settings.h"
#include "state.h"

void storeTerminatingSignal(int address) {
  for (int i = 0; i < 4; i++) {
    EEPROM.write(address + i, 0x00);
  }
}

void sendSaveSettingsSuccessful() {
  DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_ID_ONLY);
  doc["msg"] = MESSAGE_ID_SAVE_SETTINGS_SUCCESSFUL_V1;

  serializeJson(doc, Serial);
}

void handleSaveSettingsCommand(DynamicJsonDocument doc) {
  // re-serialize the JSON so we can save it
  std::string output;
  serializeJson(doc, output);

  // Save the settings data into EEPROM
  int address = 0;
  EEPROM.write(address, PROTOCOL_VERSION);
  address++;
  for (std::string::size_type i = 0; i < output.size(); i++) {
    EEPROM.write(address, output[i]);
    address++;
  }
  storeTerminatingSignal(address);

  settings.initializeFromEEPROM();

  sendSaveSettingsSuccessful();

  screen.printSettingsSaved(settings.getPresetCount());
  delay(STATUS_MESSAGE_TIME_MS);

  screen.printPreset(settings.getCurrentPresetId(), settings.getCurrentSynthName());
}

void sendSendSettingsSuccessful() {
  DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_ID_ONLY);
  doc["msg"] = MESSAGE_ID_SEND_SETTINGS_SUCCESSFUL_V1;

  serializeJson(doc, Serial);
}

void handleSendSettingsCommand(DynamicJsonDocument doc) {
  // TODO: implement
  sendSendSettingsSuccessful();
}

void handleRequestLoadSettingsCommand() {
  DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_FULL);

  bool readJsonSuccessful = settings.readJsonFromMemory(doc);
  if (!readJsonSuccessful) {
    programStatus = ProgramStatus::FatalError;
    return;
  }

  doc["msg"] = MESSAGE_ID_LOAD_SETTINGS_V1;

  serializeJson(doc, Serial);
}

void sendCommitSettingsSuccessful() {
  DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_ID_ONLY);
  doc["msg"] = MESSAGE_ID_COMMIT_SETTINGS_SUCCESSFUL_V1;

  serializeJson(doc, Serial);
}

void handleCommitSettingsCommand() {
  // TODO: Implement
  sendCommitSettingsSuccessful();
}

void handleSerialCommand() {
  digitalWrite(PIN_LED, HIGH);

  DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_FULL);

  DeserializationError err = deserializeJson(doc, Serial);

  if (err) {
    // Error deserializing
    // err.c_str();

    programStatus = ProgramStatus::FatalError;
    return;
  }

  byte messageId = doc["msg"];
  switch (messageId) {
    case MESSAGE_ID_SAVE_SETTINGS_V1:
      handleSaveSettingsCommand(doc);
      break;
    case MESSAGE_ID_SEND_SETTINGS_V1:
      handleSendSettingsCommand(doc);
      break;
    case MESSAGE_ID_REQUEST_LOAD_SETTINGS_V1:
      handleRequestLoadSettingsCommand();
      break;
    case MESSAGE_ID_COMMIT_SETTINGS_V1:
      handleCommitSettingsCommand();
      break;
    default:
      // Unknown command!
      programStatus = ProgramStatus::FatalError;
      break;
  }

  digitalWrite(PIN_LED, LOW);
}

#endif
