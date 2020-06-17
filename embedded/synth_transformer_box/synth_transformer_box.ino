// For Teensy 4.0

// "Bounce2", installed through the library manager
// https://github.com/thomasfredericks/Bounce2
#include <Bounce2.h>

// From the Teensy libraries
#include <MIDI.h>
#include <EEPROM.h>

#define PIN_BUTTON 20
#define PIN_LED 13

const byte PROTOCOL_VERSION = 0x01;
const byte COMMAND_ID_SAVE_SETTINGS_V1 = 0x10;
const byte COMMAND_ID_SAVE_SETTINGS_SUCCESSFUL_V1 = 0x11;

MIDI_CREATE_INSTANCE(HardwareSerial, Serial1, MIDI);
const int MIDI_OUTPUT_CHANNEL = 1;

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
  bool success = initializeFromMemory();
  if (success) {
    Serial.println("Successfully initialized.");
  } else {
    Serial.println("ERROR DURING INITIALIZATION!");
  }
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

bool initializeFromMemory() {
  int address = 0;

  byte version_number = EEPROM.read(address);
  address++;
  if (version_number != PROTOCOL_VERSION) {
    Serial.println("Error: Protocol version does not match expected");
    return false;
  }

  byte presetCount = EEPROM.read(address);
  address++;

  Serial.print("Preset count:");
  Serial.println(presetCount);

  for (int presetIdx = 0; presetIdx < presetCount; presetIdx++) {
    byte presetId = EEPROM.read(address);
    address++;
    Serial.print("  Preset ID:");
    Serial.println(presetId);

    byte synthId = EEPROM.read(address);
    address++;
    Serial.print("  Synth ID:");
    Serial.println(synthId);

    byte channel = EEPROM.read(address);
    address++;
    Serial.print("  Output MIDI channel:");
    Serial.println(channel);

    byte mappingCount = EEPROM.read(address);
    address++;
    Serial.print("  Mapping count:");
    Serial.println(mappingCount);

    for (int mappingIdx = 0; mappingIdx < mappingCount; mappingIdx++) {
      byte mappingInput = EEPROM.read(address);
      address++;
      byte mappingOutput = EEPROM.read(address);
      address++;
      Serial.print("    Mapping: input ");
      Serial.print(mappingInput);
      Serial.print(" output ");
      Serial.print(mappingOutput);
      Serial.println();
    }
  }

  return true;
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

  initializeFromMemory();

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
