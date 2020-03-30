const axios = require('axios');
const { API_KEY: access_token } = process.env;

module.exports = axios.create({
    baseURL: 'https://api.wistia.com/v1/',
    params: { access_token },
});