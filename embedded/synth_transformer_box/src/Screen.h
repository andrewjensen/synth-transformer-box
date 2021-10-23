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

  void printWelcome() {
    clear();
    printTopLine("   Universal    ");
    printBottomLine("   Traveler     ");
  }

  void printCreditsAndrew() {
    clear();
    printTopLine("Created by");
    printBottomLine("Andrew Jensen");
  }

  void printCreditsEric() {
    clear();
    printTopLine("and");
    printBottomLine("Eric Robertson");
  }

  void printInitialized(int presetCount) {
    clear();
    printTopLine("Initialized");
    printBottomLine(formatPresetCount(presetCount));
  }

  void printNoPresetsYet() {
    clear();
    printTopLine("No presets yet");
  }

  void printSettingsSaved(int presetCount) {
    clear();
    printTopLine("Saved settings");
    printBottomLine(formatPresetCount(presetCount));
  }

  void printPreset(int presetId, String presetName) {
    if (presetId == -1) {
      return printNoPresetsYet();
    }

    clear();
    printTopLine(String(presetId) + ":" + presetName);

    // TODO: show details about the synth
    // printBottomLine("[Details]");
  }

  void printInitializationError() {
    clear();
    printTopLine("Error during");
    printBottomLine("initialization");
  }

  void clear() {
    lcd->clear();
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

  String formatPresetCount(int presetCount) {
    if (presetCount == 1) {
      return "1 preset";
    } else {
      return String(presetCount) + " presets";
    }
  }
};

#endif
