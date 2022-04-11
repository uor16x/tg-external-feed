
module.exports = {
    run
}

class Broadcaster {
    static REQUESTS_PER_SECOND = 25 // 25 requests per second
    static RECEIVER_REQUEST_THROTTLE_MS = 3500 // max 1 request per 3.5 sec to each receiver
    static MIN_BROADCAST_INTERVAL = 1000 * 60 * 5 // 5m: minimal time interval between two broadcasting series

    static receiversLastRequestTime = {} // dictionary to hold last request time for each receiver
    static stop = false // variable to break the loop
    static lastBroadcastTime = null // 

    /**
     * Method to broadcast requests
     * @param {[{ id, receiver, post, method }]} queue List of request calls
     * @param {Function} dataFetch callback to fetch the data for next broadcast
     */
    static async broadcast(queue, dataFetch) {
        if (this.stop) return null // check for stop signal
        if (!queue || !queue.length) {
            if (this.lastBroadcastTime) { // check if there was prev broadcasts
                const timeTillNextBroadcast = Date.now() - this.lastBroadcastTime
                if (timeTillNextBroadcast < this.MIN_BROADCAST_INTERVAL) { // check if pause till next broadcast needed
                    await this.pause(this.MIN_BROADCAST_INTERVAL - timeTillNextBroadcast)
                }
            }
            const data = await dataFetch() // fetching data for next iteration
            this.lastBroadcastTime = null // nullify last broadcast date so it could be set while broadcasting
            return this.broadcast(data, dataFetch)
        }
        if (!this.lastBroadcastTime) this.lastBroadcastTime = Date.now() // all checks passed, start broadcast loop
        const currentChunk = queue
            .filter(request => this.isReadyToBeSent(request.receiver)) // get only requests, which could be executed
            .splice(0, this.REQUESTS_PER_SECOND) // get first N which would be executed in current second
            .filter((value, index, self) => { // remove duplicates of receiver
                return index === self.findIndex((innerValue) => (
                    innerValue.receiver === value.receiver
                ))
            })

        Promise // Execute all chosen requests
            .all(currentChunk.map(request => request.method()))
            .catch(chunkErr => console.error(chunkErr))
        const newQueue = queue.filter( // form new queue, without already executed items
            qItem => !currentChunk.find(ccItem => ccItem.id === qItem.id)
        )
        await this.pause(1000) // wait one second till next iteration
        return this.broadcast(newQueue, dataFetch) // recursively start next iteration
    }

    /**
     * Method to pause the async execution
     * @param {int} ms Time in milliseconds to pause
     * @returns Promise wrapper for timeout
     */
    static pause(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Method to check whether the message to given receiver could be sent
     * @param {uuid} receiverId Id of receiver
     * @returns bool value which defines whether request to the receiver could be already sent
     */
    static isReadyToBeSent(receiverId) {
        const currLastTime = this.receiversLastRequestTime[receiverId]
        return !currLastTime
            || (Date.now() - currLastTime) > this.RECEIVER_REQUEST_THROTTLE_MS
    }
}

async function VK_REQUEST(id, arg) {
    Broadcaster.receiversLastRequestTime[id] = Date.now()
    console.log(`R ${new Date().toLocaleTimeString()}: ${id} <= ${arg}`)
    return `Result ${arg}`
}

function dataFetch() {
    const bData = []
    const postsNumber = Math.floor(Math.random() * 10) + 3
    const usersNumber = Math.floor(Math.random() * 15) + 5
    for (let post = 0; post <= postsNumber; post+=1) {
        const postData = {
            id: post,
            receivers: []
        }
        for (let user = 0; user <= usersNumber; user+=1) {
            postData.receivers.push(user)
        }
        bData.push(postData)
    }
    const result = bData.reduce((acc, post) => {
        acc.push(
            ...post.receivers.map(
                receiver => ({
                    id: `${receiver}<${post.id}`,
                    receiver,
                    post: post.id,
                    method: () => VK_REQUEST(receiver, post.id)
                })
            )
        )
        return acc
    }, [])
    console.log(`Formed: ${result.length} messages to be sent`)
    return result
}

async function run() {
    const startDate = Date.now()
    Broadcaster.broadcast(null, dataFetch)
    console.log(`Done. Spent ${Date.now() - startDate}ms.`)
}