const path = require('path');
const fs = require('fs');
const DIR = path.resolve(__dirname);
const LOG_FILE = `${DIR}/log.txt`;
 
function addZero(num) {
    return num < 10 ? `0${num}` : num;
}

function timestamp() {
    const now = new Date();
    const date = [now.getMonth() + 1, now.getDate(), now.getFullYear()].join('/');
    const time = [addZero(now.getHours()), addZero(now.getMinutes()), addZero(now.getSeconds())].join(':');

    return `${date} ${time}`;
}

// Create log file if it doesn't exist
if (! fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '', 'utf-8');
}

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

logStream.write('-'.repeat(50) + '\n');

function log(message) {
    const msg = `${timestamp()} - ${message}\n`;

    logStream.write(msg);
    console.log(msg);
}

module.exports = {
    info: (message) => log(message),
    err: (message) => log(`ERROR: ${message}`),
};