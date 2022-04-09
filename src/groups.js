const posts = {}
const feed = {}
const GROUPS_PER_EXECUTE = 20
const DEFAULT_POSTS_COUNT = 3

let vk

const utils = {
    formatSourcesExecuteQuery(sources) {
        return sources.map((source, index) => {
            return `"${sources[index].url}":
                API.wall.get({
                    "domain": "${sources[index].url}",
                    "count": ${sources._count || DEFAULT_POSTS_COUNT},
                    "offset": ${sources._offset || 0},
                    "owner_id": -${sources[index].id}
                })`
        })
    },
    prepateExecuteRequests(formattedSourcesQuery) {
        return this
            .spliceIntoChunks(formattedSourcesQuery, GROUPS_PER_EXECUTE)
            .map(requestsPack => `
                var groups = {
                    ${requestsPack}
                };
                return groups;
            `)
            .map(request => vk.execute(request))    
    },
    mergeExecuteResponses(executeResponses) {
        return executeResponses.reduce((acc, responseItem) => {
            if (responseItem.errors) {
                console.error(responseItem.errors)
            }
            const posts = Object
                .keys(responseItem.response)
                .reduce((postsAcc, key) => {
                    postsAcc[key] = responseItem.response[key].items
                    return postsAcc
                }, {})
            return {
                ...acc,
                ...posts
            }
        }, {})
    },
    async getLastPostRequestArray(sources) {
        try {
            const executeSourceQueries = this.formatSourcesExecuteQuery(sources)
            const executeSourceRequests = this.prepateExecuteRequests(executeSourceQueries)
            const executeResponse = await Promise.all(executeSourceRequests)
            result = mergeExecuteResponses(executeResponse)
        } catch (err) {
            console.error(err)
            throw new Error('Failed to prepare the feed, please try again later')
        }
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
            seen: [],
            index: 0
        }
    },
    next(id) {
        const currFeed = feed[id]
        currFeed.seen.push(currFeed.list[currFeed.index])
        feed[id].index++
        return feed[id]
    }
}

module.exports = _vk => {
    vk = _vk
    return methods
}