// For Teensy 4.0

// "Bounce2", installed through the library manager
// https://github.com/thomasfredericks/Bounce2
#include <Bounce2.h>

// From the Teensy libraries
#include <MIDI.h>
#include <EEPROM.h>

// From this project
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
const int MIDI_OUTPUT_CHANNEL = 1;

Settings settings;
Bounce buttonDebouncer = Bounce();

int displayedDigit = 0;

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

  display.showDigit(displayedDigit);
}

void loop() {
  usbMIDI.read();

  buttonDebouncer.update();

  if (buttonDebouncer.fell()) {
    Serial.println("You pressed the button!");

    displayedDigit = (displayedDigit + 1) % 10;
    display.showDigit(displayedDigit);
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
  MIDI.sendNoteOn(note, velocity, MIDI_OUTPUT_CHANNEL);

  lightOn();
}

void onNoteOff(byte channel, byte note, byte velocity) {
  MIDI.sendNoteOff(note, velocity, MIDI_OUTPUT_CHANNEL);

  lightOff();
}

void onControlChange(byte channel, byte inputCC, byte value) {
  // Serial.print("Received CC ");
  // Serial.print(inputCC);
  // Serial.print(", value ");
  // Serial.println(value);

  byte outputCC = settings.translateCC(inputCC);

  MIDI.sendControlChange(outputCC, value, MIDI_OUTPUT_CHANNEL);
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
