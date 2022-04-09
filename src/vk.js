const { VK } = require('vk-io')

let vk

const methods = {
    async run() {
        const response = await vk.api.wall.get({
            owner_id: 1
        })

        console.log(response);
    }
}

module.exports = () => {
    if (!vk) {
        vk = new VK({
            token: process.env.VK_TOKEN
        })
    }
    return methods
}