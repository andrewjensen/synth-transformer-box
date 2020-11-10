import SerialPort from 'serialport';

import { Settings } from '../common/types';
import { getSynthById } from '../common/config/synths';

const MESSAGE_ID_SAVE_SETTINGS_V1 = 0x10;
const MESSAGE_ID_SAVE_SETTINGS_SUCCESSFUL_V1 = 0x11;
const MESSAGE_ID_REQUEST_LOAD_SETTINGS_V1 = 0x20;
const MESSAGE_ID_LOAD_SETTINGS_V1 = 0x21;

let portInstance: SerialPort | null = null;

interface MessageWithId {
  msg: number
}

interface SaveSettingsMessage {
  msg: number,
  ctrl: {
    rows: number,
    cols: number,
    ccs: number[]
  },
  outs: MessagePreset[]
}

interface LoadSettingsMessage {
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

function createSaveSettingsMessage(settings: Settings): SaveSettingsMessage {
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
  };
}

function createRequestLoadSettingsMessage(): MessageWithId {
  return {
    msg: MESSAGE_ID_REQUEST_LOAD_SETTINGS_V1
  };
}

export async function saveSettings(settings: Settings): Promise<string> {
  try {
    const port = await connect();
    const message = createSaveSettingsMessage(settings);
    const rawMessage = serializeMessage(message);
    const rawResponse = await sendMessage(rawMessage, port);
    const response = deserializeMessage(rawResponse);

    if (response.msg && response.msg === MESSAGE_ID_SAVE_SETTINGS_SUCCESSFUL_V1) {
      return 'Saved settings!';
    } else {
      throw new Error(`Received unexpected response: ${response}`);
    }
  } catch (err) {
    throw new Error(`Failed to save settings: ${err}`);
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const port = await connect();
    const message = createRequestLoadSettingsMessage();
    const rawMessage = serializeMessage(message);
    const rawResponse = await sendMessage(rawMessage, port);
    const response = deserializeMessage(rawResponse);

    if (response.msg && response.msg === MESSAGE_ID_LOAD_SETTINGS_V1) {
      const settings = parseLoadSettings(response);
      return settings;
    } else {
      throw new Error(`Received unexpected response: ${response}`);
    }
  } catch (err) {
    throw new Error(`Failed to load settings: ${err}`);
  }
}

function parseLoadSettings(rawSettings: LoadSettingsMessage): Settings {
  const settings: Settings = {
    presets: []
  };

  const inputCCs = rawSettings.ctrl.ccs;

  settings.presets = rawSettings.outs.map(out => ({
    synthId: out.sid,
    channel: out.chn,
    mappings: out.ccs.map((outCC, idx) => ({
      in: inputCCs[idx],
      out: outCC.num
    }))
  }));

  return settings;
}

function serializeMessage(message: object): Buffer {
  return Buffer.from(JSON.stringify(message));
}

function deserializeMessage(rawMessage: Buffer): any {
  return JSON.parse(rawMessage.toString());
}

async function sendMessage(commandBuffer: Buffer, port: SerialPort): Promise<Buffer> {
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
