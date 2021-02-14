#ifndef serial_messages_h
#define serial_messages_h

#include "Screen.h"
#include "Settings.h"
#include "state.h"

void sendSendSettingsSuccessful() {
  DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_ID_ONLY);
  doc["msg"] = MESSAGE_ID_SEND_SETTINGS_SUCCESSFUL_V1;

  serializeJson(doc, Serial);
}

void handleSendSettingsCommand(DynamicJsonDocument doc) {
  InitSettingsResult result = settings.initializeFromDoc(doc);
  if (result == InitSettingsResult::Success) {
    sendSendSettingsSuccessful();

    screen.printPreset(settings.getCurrentPresetId(), settings.getCurrentSynthName());
  } else {
    programStatus = ProgramStatus::FatalError;
  }
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
  bool saveSuccessful = settings.saveToEEPROM();
  if (saveSuccessful) {
    sendCommitSettingsSuccessful();

    screen.printSettingsSaved(settings.getPresetCount());
    delay(STATUS_MESSAGE_TIME_MS);

    screen.printPreset(settings.getCurrentPresetId(), settings.getCurrentSynthName());
  } else {
    programStatus = ProgramStatus::FatalError;
  }
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
