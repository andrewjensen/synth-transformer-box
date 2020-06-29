// Inspired by https://github.com/dgduncan/SevenSegment

const int FLASH_TIMES = 3;
const int FLASH_DURATION = 300;

byte digitsToSegments[] = {
  B11000000, //  0
  B11111001, //  1
  B10100100, //  2
  B10110000, //  3
  B10011001, //  4
  B10010010, //  5
  B10000010, //  6
  B11111000, //  7
  B10000000, //  8
  B00010000, //  9
};

class SegmentDisplay {
public:
  SegmentDisplay(
    int pinA,
    int pinB,
    int pinC,
    int pinD,
    int pinE,
    int pinF,
    int pinG
  ) {
    pins[0] = pinA;
    pins[1] = pinB;
    pins[2] = pinC;
    pins[3] = pinD;
    pins[4] = pinE;
    pins[5] = pinF;
    pins[6] = pinG;

    for (int i = 0; i < 7; i++) {
      pinMode(pins[i], OUTPUT);
      digitalWrite(pins[i], HIGH);
    }
  }

  void showDigit(int digit) {
    for (int i = 0; i < 7; i++) {
      boolean bitToWrite = bitRead(digitsToSegments[digit], i);
      digitalWrite(pins[i], bitToWrite);
    }
  }

  void allOn() {
    for (int i = 0; i < 7; i++) {
      digitalWrite(pins[i], LOW);
    }
  }

  void allOff() {
    for (int i = 0; i < 7; i++) {
      digitalWrite(pins[i], HIGH);
    }
  }

  void flashDigit(int digit) {
    for (int i = 0; i < FLASH_TIMES; i++) {
      showDigit(digit);
      delay(FLASH_DURATION);
      allOff();
      delay(FLASH_DURATION);
    }
  }

private:
  int pins[7];
};
