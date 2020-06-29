#include "constants.h"

class Preset {
  byte presetId;
  byte synthId;
  byte channel;
  byte* mappings;

public:
  Preset() {
    mappings = new byte[128];
  }

  void setPresetId(byte inPresetId) {
    presetId = inPresetId;
  }

  void setSynthId(byte inSynthId) {
    synthId = inSynthId;
  }

  void setChannel(byte inChannel) {
    channel = inChannel;
  }

  void setMapping(byte inputCC, byte outputCC) {
    mappings[inputCC] = outputCC;
  }

  byte getPresetId() {
    return presetId;
  }

  byte getChannel() {
    return channel;
  }

  void printState() {
    if (!DEBUG_SERIAL) {
      return;
    }

    Serial.println("  Preset {");

    Serial.print("    presetId: ");
    Serial.println(presetId);
    Serial.print("    synthId: ");
    Serial.println(synthId);
    Serial.print("    channel: ");
    Serial.println(channel);

    Serial.println("    mappings: {");
    for (int inputCC = 1; inputCC < 128; inputCC++) {
      byte outputCC = mappings[inputCC];
      if (outputCC != 0) {
        Serial.print("      ");
        Serial.print(inputCC);
        Serial.print(" => ");
        Serial.println(outputCC);
      }
    }
    Serial.println("    }");

    Serial.println("  }");
  }

  byte translateCC(byte inputCC) {
    byte outputCC = mappings[inputCC];
    if (outputCC) {
      return outputCC;
    } else {
      return inputCC;
    }
  }
};

class Settings {
  byte presetCount;
  byte activePresetIdx;
  Preset* presets;

public:
  Settings() {
  }

  bool initializeFromMemory() {
    int address = 0;

    byte version_number = EEPROM.read(address);
    address++;
    if (version_number != PROTOCOL_VERSION) {
      if (DEBUG_SERIAL) {
        Serial.println("Error: Protocol version does not match expected");
      }
      return false;
    }

    presetCount = EEPROM.read(address);
    address++;
    if (DEBUG_SERIAL) {
      Serial.print("Preset count:");
      Serial.println(presetCount);
    }

    presets = new Preset[presetCount];
    activePresetIdx = 0;

    for (int presetIdx = 0; presetIdx < presetCount; presetIdx++) {
      byte presetId = EEPROM.read(address);
      address++;
      presets[presetIdx].setPresetId(presetId);
      if (DEBUG_SERIAL) {
        Serial.print("  Preset ID:");
        Serial.println(presetId);
      }

      byte synthId = EEPROM.read(address);
      address++;
      presets[presetIdx].setSynthId(synthId);
      if (DEBUG_SERIAL) {
        Serial.print("  Synth ID:");
        Serial.println(synthId);
      }

      byte channel = EEPROM.read(address);
      address++;
      presets[presetIdx].setChannel(channel);
      if (DEBUG_SERIAL) {
        Serial.print("  Output MIDI channel:");
        Serial.println(channel);
      }

      byte mappingCount = EEPROM.read(address);
      address++;
      if (DEBUG_SERIAL) {
        Serial.print("  Mapping count:");
        Serial.println(mappingCount);
      }

      for (int mappingIdx = 0; mappingIdx < mappingCount; mappingIdx++) {
        byte mappingInput = EEPROM.read(address);
        address++;
        byte mappingOutput = EEPROM.read(address);
        address++;

        if (DEBUG_SERIAL) {
          Serial.print("    Mapping: input ");
          Serial.print(mappingInput);
          Serial.print(" output ");
          Serial.print(mappingOutput);
          Serial.println();
        }
        presets[presetIdx].setMapping(mappingInput, mappingOutput);
      }
    }

    return true;
  }

  void triggerNextPreset() {
    activePresetIdx = (activePresetIdx + 1) % presetCount;
  }

  byte getCurrentPresetId() {
    return presets[activePresetIdx].getPresetId();
  }

  byte getChannel() {
    return presets[activePresetIdx].getChannel();
  }

  byte translateCC(byte inputCC) {
    return presets[activePresetIdx].translateCC(inputCC);
  }

  byte getPresetCount() {
    return presetCount;
  }

  void printState() {
    if (!DEBUG_SERIAL) {
      return;
    }

    Serial.println("Settings {");
    for (uint presetIdx = 0; presetIdx < presetCount; presetIdx++) {
      presets[presetIdx].printState();
    }
    Serial.println("}");
  }
};
