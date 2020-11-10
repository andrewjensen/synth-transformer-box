import SerialPort from 'serialport';

import { Settings, Preset, ControllerMapping } from '../common/types';
import { getSynthById } from '../common/config/synths';

const MESSAGE_ID_SAVE_SETTINGS_V1 = 0x10;
const COMMAND_ID_REQUEST_LOAD_SETTINGS_V1 = 0x20;
const COMMAND_ID_LOAD_SETTINGS_V1 = 0x21;

let portInstance: SerialPort | null = null;

interface SaveSettingsMessage {
  msg: number,
  ctrl: {
    rows: number,
    cols: number,
    ccs: number[]
  },
  outs: MessagePreset[]
}

interface MessagePreset {
  pid: number,
  sid: number,
  mfg: string,
  syn: string,
  chn: number,
  ccs: MessagePresetCC[]
}

interface MessagePresetCC {
  num: number,
  name: string
}

function serializeSaveCommand(settings: Settings): SaveSettingsMessage {
  return {
    msg: MESSAGE_ID_SAVE_SETTINGS_V1,
    ctrl: {
      rows: 2,
      cols: 4,
      ccs: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    outs: settings.presets.map((preset, idx) => {
      const synth = getSynthById(preset.synthId);
      return {
        pid: idx + 1,
        sid: preset.synthId,
        mfg: synth.manufacturer,
        syn: synth.title,
        chn: preset.channel,
        ccs: preset.mappings.map(mapping => {
          const param = synth.parameters.find(param => param.cc === mapping.out);
          if (!param) {
            throw new Error(`Could not find parameter ${mapping.out} for synth ${preset.synthId}`);
          }
          return {
            num: mapping.out,
            name: param.title
          };
        })
      };
    })
  }
}

export async function saveSettings(settings: Settings): Promise<string> {
  try {
    const port = await connect();
    const serialized = serializeSaveCommand(settings);
    const json = Buffer.from(JSON.stringify(serialized));
    const rawResponse = await sendCommand(json, port);

    // TODO: parse response, reject if represents a failure

    return 'Saved settings!';
  } catch (err) {
    throw new Error(`Failed to save settings: ${err}`);
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const port = await connect();
    const loadCommand = Buffer.from([COMMAND_ID_REQUEST_LOAD_SETTINGS_V1]);
    const rawResponse = await sendCommand(loadCommand, port);
    const settings = deserializeLoadSettingsMessage(rawResponse);

    return settings;
  } catch (err) {
    throw new Error(`Failed to load settings: ${err}`);
  }
}

function deserializeLoadSettingsMessage(rawSettings: Buffer): Settings {

  // TODO: implement

  debugger;

  const settings: Settings = {
    presets: []
  };

  let address = 0;
  if (rawSettings[address] !== COMMAND_ID_LOAD_SETTINGS_V1) {
    throw new Error(`Expected message ID ${COMMAND_ID_LOAD_SETTINGS_V1}, got ${rawSettings[address]}`);
  }
  address++;

  const presetCount = rawSettings[address];
  address++;
  console.log('presetCount', presetCount);

  for (let presetIdx = 0; presetIdx < presetCount; presetIdx++) {
    const presetId = rawSettings[address];
    address++;
    console.log('  preset ID:', presetId);

    const synthId = rawSettings[address];
    address++;
    console.log('  Synth ID:', synthId);

    const channel = rawSettings[address];
    address++;
    console.log('  Output MIDI channel:', channel);

    const mappingCount = rawSettings[address];
    address++;
    console.log('  Mapping count:', mappingCount);

    const mappings: ControllerMapping[] = [];

    for (let mappingIdx = 0; mappingIdx < mappingCount; mappingIdx++) {
      const mappingInput = rawSettings[address];
      address++;
      const mappingOutput = rawSettings[address];
      address++;

      const mapping: ControllerMapping = {
        in: mappingInput,
        out: mappingOutput
      };
      mappings.push(mapping);
      console.log(`    Mapping: input ${mappingInput} output ${mappingOutput}`);
    }

    const preset: Preset = {
      synthId,
      channel,
      mappings
    };
    settings.presets.push(preset);
  }

  expectNullByte(rawSettings[address]);
  address++;
  expectNullByte(rawSettings[address]);
  address++;
  expectNullByte(rawSettings[address]);
  address++;
  expectNullByte(rawSettings[address]);

  return settings;
}

function expectNullByte(byte: number) {
  if (byte !== 0x00) {
    throw new Error(`Expected null byte, got: ${byte}`);
  }
}

async function sendCommand(commandBuffer: Buffer, port: SerialPort): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    port.on('data', function (data) {
      console.log('Data, as utf8:', data.toString('utf8'));
      console.log(`Data, as raw decimal bytes:`);

      let toLog = '';
      for (let byte of data) {
        toLog += byte + ' ';
      }
      console.log(toLog);

      console.log('-------');

      resolve(Buffer.from(data));
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
      baudRate: 9600,
      autoOpen: false
    });
    await openPort(portInstance);

    console.log('Connected.');

    return portInstance;
  } catch (err) {
    console.log('Failed to create serial port:', err);
    throw err;
  }
}

async function openPort(port: SerialPort): Promise<void> {
  return new Promise((resolve, reject) => {
    port.open((err) => {
      if (err) {
        console.log('Error opening port!');
        reject(err);
      } else {
        console.log('Successfully opened port.');
        resolve();
      }
    });
  });
}

async function getPortPath(): Promise<string | null> {
  const ports = await SerialPort.list();
  console.log('ports:', ports);

  // TODO: is there a better thing to look for?
  const foundPort = ports.find(port => port.manufacturer === 'Teensyduino');

  return foundPort
    ? foundPort.path
    : null;
}
