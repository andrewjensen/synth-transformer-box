// From the Teensy libraries
#include "Arduino.h"
#include <MIDI.h>
#include <EEPROM.h>

// From the library manager
#include <ArduinoJson.h>
#include <Bounce2.h>

// From this project
#include "constants.h"
#include "Screen.h"
#include "Settings.h"

#define PIN_BUTTON 4
#define PIN_LED 13

#define PIN_LCD_RS 33
#define PIN_LCD_EN 34
#define PIN_LCD_D4 36
#define PIN_LCD_D5 37
#define PIN_LCD_D6 38
#define PIN_LCD_D7 39

#define STATUS_MESSAGE_TIME_MS 2000

Screen screen = Screen(
  PIN_LCD_RS,
  PIN_LCD_EN,

  PIN_LCD_D4,
  PIN_LCD_D5,
  PIN_LCD_D6,
  PIN_LCD_D7
);

MIDI_CREATE_INSTANCE(HardwareSerial, Serial1, MIDI);

Settings settings;
Bounce buttonDebouncer = Bounce();
ProgramStatus programStatus = ProgramStatus::Initializing;

// GPIO helpers

void lightOn() {
  digitalWrite(PIN_LED, HIGH);
}

void lightOff() {
  digitalWrite(PIN_LED, LOW);
}

void flash() {
  lightOn();
  delay(100);
  lightOff();
}

// MIDI

void onNoteOn(byte channel, byte note, byte velocity) {
  byte outputChannel = settings.getChannel();
  MIDI.sendNoteOn(note, velocity, outputChannel);

  lightOn();
}

void onNoteOff(byte channel, byte note, byte velocity) {
  byte outputChannel = settings.getChannel();
  MIDI.sendNoteOff(note, velocity, outputChannel);

  lightOff();
}

void onControlChange(byte channel, byte inputCC, byte value) {
  // Serial.print("Received CC ");
  // Serial.print(inputCC);
  // Serial.print(", value ");
  // Serial.println(value);

  byte outputChannel = settings.getChannel();
  byte outputCC = settings.translateCC(inputCC);

  MIDI.sendControlChange(outputCC, value, outputChannel);
}

// Handling commands over serial

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

  settings.initializeFromMemory();

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
  lightOn();

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

  lightOff();
}

// Main loops

void loopFatalError() {
  flash();
  delay(100);
  flash();
  delay(100);
  flash();
  delay(800);
}

void loopRunning() {
  usbMIDI.read();

  buttonDebouncer.update();

  if (buttonDebouncer.fell()) {
    settings.triggerNextPreset();

    byte presetId = settings.getCurrentPresetId();
    screen.printPreset(presetId, settings.getCurrentSynthName());
    if (DEBUG_SERIAL) {
      Serial.print("Switched to preset ");
      Serial.println(presetId);
    }
  }

  if (Serial.available()) {
    handleSerialCommand();
  }
}

void loopNoSettings() {
  if (Serial.available()) {
    handleSerialCommand();
  }
  delay(250);
}

// Teensy lifecycle functions

void setup() {
  Serial.begin(9600);

  pinMode(PIN_LED, OUTPUT);

  pinMode(PIN_BUTTON, INPUT_PULLUP);

  buttonDebouncer.attach(PIN_BUTTON);
  buttonDebouncer.interval(25); // interval in ms

  usbMIDI.setHandleNoteOn(onNoteOn);
  usbMIDI.setHandleNoteOff(onNoteOff);
  usbMIDI.setHandleControlChange(onControlChange);

  MIDI.begin();

  // Wait for the serial monitor during development
  delay(100);

  if (DEBUG_SERIAL) {
    Serial.println("Starting up!");

    Serial.println("EEPROM contents:");
    for (int address = 0; address < 100; address++) {
      Serial.println(EEPROM.read(address));
    }
    Serial.println("...");

    Serial.println("Initializing from memory...");
  }

  int initResult = settings.initializeFromMemory();

  switch (initResult) {
    case InitSettingsResult::Success: {
      programStatus = ProgramStatus::Running;
      if (DEBUG_SERIAL) {
        Serial.println("Successfully initialized.");
        Serial.println("Current settings state in memory:");
        settings.printState();
      }

      int presetCount = settings.getPresetCount();
      screen.printInitialized(presetCount);
      delay(STATUS_MESSAGE_TIME_MS);

      screen.printPreset(settings.getCurrentPresetId(), settings.getCurrentSynthName());
      return;
    }
    case InitSettingsResult::MemoryBlank: {
      programStatus = ProgramStatus::NoSettings;
      if (DEBUG_SERIAL) {
        Serial.println("Memory is blank - no settings!");
      }
      return;
    }
    case InitSettingsResult::Error:
    default: {
      programStatus = ProgramStatus::FatalError;
      if (DEBUG_SERIAL) {
        Serial.println("ERROR DURING INITIALIZATION!");
      }
      return;
    }
  }
}

void loop() {
  switch (programStatus) {
    case ProgramStatus::Running:
      loopRunning();
      return;
    case ProgramStatus::NoSettings:
      loopNoSettings();
      return;
    case ProgramStatus::FatalError:
    default:
      loopFatalError();
      return;
  }
}
