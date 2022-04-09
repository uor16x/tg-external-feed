const posts = {}
const feed = {}
const groupsPerExecute = 20

let vk

const utils = {
    async getLastPostRequestArray(sources) {
        const requestTemplate = `
            var groups = {};
        `
        const requestTextsArray = sources.map((source, index) => {
            return `"${sources[index].url}": API.wall.get({ "domain": "${sources[index].url}","count": 1, "owner_id": -${sources[index].id} })`
        })
        const requests = this
            .spliceIntoChunks(requestTextsArray, groupsPerExecute)
            .map(requestsPack => `
                var groups = {
                    ${requestsPack}
                };
                return groups;
            `)
            .map(request => vk.execute(request))
        const result = await Promise
            .all(requests)
            .catch(err => {
                console.error(err)
            })

        console.log(result)
    },
    spliceIntoChunks(arr, chunkSize) {
        const result = [];
        while (arr.length > 0) {
            const chunk = arr.splice(0, chunkSize);
            result.push(chunk);
        }
        return result;
    }
}
const methods = {
    async formFeed(sources) {
        await utils.getLastPostRequestArray(sources)
    },
    setFeed(id, list) {
        feed[id] = {
            list,
            index: 0
        }
    },
    next(id) {
        feed[id].index++
        // TODO: check if download needed
        return feed[id]
    }
}

module.exports = _vk => {
    vk = _vk
    return methods
}