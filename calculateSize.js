const path = require('path');
const prettyBytes = require('pretty-bytes');

let totalSize = 0;

module.exports = function() {
    const glob = require('glob');

    const DIR = path.resolve(__dirname);
    const DATA_DIR = path.resolve(DIR, 'data');

    const projectInfos = glob.sync(`${DATA_DIR}/**/project.json`);

    projectInfos.forEach((path) => {
        const projectInfo = require(path);

        totalSize += projectInfo.totalSizeRaw;
    });

    return prettyBytes(totalSize);
}