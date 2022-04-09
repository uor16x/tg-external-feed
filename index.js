require('dotenv').config()
const src = require('./src')
try {
    src.initBot({ 
        db: src.db(),
        vk: src.vk()
        // vk: {
        //     getGroupData(url) {
        //         // TODO: add vk
        //         return {
        //             name: 'Котокрошка',
        //             id: '123',
        //             url,
        //         }
        //     }
        // }
    })
} catch (err) {
    console.error(err)
    process.exit(1)
}