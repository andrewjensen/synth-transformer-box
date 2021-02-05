#ifndef settings_h
#define settings_h

#include "constants.h"

enum InitSettingsResult {
  Success = 1,
  Error = 2,
  MemoryBlank = 3,
};

class Preset {
  byte presetId;
  byte synthId;
  String synthName;
  byte channel;
  byte* mappings;

public:
  Preset() {
    mappings = new byte[128];
    for (int i = 0; i < 128; i++) {
      mappings[i] = 0;
    }
  }

  void setPresetId(byte inPresetId) {
    presetId = inPresetId;
  }

  void setSynthId(byte inSynthId) {
    synthId = inSynthId;
  }

  void setSynthName(String inSynthName) {
    synthName = inSynthName;
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

  String getSynthName() {
    return String(synthName);
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

  InitSettingsResult initializeFromEEPROM() {
    if (isMemoryBlank()) {
      return InitSettingsResult::MemoryBlank;
    }

    DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_FULL);

    bool readJsonSuccessful = readJsonFromMemory(doc);
    if (!readJsonSuccessful) {
      return InitSettingsResult::Error;
    }

    return initializeFromDoc(doc);
  }

  InitSettingsResult initializeFromDoc(DynamicJsonDocument doc) {
    JsonArray ccs = doc["ctrl"]["ccs"];
    byte inputCCs[ccs.size()];
    int inputCCIdx = 0;
    for (JsonVariant ccRaw : ccs) {
      byte cc = ccRaw.as<byte>();
      inputCCs[inputCCIdx] = cc;
      inputCCIdx++;
    }
    if (DEBUG_SERIAL) {
      Serial.println("Input CCs:");
      for (byte cc : inputCCs) {
        Serial.println("  " + String(cc));
      }
    }

    JsonArray outs = doc["outs"];
    presetCount = outs.size();
    presets = new Preset[presetCount];
    activePresetIdx = 0;

    int presetIdx = 0;
    for (JsonVariant outRaw : outs) {
      JsonObject rawPreset = outRaw.as<JsonObject>();
      byte presetId = rawPreset["pid"];
      byte synthId = rawPreset["sid"];
      byte channel = rawPreset["chn"];
      String manufacturerName = rawPreset["mfg"];
      String synthName = rawPreset["syn"];

      presets[presetIdx].setPresetId(presetId);
      presets[presetIdx].setSynthName(synthName);
      presets[presetIdx].setSynthId(synthId);
      presets[presetIdx].setChannel(channel);

      if (DEBUG_SERIAL) {
        Serial.println("NEW OUTPUT");
        Serial.println("preset id: " + String(presetId));
        Serial.println("synth id: " + synthId);
        Serial.println("channel: " + channel);
        Serial.println(manufacturerName);
        Serial.println(synthName);
        Serial.println("Output CCs:");
      }

      JsonArray presetCCs = rawPreset["ccs"];
      int mappingIdx = 0;
      for (JsonVariant ccRaw : presetCCs) {
        byte mappingInput = inputCCs[mappingIdx];

        JsonObject cc = ccRaw.as<JsonObject>();
        byte mappingOutput = cc["num"];
        String ccName = cc["name"];

        presets[presetIdx].setMapping(mappingInput, mappingOutput);

        if (DEBUG_SERIAL) {
          Serial.println(String(mappingOutput) + ":" + ccName);
        }

        mappingIdx++;
      }

      if (DEBUG_SERIAL) {
        Serial.println("");
      }

      presetIdx++;
    }

    return InitSettingsResult::Success;
  }

  bool readJsonFromMemory(DynamicJsonDocument& doc) {
    int address = 0;

    byte versionNumber = EEPROM.read(address);
    address++;
    if (versionNumber != PROTOCOL_VERSION) {
      if (DEBUG_SERIAL) {
        Serial.println("Error: Protocol version does not match expected");
      }
      return false;
    }

    // Read serialized settings from EEPROM into memory
    char serializedSettings [DOCUMENT_ALLOC_SIZE_FULL];
    int outIdx = 0;
    while (true) {
      byte read = EEPROM.read(address);
      if (read == 0) {
        // We hit the terminating signal
        // TODO: make this more robust
        break;
      }
      serializedSettings[outIdx] = read;

      outIdx++;
      address++;
    }

    // Deserialize the JSON
    DeserializationError err = deserializeJson(doc, serializedSettings);
    if (err) {
      if (DEBUG_SERIAL) {
        Serial.println("Error deserializing settings:");
        Serial.println(err.c_str());
      }
      return false;
    }

    if (DEBUG_SERIAL) {
      Serial.println("Successfully deserialized JSON");
    }

    return true;
  }

  bool isMemoryBlank() {
    return (
      EEPROM.read(0) == 255 &&
      EEPROM.read(1) == 255 &&
      EEPROM.read(2) == 255 &&
      EEPROM.read(3) == 255);
  }

  void triggerNextPreset() {
    activePresetIdx = (activePresetIdx + 1) % presetCount;
  }

  byte getCurrentPresetId() {
    return presets[activePresetIdx].getPresetId();
  }

  String getCurrentSynthName() {
    return presets[activePresetIdx].getSynthName();
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

#endif
