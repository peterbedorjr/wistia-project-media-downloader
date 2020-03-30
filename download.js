const glob = require('glob');
const path = require('path');
const PromisePool = require('@supercharge/promise-pool');
const { spawn } = require('child_process');
const { each, saveProjectInfo } = require('./utils');
const { err, info } = require('./log');

const DIR = path.resolve(__dirname);
const DATA_DIR = path.resolve(DIR, 'data');

module.exports = async function() {
    info('Downloading starting...');

    const projects = glob.sync(`${DATA_DIR}/**/project.json`);

    async function downloadVideo(project, video) {
        info(`Downloading ${video.name} from project ${project.name}`);

        const filename = `${video.name}.mp4`;
        const downloadPath = path.resolve(DATA_DIR, project.name, 'videos', filename);
        const curl = spawn(`curl "${video.url}" --output "${downloadPath}"`, {
            shell: true,
        });

        return new Promise((resolve, reject) => {
            curl.on('exit', (code) => {
                if (code !== 0) {
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    async function processProject(projectPath) {
        const project = require(projectPath);

        info(`Processing ${project.name}`);

        // Filter out any previously downloaded videos
        const videos = project.videos.filter((video) => {
            return ! project.downloaded.list.includes(video.name);
        });

        const { errors } = await PromisePool
            .for(videos)
            .withConcurrency(3)
            .process(async (video) => {
                try {
                    await downloadVideo(project, video);
                    
                    project.downloaded.total = project.downloaded.total + 1;
                    project.downloaded.list.push(video.name);
                } catch (e) {
                    err(e);
                } finally {
                    saveProjectInfo(project, project);
                    
                    info(`Download complete`);
                }
            });

        if (errors.length) {
            errors.forEach(err);
        }
    }

    await each(projects, processProject);
};