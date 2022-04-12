const { JsonDB } = require('node-json-db');

let db = null

const methods = {
    getSourceById(id) {
        let source = null
        try {
            source = db.getData(`/source/${id}`)
        } catch (getErr) {
            console.log(`Source with id ${id} not found`)
        }
        return source
    },
    getOrCreateSource(sourceData) {
        let source = this.getSourceById(sourceData.id)
        if (!source) {
            source = {
                ...sourceData,
                receivers: []
            }
            db.push(`/source/${sourceData.id}`, source)
        }
        return source
    },
    addSource(receiverId, sourceData) {
        try {
            const source = this.getOrCreateSource(sourceData)
            const isCurrentReceiverPresent = source.receivers.find(rcv => rcv === userId)
            if (!isCurrentReceiverPresent) {
                db.push(`/source/${source.id}/receivers[]`, receiverId)
            }
        } catch (err) {
            console.error(err)
            throw new Error('Failed to add the source entry to DB')
        }
    },
    getSourceByFullName(fullName) {
        const sourcesData = db.getData('/source')
        const allSources = Object.keys(sourcesData).reduce((acc, srcId) => {
            acc.push(sourcesData[srcId])
            return acc
        }, [])
        const currSource = allSources.find(src => src.name === fullName)
        if (!currSource) {
            throw new Error('No such source')
        }
        return currSource
    },
    deleteSource(userId, srcId) {
        try {
            let source = this.getSourceById(srcId)
            source.receivers = source.receivers
                .filter(rcvId => rcvId !== userId)
            const path = `/source/${srcId}`
            if (!source.receivers.length) {
                db.delete(path)
            } else {
                db.push(path, source)
            }
        } catch (err) {
            console.error(err)
            throw new Error('Failed to delete the source from DB')
        }
    },
    getSourcesByUserId(id) {
        let result = []
        try {
            result = db.getData(`/user/${id}/sources`)
        } catch (err) {
            console.error(err)
        }
        return result
    },
}

module.exports = () => {
    if (!db) {
        db = new JsonDB("db", true, true, '/')
     }
     // TODO: add err handling
     return methods
}