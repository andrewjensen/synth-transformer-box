const byte PROTOCOL_VERSION = 0x01;
const byte COMMAND_ID_SAVE_SETTINGS_V1 = 0x10;
const byte COMMAND_ID_SAVE_SETTINGS_SUCCESSFUL_V1 = 0x11;

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

  void printState() {
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
      Serial.println("Error: Protocol version does not match expected");
      return false;
    }

    presetCount = EEPROM.read(address);
    address++;

    Serial.print("Preset count:");
    Serial.println(presetCount);

    presets = new Preset[presetCount];
    activePresetIdx = 0;

    for (int presetIdx = 0; presetIdx < presetCount; presetIdx++) {
      byte presetId = EEPROM.read(address);
      address++;
      Serial.print("  Preset ID:");
      Serial.println(presetId);
      presets[presetIdx].setPresetId(presetId);

      byte synthId = EEPROM.read(address);
      address++;
      Serial.print("  Synth ID:");
      Serial.println(synthId);
      presets[presetIdx].setSynthId(synthId);

      byte channel = EEPROM.read(address);
      address++;
      Serial.print("  Output MIDI channel:");
      Serial.println(channel);
      presets[presetIdx].setChannel(channel);

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
        presets[presetIdx].setMapping(mappingInput, mappingOutput);
      }
    }

    return true;
  }

  void printState() {
    Serial.println("Settings {");
    for (uint presetIdx = 0; presetIdx < presetCount; presetIdx++) {
      presets[presetIdx].printState();
    }
    Serial.println("}");
  }

  byte translateCC(byte inputCC) {
    return presets[activePresetIdx].translateCC(inputCC);
  }
};
