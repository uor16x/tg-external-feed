require('dotenv').config()
const src = require('./src')
try {
    src.initBot({ 
        db: src.db(),
        vk: {
            getGroupData(url) {
                return {
                    name: 'Котокрошка',
                    id: '123',
                    url,
                }
            }
        }
    })
} catch (err) {
    console.error(err)
    process.exit(1)
}