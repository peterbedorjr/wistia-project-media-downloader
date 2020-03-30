const axios = require('axios');

const API_KEY = '';

module.exports = axios.create({
    baseURL: 'https://api.wistia.com/v1/',
    params: {
        access_token: API_KEY,
    },
});