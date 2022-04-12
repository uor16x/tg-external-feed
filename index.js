require('dotenv').config()
const src = require('./src')
try {
    src.initBot({ 
        db: src.db(),
        vk: src.vk()
    })
} catch (err) {
    console.error(err)
    process.exit(1)
}