// From the Teensy libraries
#include "Arduino.h"
#include <MIDI.h>
#include <EEPROM.h>

// From the library manager
#include <ArduinoJson.h>
#include <Bounce2.h>

// From this project
#include "constants.h"
#include "state.h"
#include "serial_messages.h"

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

void onPitchBend(byte channel, int pitch) {
  MIDI.sendPitchBend(pitch, channel);
}

void onProgramChange(byte channel, byte program) {
  MIDI.sendProgramChange(program, channel);
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
  usbMIDI.setHandlePitchChange(onPitchBend);
  usbMIDI.setHandleProgramChange(onProgramChange);

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

  int initResult = settings.initializeFromEEPROM();

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
