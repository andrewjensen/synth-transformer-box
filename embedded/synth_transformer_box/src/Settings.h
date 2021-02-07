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

  // TODO: use vectors instead
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
    controllerRows = doc["ctrl"]["rows"];
    controllerColumns = doc["ctrl"]["cols"];

    JsonArray ccs = doc["ctrl"]["ccs"];
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
      presets[presetIdx].setManufacturerName(manufacturerName);
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

        presets[presetIdx].addMapping(mappingInput, mappingOutput, ccName);

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

  bool saveToEEPROM() {
    if (DEBUG_SERIAL) {
      Serial.println("saveToEEPROM()");
    }

    // TODO:
    //
    // - [x] Store other fields on Settings class
    // - [x] Create JSON with controller, presets, etc.
    // - [x] Store CC names too, don't drop them
    // - [ ] Data that we serialize needs to match what we see when we load
    // - [x] Return successful or not

    DynamicJsonDocument doc(DOCUMENT_ALLOC_SIZE_FULL);
    if (!serializeSettings(doc)) {
      return false;
    }

    // TODO: remove debugging
    Serial.println("Created this JSON:");
    serializeJson(doc, Serial);
    Serial.println("");

    // saveToEEPROM(doc);

    return true;
  }

  bool serializeSettings(DynamicJsonDocument& doc) {
    doc["msg"] = 0; // TODO: replace with something?

    JsonObject ctrl  = doc.createNestedObject("ctrl");
    ctrl["rows"] = controllerRows;
    ctrl["cols"] = controllerColumns;

    JsonArray ccs = ctrl.createNestedArray("ccs");
    for (byte cc : inputCCs) {
      ccs.add(cc);
    }

    JsonArray outs = doc.createNestedArray("outs");
    for (int outIdx = 0; outIdx < presetCount; outIdx++) {
      JsonObject out = outs.createNestedObject();
      Preset preset = presets[outIdx];
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

  void saveToEEPROM(DynamicJsonDocument& doc) {
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

    Serial.println("  controllerRows: " + String(controllerRows));
    Serial.println("  controllerColumns: " + String(controllerColumns));
    Serial.println("  inputCCs: [");
    for (byte inputCC : inputCCs) {
      Serial.println("    " + String(inputCC));
    }
    Serial.println("  ]");

    for (uint presetIdx = 0; presetIdx < presetCount; presetIdx++) {
      presets[presetIdx].printState();
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
