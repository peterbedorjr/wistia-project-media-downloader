require('dotenv').config();

const prompts = require('prompts');
const setup = require('./setup');
const download = require('./download');
const { calculateSize } = require('./utils');

(async () => {
    const { runSetup } = await prompts({
        type: 'confirm',
        name: 'runSetup',
        message: 'Run setup?',
    });

    if (runSetup) {
        await setup();
    }

    const totalSize = await calculateSize();

    const { cont } = await prompts({
        type: 'confirm',
        name: 'cont',
        message: `Total size of downloads is ${totalSize}, continue?`,
    });

    if (cont) {
        await download();
    }
})();