#ifndef preset_h
#define preset_h

#include <vector>
#include "Mapping.h"

class Preset {
  byte presetId;
  byte synthId;
  String manufacturerName;
  String synthName;
  byte channel;
  std::vector<Mapping> mappings;
  byte* quickMappings;

public:
  Preset() {
    quickMappings = new byte[128];
    for (int i = 0; i < 128; i++) {
      quickMappings[i] = 0;
    }
  }

  void setPresetId(byte inPresetId) {
    presetId = inPresetId;
  }

  void setSynthId(byte inSynthId) {
    synthId = inSynthId;
  }

  void setManufacturerName(String inManufacturerName) {
    manufacturerName = inManufacturerName;
  }

  void setSynthName(String inSynthName) {
    synthName = inSynthName;
  }

  void setChannel(byte inChannel) {
    channel = inChannel;
  }

  void addMapping(byte inputCC, byte outputCC, String ccName) {
    mappings.push_back(Mapping(outputCC, ccName));

    quickMappings[inputCC] = outputCC;
  }

  byte getPresetId() {
    return presetId;
  }

  byte getSynthId() {
    return synthId;
  }

  String getManufacturerName() {
    return manufacturerName;
  }

  String getSynthName() {
    return synthName;
  }

  byte getChannel() {
    return channel;
  }

  std::vector<Mapping> getMappings() {
    return mappings;
  }

  void printState() {
    if (!DEBUG_SERIAL) {
      return;
    }

    Serial.println("  Preset {");

    Serial.println("    presetId: " + String(presetId));
    Serial.println("    synthId: " + String(synthId));
    Serial.println("    manufacturerName: " + manufacturerName);
    Serial.println("    synthName: " + synthName);
    Serial.println("    channel: " + String(channel));

    Serial.println("    quickMappings: {");
    for (int inputCC = 1; inputCC < 128; inputCC++) {
      byte outputCC = quickMappings[inputCC];
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
    byte outputCC = quickMappings[inputCC];
    if (outputCC) {
      return outputCC;
    } else {
      return inputCC;
    }
  }
};

#endif
