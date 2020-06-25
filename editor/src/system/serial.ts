import SerialPort from 'serialport';

import { Settings } from '../common/types';

const COMMAND_ID_SAVE_SETTINGS_V1 = 0x10;

let portInstance: SerialPort | null = null;

export async function saveSettings(settings: Settings): Promise<string> {
  try {
    const port = await connect();

    const saveCommand = serializeSaveCommand(settings);

    await sendCommand(saveCommand, port);

    return 'Saved settings!';
  } catch (err) {
    throw new Error(`Failed to save settings: ${err}`);
  }
}

function serializeSaveCommand(settings: Settings): Buffer {
  const bytes = [];

  const { presets } = settings;

  bytes.push(COMMAND_ID_SAVE_SETTINGS_V1);
  bytes.push(presets.length);

  for (let idx = 0; idx < presets.length; idx++) {
    const preset = presets[idx];
    const presetNumber = idx + 1;

    bytes.push(presetNumber);
    bytes.push(preset.synthId);
    bytes.push(preset.channel);
    bytes.push(preset.mappings.length);

    for (let mapping of preset.mappings) {
      bytes.push(mapping.in);
      bytes.push(mapping.out);
    }
  }

  const commandBuffer = Buffer.from(bytes);

  return commandBuffer;
}

async function sendCommand(commandBuffer: Buffer, port: SerialPort) {
  return new Promise((resolve, reject) => {
    port.on('data', function (data) {
      console.log('Data:', data.toString('utf8'));
      console.log('-------');

      // TODO: parse response, reject if represents a failure

      resolve();
    });

    port.write(commandBuffer);
  });
}

async function connect(): Promise<SerialPort> {
  console.log('connect()');

  if (portInstance) {
    return portInstance;
  }

  try {
    const portPath = await getPortPath();
    if (!portPath) {
      throw new Error('Cannot find connected MIDI box');
    }

    portInstance = new SerialPort(portPath, {
      baudRate: 9600
    });
    return portInstance;
  } catch (err) {
    console.log('Failed to create serial port:', err);
    throw err;
  }
}

async function getPortPath(): Promise<string | null> {
  const ports = await SerialPort.list();

  // TODO: is there a better thing to look for?
  const foundPort = ports.find(port => port.manufacturer === 'Teensyduino');

  return foundPort
    ? foundPort.path
    : null;
}
