import { Synth } from '../types';

export const SYNTHS: Synth[] = require("../../../../synth-data/output/synths.json");

export function getSynthById(synthId: number): Synth {
  const synth = SYNTHS.find(s => s.id === synthId);
  if (!synth) {
    throw new Error(`No synth with id: ${synthId}`);
  }
  return synth;
}

export function printSynthTitle(synthId: number): string {
  const synth = getSynthById(synthId);
  return `${synth.manufacturer} ${synth.title}`;
}
