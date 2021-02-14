#ifndef mapping_h
#define mapping_h

#include "Mapping.h"

class Mapping {
  byte ccNumber;
  String ccName;

public:
  Mapping(byte inCCNumber, String inCCName) {
    ccNumber = inCCNumber;
    ccName = inCCName;
  }

  byte getCCNumber() {
    return ccNumber;
  }

  String getCCName() {
    return ccName;
  }
};

#endif
