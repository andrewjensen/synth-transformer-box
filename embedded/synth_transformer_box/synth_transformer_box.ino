// For Teensy 4.0

// "Bounce2", installed through the library manager
// https://github.com/thomasfredericks/Bounce2
#include <Bounce2.h>

// From the Teensy libraries
#include <MIDI.h>
#include <EEPROM.h>

// From this project
#include "Settings.h"

#define PIN_BUTTON 20
#define PIN_LED 13

MIDI_CREATE_INSTANCE(HardwareSerial, Serial1, MIDI);
const int MIDI_OUTPUT_CHANNEL = 1;

Settings settings;
Bounce buttonDebouncer = Bounce();

bool transpose = false;

void setup() {
  Serial.begin(9600);

  pinMode(PIN_LED, OUTPUT);

  pinMode(PIN_BUTTON, INPUT_PULLUP);

  buttonDebouncer.attach(PIN_BUTTON);
  buttonDebouncer.interval(25); // interval in ms

  usbMIDI.setHandleNoteOn(onNoteOn);
  usbMIDI.setHandleNoteOff(onNoteOff);

  MIDI.begin();

  Serial.println("Starting up!");

  // Serial.println("EEPROM contents:");
  // for (int address = 0; address < 100; address++) {
  //   Serial.println(EEPROM.read(address));
  // }
  // Serial.println("...");

  Serial.println("Initializing from memory...");
  bool success = settings.initializeFromMemory();
  if (success) {
    Serial.println("Successfully initialized.");
  } else {
    Serial.println("ERROR DURING INITIALIZATION!");
  }

  Serial.println("Current settings state in memory:");
  settings.printState();
}

void loop() {
  usbMIDI.read();

  buttonDebouncer.update();

  if (buttonDebouncer.fell()) {
    Serial.println("You pressed the button!");
    transpose = !transpose;
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

  settings.initializeFromMemory();

  sendSaveSettingsSuccessful();
}

void sendSaveSettingsSuccessful() {
  Serial.print(COMMAND_ID_SAVE_SETTINGS_SUCCESSFUL_V1);
}

// MIDI

void onNoteOn(byte channel, byte note, byte velocity) {
  byte outputNote = transpose ? note + 5 : note;
  MIDI.sendNoteOn(outputNote, velocity, MIDI_OUTPUT_CHANNEL);

  lightOn();
}

void onNoteOff(byte channel, byte note, byte velocity) {
  byte outputNote = transpose ? note + 5 : note;
  MIDI.sendNoteOff(outputNote, velocity, MIDI_OUTPUT_CHANNEL);

  lightOff();
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
