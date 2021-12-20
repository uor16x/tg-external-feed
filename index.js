require('dotenv').config()
const src = require('./src')
const bot = src.initBot({ db: {}, vk: {} })