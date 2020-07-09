const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const DIR_CONFIG = path.resolve(__dirname, '..', 'config');
const PATH_OUTPUT = path.resolve(__dirname, '..', 'output', 'synths.json');

async function run() {
  console.log('Reading config files...');

  const files = await readdir(DIR_CONFIG);

  const synths = [];

  for (let filename of files) {
    const filePath = path.resolve(DIR_CONFIG, filename);
    const contents = await readFile(filePath, 'utf8');
    const synth = JSON.parse(contents);

    synths.push(synth);
  }

  synths.sort(sortById);

  console.log(`Read config from ${synths.length} files`);

  console.log('Writing combined config to JSON...');

  const combinedJson = JSON.stringify(synths, null, 2);
  await writeFile(PATH_OUTPUT, combinedJson);

  console.log('Done.');
}

function sortById(synthA, synthB) {
  return synthA.id - synthB.id;
}

// ----

run();
