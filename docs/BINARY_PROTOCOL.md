# Wire Protocol

Version 1

## EEPROM Storage

We store the protocol version at the first address, to know whether the storage is valid at startup time or not.

Layout:

- Protocol version number (byte)
- Number of presets (byte)
- For each preset:
  - Preset ID (byte)
  - Synth ID (four bytes)
  - MIDI output channel (byte)
  - Number of CC mappings (byte)
  - For each mapping:
    - Input CC number (byte)
    - Output CC number (byte)

## Messages from the editor

### Save settings v1

Command ID: `0x10`

Contents:

- Command ID (byte)
- Number of presets (byte)
- For each preset:
  - Preset ID (byte)
  - Synth ID (four bytes)
  - MIDI output channel (byte)
  - Number of CC mappings (byte)
  - For each mapping:
    - Input CC number (byte)
    - Output CC number (byte)

### Request load settings v1

Command ID: `0x20`

Contents:

- Command ID (byte)

## Messages from the box

### Save settings successful v1

Command ID: `0x11`

Contents:

- Command ID (byte)

### Save settings failed v1

Command ID: `0xa0`

Contents:

- Command ID (byte)
- Reason (string, null-terminated)

### Load settings v1

Command ID: `0x21`

Contents:

- Command ID (byte)
- Number of presets (byte)
- For each preset:
  - Preset ID (byte)
  - Synth ID (four bytes)
  - MIDI output channel (byte)
  - Number of CC mappings (byte)
  - For each mapping:
    - Input CC number (byte)
    - Output CC number (byte)
