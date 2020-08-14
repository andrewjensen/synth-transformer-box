// For Teensy 4.1

// "Bounce2", installed through the library manager
// https://github.com/thomasfredericks/Bounce2
#include <Bounce2.h>

// From the Teensy libraries
#include <MIDI.h>
#include <EEPROM.h>

// From this project
#include "constants.h"
#include "Settings.h"
#include "SegmentDisplay.h"

#define PIN_BUTTON 3
#define PIN_LED 13
#define PIN_DISPLAY_A 14
#define PIN_DISPLAY_B 15
#define PIN_DISPLAY_C 16
#define PIN_DISPLAY_D 17
#define PIN_DISPLAY_E 18
#define PIN_DISPLAY_F 19
#define PIN_DISPLAY_G 20

SegmentDisplay display = SegmentDisplay(
  PIN_DISPLAY_A,
  PIN_DISPLAY_B,
  PIN_DISPLAY_C,
  PIN_DISPLAY_D,
  PIN_DISPLAY_E,
  PIN_DISPLAY_F,
  PIN_DISPLAY_G
);

MIDI_CREATE_INSTANCE(HardwareSerial, Serial1, MIDI);

Settings settings;
Bounce buttonDebouncer = Bounce();
ProgramStatus programStatus = ProgramStatus::Initializing;

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

    // Serial.println("EEPROM contents:");
    // for (int address = 0; address < 100; address++) {
    //   Serial.println(EEPROM.read(address));
    // }
    // Serial.println("...");

    Serial.println("Initializing from memory...");
  }

  bool success = settings.initializeFromMemory();

  if (success) {
    programStatus = ProgramStatus::Running;
    if (DEBUG_SERIAL) {
      Serial.println("Successfully initialized.");
      Serial.println("Current settings state in memory:");
      settings.printState();
    }
    display.flashDigit(settings.getPresetCount());
    display.showDigit(settings.getCurrentPresetId());
  } else {
    programStatus = ProgramStatus::FatalError;
    if (DEBUG_SERIAL) {
      Serial.println("ERROR DURING INITIALIZATION!");
    }
  }
}

void loop() {
  switch (programStatus) {
    case ProgramStatus::Running:
      loopRunning();
      return;
    case ProgramStatus::FatalError:
    default:
      loopFatalError();
      return;
  }
}

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

    display.showDigit(presetId);

    if (DEBUG_SERIAL) {
      Serial.print("Switched to preset ");
      Serial.println(presetId);
    }
  }

  if (Serial.available()) {
    handleSerialCommand();
  }
}

// Handling commands over serial

void handleSerialCommand() {
  lightOn();

  byte commandId = Serial.read();

  if (commandId == COMMAND_ID_SAVE_SETTINGS_V1) {
    handleSaveSettingsCommand();
  } else if (commandId == COMMAND_ID_REQUEST_LOAD_SETTINGS_V1) {
    handleRequestLoadSettingsCommand();
  }

  lightOff();
}

void handleSaveSettingsCommand() {
  // Read the settings data and save it into EEPROM
  int address = 0;
  EEPROM.write(address, PROTOCOL_VERSION);
  address++;
  while (Serial.available()) {
    byte received = Serial.read();
    EEPROM.write(address, received);
    address++;
  }
  storeTerminatingSignal(address);

  settings.initializeFromMemory();

  display.flashDigit(settings.getPresetCount());
  display.showDigit(settings.getCurrentPresetId());

  sendSaveSettingsSuccessful();
}

void handleRequestLoadSettingsCommand() {
  Serial.write(COMMAND_ID_LOAD_SETTINGS_V1);

  // TODO: check stored protocol version first

  int address = 1;
  int nullBytes = 0;

  // Stop when we see four null bytes in a row
  while (nullBytes < 4 && address < 1000) {
    byte storedByte = EEPROM.read(address);
    Serial.write(storedByte);
    address++;

    if (storedByte == 0x00) {
      nullBytes++;
    } else {
      nullBytes = 0;
    }
  }
}

void sendSaveSettingsSuccessful() {
  Serial.write(COMMAND_ID_SAVE_SETTINGS_SUCCESSFUL_V1);
}

void storeTerminatingSignal(int address) {
  for (int i = 0; i < 4; i++) {
    EEPROM.write(address + i, 0x00);
  }
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

// GPIO helpers

void flash() {
  lightOn();
  delay(100);
  lightOff();
}

void lightOn() {
  digitalWrite(PIN_LED, HIGH);
}

void lightOff() {
  digitalWrite(PIN_LED, LOW);
}
