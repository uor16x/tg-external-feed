const posts = {}
const feed = {}
const GROUPS_PER_EXECUTE = 20
const DEFAULT_POSTS_COUNT = 3

const state = {}

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
    mergeExecuteResponses(executeResponses, sources) {
        return executeResponses.reduce((acc, responseItem) => {
            if (responseItem.errors) {
                console.error(responseItem.errors)
            }
            const posts = Object
                .keys(responseItem.response)
                .reduce((postsAcc, key) => {
                    const dbSource = sources.find(source => source.url === key)
                    const name = dbSource && dbSource.name || key
                    postsAcc[key] = {
                        ...responseItem.response[key],
                        name
                    }
                    return postsAcc
                }, {})
            return {
                ...acc,
                ...posts
            }
        }, {})
    },
    async getWalls(sources) {
        try {
            const executeSourceQueries = this.formatSourcesExecuteQuery(sources)
            const executeSourceRequests = this.prepateExecuteRequests(executeSourceQueries)
            const executeResponse = await Promise.all(executeSourceRequests)
            result = this.mergeExecuteResponses(executeResponse, sources)
        } catch (err) {
            console.error(err)
            throw new Error('Failed to prepare the feed, please try again later')
        }
        return result
    },
    calculateGroupsRefillData(walls) {
        // TODO: refill logic
        return Object.keys(walls).map(group => {
            
        }, {})
    },
    formatListFromWalls(walls) {
        return Object.keys(walls).reduce((acc, groupKey) => {
            const currGroupPosts = walls[groupKey].items
            acc.push(...currGroupPosts.map(post => ({
                src: groupKey,
                name: walls[groupKey].name,
                id: post.id,
                pinned: post.is_pinned,
                atts: post.attachments,
                text: post.text,
                date: post.date
            })))
            return acc
        }, [])
        .filter(post => !post.pinned)
        .sort((postA, postB) => postB.date - postA.date)
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
    async setSource(id, src) {
        const wall = getWall(src)
        state[id] = {
            src,
            wall,
            index: 0,
        }
        return wall
    },

    async formFeed(id, sources) {
        const walls = await utils.getWalls(sources)
        const list = utils.formatListFromWalls(walls)
        return this.setFeed(id, list)
        // TODO: call refill
    },
    setFeed(id, list) {
        feed[id] = {
            list,
            seen: [],
            index: 0
        }
        return list[0]
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