const fs = require('fs');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const api = require('./api');
const sanitize = require('sanitize-filename');
const PromisePool = require('@supercharge/promise-pool');
const { saveProjectInfo } = require('./utils');
const { err, info } = require('./log');

const DIR = path.resolve(__dirname);
const DATA_DIR = path.resolve(DIR, 'data');

async function getProjects() {
    info('Fetching projects');

    try {
        const { data } = await api.get('projects.json');

        info('Projects retrieved');

        return data;
    } catch (e) {
        err(e);
    }
}

async function getProjectMedia(project, page = 1) {
    info(`Fetching media for ${project.name}`);

    try {
        const { data } = await api.get('medias.json', { 
            params: { 
                page,
                project_id: project.id,
            }, 
        });

        info('Project media retrieved');

        return data;
    } catch (e) {
        err(e);
    }
}

async function getAllProjectMedia(project) {
    info(`Fetching all project media for ${project.name}`);

    const pages = Math.ceil(project.mediaCount / 100);
    let media = [];

    for (let page = 1; page <= pages; page += 1) {
        const videos = await getProjectMedia(project, page);

        media = media.concat(videos);
    }

    info('All project media retrieved');

    return media;
}

async function createProjectDirectories(projects) {
    info('Creating project directories');

    projects.forEach(async (project) => {
        const projectDir = path.resolve(DATA_DIR, project.name);

        if (! fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir);
        }

        if (! fs.existsSync(`${projectDir}/videos`)) {
            fs.mkdirSync(`${projectDir}/videos`);
        }

        saveProjectInfo(project, {
            id: project.id,
            name: sanitize(project.name),
            total: project.mediaCount,
            totalSize: 0,
            videos: [],
            downloaded: {
                total: 0,
                list: [],
            },
        }, true);
    });

    info('Project directories created');
}

async function setProjectInfo(project) {
    const media = await getAllProjectMedia(project);
    const projectInfo = require(`${DATA_DIR}/${project.name}/project.json`);

    projectInfo.videos = media.map((video) => {
        const original = video.assets.filter((asset) => asset.type === 'OriginalFile')[0];
        
        return {
            name: sanitize(video.name),
            id: video.id,
            url: original.url.replace('http://embed', 'https://embed-ssl'),
            sizeRaw: original.fileSize,
            size: prettyBytes(original.fileSize),
        };
    });

    projectInfo.totalSizeRaw = projectInfo.videos.reduce((acc, video) => {
        return video.sizeRaw + acc;
    }, 0);

    projectInfo.totalSize = prettyBytes(projectInfo.totalSizeRaw);

    saveProjectInfo(project, projectInfo);
}

module.exports = async function() {
    info('Starting...');

    if (! fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }

    const projects = await getProjects();

    await createProjectDirectories(projects);

    const { errors } = await PromisePool
        .for(projects)
        .withConcurrency(5)
        .process(setProjectInfo);

    if (errors.length) {
        errors.forEach(err);
    }
};