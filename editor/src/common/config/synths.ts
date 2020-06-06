import { Synth } from '../types';

export const SYNTHS: Synth[] = require("./synthConfig.json");

export function getSynthById(synthId: string): Synth {
  const synth = SYNTHS.find(s => s.id === synthId);
  if (!synth) {
    throw new Error(`No synth with id: ${synthId}`);
  }
  return synth;
}

export function printSynthTitle(synthId: string): string {
  const synth = getSynthById(synthId);
  return `${synth.manufacturer} ${synth.title}`;
}
