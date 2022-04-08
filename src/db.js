const { JsonDB } = require('node-json-db');

let db = null
function checkDB() {
    if (!db) {
        throw new Error('DB has to be initialized first')
    }
}

const methods = {
    getUserById(id) {
        let user = null
        try {
            user = db.getData(`/user/${id}`)
        } catch (err) {
            console.error(err)
        }
        return user
    },
    getOrCreateUser(id) {
        checkDB()
        let user = this.getUserById(id)
        if (!user) {
            user = {
                id,
                sources: [],
                dateStarted: new Date().toISOString()
            }
            db.push(`/user/${id}`, user)
        }
        return user
    },
    addSource(id, data) {
        checkDB()
        try {
            const sources = this.getSourcesByUserId(id)
            const currSrc = sources.find(item => item.id === data.id)
            if (!currSrc) {
                db.push(`/user/${id}/sources[]`, data)
            }
        } catch (err) {
            console.error(err)
            throw new Error('Failed to add the source to DB')
        }
    },
    deleteSource(id, srcId) {
        checkDB()
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
        checkDB()
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
     return methods
}