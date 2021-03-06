#ifndef settings_h
#define settings_h

#include <vector>
#include "constants.h"
#include "Mapping.h"
#include "Preset.h"

enum InitSettingsResult {
  Success = 1,
  Error = 2,
  MemoryBlank = 3,
};

class Settings {
  byte controllerRows;
  byte controllerColumns;
  std::vector<byte> inputCCs;
  std::vector<Preset> presets;
  byte activePresetIdx;

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
    controllerRows = doc["ctrl"]["rows"];
    controllerColumns = doc["ctrl"]["cols"];

    JsonArray ccs = doc["ctrl"]["ccs"];
    inputCCs = std::vector<byte>();
    for (JsonVariant ccRaw : ccs) {
      byte cc = ccRaw.as<byte>();
      inputCCs.push_back(cc);
    }
    if (DEBUG_SERIAL) {
      Serial.println("Input CCs:");
      for (byte cc : inputCCs) {
        Serial.println("  " + String(cc));
      }
    }

    JsonArray outs = doc["outs"];
    presets = std::vector<Preset>();
    activePresetIdx = 0;

    for (JsonVariant outRaw : outs) {
      JsonObject rawPreset = outRaw.as<JsonObject>();
      byte presetId = rawPreset["pid"];
      byte synthId = rawPreset["sid"];
      byte channel = rawPreset["chn"];
      String manufacturerName = rawPreset["mfg"];
      String synthName = rawPreset["syn"];

      Preset preset = Preset();

      preset.setPresetId(presetId);
      preset.setManufacturerName(manufacturerName);
      preset.setSynthName(synthName);
      preset.setSynthId(synthId);
      preset.setChannel(channel);

      if (DEBUG_SERIAL) {
        Serial.println("NEW OUTPUT");
        Serial.println("preset id: " + String(presetId));
        Serial.println("synth id: " + String(synthId));
        Serial.println("channel: " + String(channel));
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

        preset.addMapping(mappingInput, mappingOutput, ccName);

        if (DEBUG_SERIAL) {
          Serial.println(String(mappingOutput) + ":" + ccName);
        }

        mappingIdx++;
      }

      if (DEBUG_SERIAL) {
        Serial.println("");
      }

      presets.push_back(preset);
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

  bool saveToEEPROM() {
    if (DEBUG_SERIAL) {
      Serial.println("saveToEEPROM()");
    }

    DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_FULL);
    if (!serializeSettings(doc)) {
      return false;
    }

    std::string output;
    serializeJson(doc, output);

    int address = 0;
    EEPROM.write(address, PROTOCOL_VERSION);
    address++;
    for (std::string::size_type i = 0; i < output.size(); i++) {
      EEPROM.write(address, output[i]);
      address++;
    }
    storeTerminatingSignal(address);

    return true;
  }

  bool serializeSettings(DynamicJsonDocument& doc) {
    JsonObject ctrl  = doc.createNestedObject("ctrl");
    ctrl["rows"] = controllerRows;
    ctrl["cols"] = controllerColumns;

    JsonArray ccs = ctrl.createNestedArray("ccs");
    for (byte cc : inputCCs) {
      ccs.add(cc);
    }

    JsonArray outs = doc.createNestedArray("outs");
    for (Preset preset : presets) {
      JsonObject out = outs.createNestedObject();

      out["pid"] = preset.getPresetId();
      out["sid"] = preset.getSynthId();
      out["mfg"] = preset.getManufacturerName();
      out["syn"] = preset.getSynthName();
      out["chn"] = preset.getChannel();

      JsonArray outCCs = out.createNestedArray("ccs");
      std::vector<Mapping> mappings = preset.getMappings();
      for (Mapping m : mappings) {
        JsonObject outCC = outCCs.createNestedObject();
        outCC["num"] = m.getCCNumber();
        outCC["name"] = m.getCCName();
      }
    }

    return true;
  }

  bool isMemoryBlank() {
    return (
      EEPROM.read(0) == 255 &&
      EEPROM.read(1) == 255 &&
      EEPROM.read(2) == 255 &&
      EEPROM.read(3) == 255
    );
  }

  void triggerNextPreset() {
    activePresetIdx = (activePresetIdx + 1) % presets.size();
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
    return presets.size();
  }

  void printState() {
    if (!DEBUG_SERIAL) {
      return;
    }

    Serial.println("Settings {");

    Serial.println("  controllerRows: " + String(controllerRows));
    Serial.println("  controllerColumns: " + String(controllerColumns));
    Serial.println("  inputCCs: [");
    for (byte inputCC : inputCCs) {
      Serial.println("    " + String(inputCC));
    }
    Serial.println("  ]");

    for (Preset preset : presets) {
      preset.printState();
    }

    Serial.println("}");
  }

private:
  void storeTerminatingSignal(int address) {
    for (int i = 0; i < 4; i++) {
      EEPROM.write(address + i, 0x00);
    }
  }
};

#endif
