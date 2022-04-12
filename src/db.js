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
    deleteSource(id, srcId) {
        let name = null
        try {
            const sources = this.getSourcesByUserId(id)
            const index = sources.findIndex(item => item.id)
            if (index > -1) {
                const groupData = sources[index]
                name = groupData.name
                db.delete(`/user/${id}/sources[${index}]`)
            }
        } catch (err) {
            console.error(err)
            throw new Error('Failed to add the source to DB')
        }
        return name
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