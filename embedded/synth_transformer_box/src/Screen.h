#ifndef screen_h
#define screen_h

#include <Wire.h>
#include <LiquidCrystal.h>

class Screen {
  LiquidCrystal* lcd;

public:
  Screen(
    int pinRS,
    int pinEN,
    int pinD4,
    int pinD5,
    int pinD6,
    int pinD7
  ) {
    lcd = new LiquidCrystal(
      pinRS,
      pinEN,
      pinD4,
      pinD5,
      pinD6,
      pinD7
    );

    lcd->begin(16, 2);
  }

  void printInitialized(int presetCount) {
    clear();
    printTopLine("Initialized");
    printBottomLine(formatPresetCount(presetCount));
  }

  void printSettingsSaved(int presetCount) {
    clear();
    printTopLine("Saved settings");
    printBottomLine(formatPresetCount(presetCount));
  }

  void printPreset(int presetId, String presetName) {
    clear();
    printTopLine(String(presetId) + ":" + presetName);
    printBottomLine("[Details]");
  }

  void printMemoryBlank() {
    printTopLine("Error:");
    printBottomLine("Memory Blank");
  }

  void printInitializationError() {
    printTopLine("Error during");
    printBottomLine("initialization");
  }

private:
  void printTopLine(String message) {
    lcd->home();
    lcd->print(message);
  }

  void printBottomLine(String message) {
    lcd->setCursor(0, 1);
    lcd->print(message);
  }

  void clear() {
    lcd->clear();
  }

  String formatPresetCount(int presetCount) {
    if (presetCount == 1) {
      return "1 preset";
    } else {
      return String(presetCount) + " presets";
    }
  }
};

#endif
