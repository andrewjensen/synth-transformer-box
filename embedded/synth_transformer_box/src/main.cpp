// From the Teensy libraries
#include "Arduino.h"
#include <MIDI.h>
#include <EEPROM.h>

// From the library manager
#include <Bounce2.h>
#include <Wire.h>
#include <LiquidCrystal.h>

// From this project
#include "constants.h"
#include "Settings.h"

#define PIN_BUTTON 3
#define PIN_LED 13

#define PIN_LCD_RS 33
#define PIN_LCD_EN 34
#define PIN_LCD_D4 36
#define PIN_LCD_D5 37
#define PIN_LCD_D6 38
#define PIN_LCD_D7 39

LiquidCrystal lcd = LiquidCrystal(
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
  Serial.write(COMMAND_ID_SAVE_SETTINGS_SUCCESSFUL_V1);
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

  // FIXME: flash a saved message with preset count: settings.getPresetCount()
  // FIXME: show the current preset

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

    // FIXME: show the current preset on the screen

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

  lcd.begin(16, 2);

  // FIXME: remove debugging
  lcd.home();
  lcd.print("Hello");
  lcd.setCursor(0, 1);
  lcd.print("World");

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
    case InitSettingsResult::Success:
      programStatus = ProgramStatus::Running;
      if (DEBUG_SERIAL) {
        Serial.println("Successfully initialized.");
        Serial.println("Current settings state in memory:");
        settings.printState();
      }
      // FIXME: flash initialization message
      // FIXME: show current preset
      return;
    case InitSettingsResult::MemoryBlank:
      programStatus = ProgramStatus::NoSettings;
      if (DEBUG_SERIAL) {
        Serial.println("Memory is blank - no settings!");
      }
      return;
    case InitSettingsResult::Error:
    default:
      programStatus = ProgramStatus::FatalError;
      if (DEBUG_SERIAL) {
        Serial.println("ERROR DURING INITIALIZATION!");
      }
      return;
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
