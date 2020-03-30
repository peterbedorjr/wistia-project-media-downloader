const path = require('path');
const fs = require('fs');

const DIR = path.resolve(__dirname);
const DATA_DIR = path.resolve(DIR, 'data');

function saveProjectInfo(project, info) {
    const projectDir = path.resolve(DATA_DIR, project.name);
    const projectInfoPath = path.resolve(projectDir, 'project.json');

    fs.writeFileSync(projectInfoPath, JSON.stringify(info, null, 4), 'utf-8');
}

async function each(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i, array);
    }
}

module.exports = {
    each,
    saveProjectInfo,
};