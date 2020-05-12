import { SYNTHS } from '../synths';

const DEBUGGING = false;

function debug(message: string) {
  if (DEBUGGING) {
    console.log(message);
  }
}

describe('synths config', () => {
  it('should contain valid synth definitions', () => {
    for (let synth of SYNTHS) {
      debug(`Validating synth ${synth.title}...`);

      expect(typeof synth.id).toBe('string');
      expect(typeof synth.manufacturer).toBe('string');
      expect(typeof synth.title).toBe('string');
      if (synth.subtitle !== null && typeof synth.subtitle !== 'string') {
        throw new TypeError('Synth subtitle should either be null or a string');
      }
      expect(synth).toHaveProperty('parameters');

      for (let parameter of synth.parameters) {
        debug(`  Validating param ${parameter.title}...`);

        expect(typeof parameter.cc).toBe('number');
        if (parameter.cc < 1 || parameter.cc > 127) {
          throw new TypeError('Parameter CC value is outside of range');
        }
        expect(typeof parameter.title).toBe('string');
      }
    }
  });
});
