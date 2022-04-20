const Broadcaster = require('./Broadcaster')
const Post = require('./Post')

module.exports = async (bot, vk, db) => {
    const allSourcesObj = db.getAllSourcesObj()
    const allSourcesArr = db.getAllSourcesArr()
    const sourcesQueries = formatSourcesQueries(allSourcesArr)
    const executeRequestQueries = prepareExecuteRequests(sourcesQueries, vk.execute)
    let executeResponses = []
    try {
        executeResponses = await Promise.all(executeRequestQueries)
    } catch (err) {
        // TODO: retry
        console.error(err)
    }
    const walls = mergeExecuteResults(executeResponses, allSourcesArr)
    const fromTime = Broadcaster.lastBroadcastTime || Date.now() - 1000 * 60 * 60 * 128
    const posts = formatListFromWalls(walls, fromTime)
    const messages = mergePostsWithReceivers(bot, posts, allSourcesObj)
    console.log(`Formed ${messages.length} messages`)
    return messages
}

function formatSourcesQueries(sources) {
    return sources.map(source => {
        return `"${source.id}":
            API.wall.get({
                "count": 30,
                "owner_id": -${source.id},
                "domain": "${source.url}"
            })`
    })
}

function prepareExecuteRequests(formattedSourcesQueries, method) {
    return spliceIntoChunks(formattedSourcesQueries, 20)
        .map(requestsPack => `
            var groups = {
                ${requestsPack}
            };
            return groups;
        `)
        .map(request => method(request))
}

function mergeExecuteResults(executeResponses, sources) {
    return executeResponses.reduce((acc, executeResponse) => {
        if (executeResponse.errors) {
            console.error(executeResponse.errors)
        }
        const requestWalls = Object
            .keys(executeResponse.response)
            .reduce((srcAcc, srcId) => {
                const dbSource = sources.find(source => source.id.toString() === srcId)
                const name = dbSource && dbSource.name || '???'
                srcAcc[srcId] = {
                    posts: executeResponse.response[srcId].items,
                    id: srcId,
                    name
                }
                return srcAcc
            }, {})
        return {
            ...acc,
            ...requestWalls
        }
    }, [])
}

function formatListFromWalls(walls, afterDate) {
    return Object.keys(walls).reduce((acc, srcId) => {
        const currSrcPosts = walls[srcId].posts
        acc.push(...currSrcPosts.map(post => new Post(
            post.id,
            walls[srcId].name,
            srcId,
            post.text,
            post.attachments,
            post.date * 1000,
            post.is_pinned
        )))
        return acc
    }, [])
    .filter(post => !post.pinned)
    // .filter(post => post.date > afterDate)
    .sort((postA, postB) => postB.date - postA.date)
}

function mergePostsWithReceivers(bot, posts, sources) {
    return posts.reduce((acc, post) => {
        acc.push(
            ...sources[post.srcId].receivers.map(
                receiver => ({
                    id: post.id,
                    receiver,
                    post: post.srcId,
                    method: () => sendPost(bot, receiver, post)
                })
            )
        )
        return acc
    }, [])
}

/**
 * Method which splits array into subarrays of given same length
 * @param {[any]} arr Array of items
 * @param {int} chunkSize positive integer number
 * @returns array of arrays
 */
function spliceIntoChunks(arr, chunkSize) {
    const result = [];
    while (arr.length > 0) {
        const chunk = arr.splice(0, chunkSize);
        result.push(chunk);
    }
    return result;
}

async function sendPost(bot, receiverId, post) {
    Broadcaster.receiversLastRequestTime[receiverId] = Date.now()
    console.log(`R ${new Date().toLocaleTimeString()}: ${receiverId} <= ${post.id}`)
    
    // const photos = post.getPhotos()
    // if (photos.length) {
    //     const mediaGroupItems = photos.map(media => ({
    //         parse_mode: 'HTML',
    //         type: 'photo',
    //         media,
    //     }))
    //     mediaGroupItems[0].caption = post.getText()
    //     await bot.sendMediaGroup(
    //         receiverId,
    //         mediaGroupItems
    //     )
    // } else {
    //     return bot.sendMessage(
    //         receiverId,
    //         post.getText(),
    //         { parse_mode: 'HTML' }
    //     )
    // }
}