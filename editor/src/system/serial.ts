import SerialPort from 'serialport';

import { Settings } from '../common/types';
import { getSynthById } from '../common/config/synths';

const MESSAGE_ID_REQUEST_LOAD_SETTINGS_V1 = 0x20;
const MESSAGE_ID_LOAD_SETTINGS_V1 = 0x21;
const MESSAGE_ID_SEND_SETTINGS_V1 = 0x30;
const MESSAGE_ID_SEND_SETTINGS_SUCCESSFUL_V1 = 0x31;
const MESSAGE_ID_COMMIT_SETTINGS_V1 = 0x40;
const MESSAGE_ID_COMMIT_SETTINGS_SUCCESSFUL_V1 = 0x41;

const RESPONSE_BUFFER_TIMEOUT_MS = 500;

let portInstance: SerialPort | null = null;

interface MessageWithId {
  msg: number
}

interface SendSettingsMessage {
  msg: number
  ctrl: {
    rows: number
    cols: number
    ccs: number[]
  },
  outs: MessagePreset[]
}

interface LoadSettingsMessage {
  msg: number
  ctrl: {
    rows: number
    cols: number
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

function createSendSettingsMessage(settings: Settings): SendSettingsMessage {
  return {
    msg: MESSAGE_ID_SEND_SETTINGS_V1,
    ctrl: {
      rows: settings.controllerRows,
      cols: settings.controllerColumns,
      ccs: settings.inputCCs
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

function createCommitSettingsMessage(): MessageWithId {
  return {
    msg: MESSAGE_ID_COMMIT_SETTINGS_V1
  };
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
      throw new Error(`Received unexpected response:\n${JSON.stringify(response, null, 2)}`);
    }
  } catch (err) {
    throw new Error(`Failed to load settings: ${err}`);
  }
}

export async function sendSettings(settings: Settings): Promise<void> {
  try {
    const port = await connect();
    const message = createSendSettingsMessage(settings);
    const rawMessage = serializeMessage(message);
    const rawResponse = await sendMessage(rawMessage, port);
    const response = deserializeMessage(rawResponse);

    if (response.msg && response.msg === MESSAGE_ID_SEND_SETTINGS_SUCCESSFUL_V1) {
      // Success
      return;
    } else {
      throw new Error(`Received unexpected response:\n${JSON.stringify(response, null, 2)}`);
    }
  } catch (err) {
    throw new Error(`Failed to send settings: ${err}`);
  }
}

export async function commitSettings(): Promise<void> {
  try {
    const port = await connect();
    const message = createCommitSettingsMessage();
    const rawMessage = serializeMessage(message);
    const rawResponse = await sendMessage(rawMessage, port);
    const response = deserializeMessage(rawResponse);

    if (response.msg && response.msg === MESSAGE_ID_COMMIT_SETTINGS_SUCCESSFUL_V1) {
      // Success
      return;
    } else {
      throw new Error(`Received unexpected response:\n${JSON.stringify(response, null, 2)}`);
    }
  } catch (err) {
    throw new Error(`Failed to commit settings: ${err}`);
  }
}

function parseLoadSettings(rawSettings: LoadSettingsMessage): Settings {
  const inputCCs = rawSettings.ctrl.ccs;
  const settings: Settings = {
    inputCCs,
    controllerRows: rawSettings.ctrl.rows,
    controllerColumns: rawSettings.ctrl.cols,
    presets: []
  };

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
    let response: Buffer = null;
    let submitTimer: number = null;

    function addResponseData(data: any) {
      resetSubmitTimer();

      console.log('Received data, as utf8:', data.toString('utf8'));
      console.log(`Received data, as raw decimal bytes:`);
      logBytesAsDecimal(data);
      console.log('-------');

      if (response) {
        console.log('  Added to response...')
        response = Buffer.concat([response, Buffer.from(data)]);
      } else {
        response = Buffer.from(data);
      }
    }

    function resetSubmitTimer() {
      if (submitTimer) {
        clearTimeout(submitTimer);
      }
      submitTimer = setTimeout(submitResponse, RESPONSE_BUFFER_TIMEOUT_MS);
    }

    function submitResponse() {
      console.log('  Submitting response after waiting');
      port.off('data', addResponseData);

      resolve(response);
    }

    port.on('data', addResponseData);
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

function logBytesAsDecimal(data: any) {
  let toLog = '';
  for (let byte of data) {
    toLog += byte + ' ';
  }
  console.log(toLog);
}
