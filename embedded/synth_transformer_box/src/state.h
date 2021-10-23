#ifndef state_h
#define state_h

#include "Screen.h"
#include "Settings.h"

#define PIN_BUTTON 4
#define PIN_LED 13

#define PIN_LCD_RS 33
#define PIN_LCD_EN 34
#define PIN_LCD_D4 36
#define PIN_LCD_D5 37
#define PIN_LCD_D6 38
#define PIN_LCD_D7 39

Screen screen = Screen(
  PIN_LCD_RS,
  PIN_LCD_EN,

  PIN_LCD_D4,
  PIN_LCD_D5,
  PIN_LCD_D6,
  PIN_LCD_D7
);

MIDI_CREATE_INSTANCE(HardwareSerial, Serial1, MIDI);

Settings settings;
Bounce buttonDebouncer = Bounce();
ProgramState programState = ProgramState::Welcome;

#endif
