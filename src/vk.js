const { VK } = require('vk-io')
const { URL } = require('url')

let vk

const utils = {
    getScreenName(fullUrl) {
        let url = ''
        try {
            url = new URL(fullUrl)
            if (!url.pathname) {
                throw new Error('Pathname missing')
            }
        } catch (parseErr) {
            console.error(parseErr)
            throw new Error('Failed to parse the link')
        }
        
        return url.pathname.replace('/', '')
    }
}

const methods = {
    async getGroupData(fullUrl) {
        const url = utils.getScreenName(fullUrl)
        let response = null
        try {
            response = await vk.api.groups.getById({
                group_id: url
            })
            if (!response || !response.length) {
                throw new Error('Response is empty')
            }
        } catch (requestErr) {
            console.error(`Failed to get group data: ${response}`)
            throw new Error('Failed to find it')
        }
        const group = response[0]
        if (group.is_closed) {
            throw new Error('Page is private')
        }
        return {
            id: group.id,
            url: group.screen_name,
            name: group.name
        }
    },
    async getWall(src, offset) {
        return vk.api.wall.get({
            domain: src.url,
            count: 10,
            offset: offset || 0,
            owner_id: `-${src.id}`
        })
    },
    async execute(code) {
        return vk.api.execute({ code })
    }
}



module.exports = () => {
    if (!vk) {
        vk = new VK({
            token: process.env.VK_TOKEN
        })
    }
    // TODO: add err handling
    return methods
}