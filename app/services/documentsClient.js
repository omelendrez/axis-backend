const axios = require('axios')

const api = axios.create({
  baseURL: process.env.DOCUMENTS_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

module.exports = { api }
