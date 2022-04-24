require('dotenv').config()
const src = require('./src')

process.on('uncaughtException', err => {
    console.error('Caught exception: ' + err);
});

try {
    src.initBot({ 
        db: src.db(),
        vk: src.vk()
    })
} catch (err) {
    console.error(err)
    process.exit(1)
}