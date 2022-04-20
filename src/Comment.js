const BORDERS = {
    LEFT_TOP: '╔═◤ ',
    LEFT_BOT: '╚══════',
    RIGHT_TOP: ' ◥═╗',
    TAB: '│\t\t'
}
const MAX_NAME_LENGTH = 20

module.exports = class Comment {
    constructor(
        ownerId,
        postId,
        fromId,
        id,
        text,
        atts,
        thread,
        likes,
        sendersData,
    ) {
        this.ownerId = ownerId
        this.postId = postId
        this.fromId = fromId
        this.id = id
        this.text = text
        this.atts = atts
        this.threadCount = thread && thread.count
        this.likes = likes && likes.count
        this.sendersData = Comment.formatSendersData(sendersData)
    }

    static formatSendersData(data) {
        return data.reduce((acc, item) => {
            acc[item.id] = item.name
                ? item.name
                : `${item.first_name} ${item.last_name}`
            return acc
        }, {})
    }

    getName() {
        return this.sendersData
        && this.sendersData[Math.abs(this.fromId)]
        && this.sendersData[Math.abs(this.fromId)]
            .substring(0, MAX_NAME_LENGTH) + '...'
        || 'DELETED'
    }

    getText() {
        const topBorder = `${BORDERS.LEFT_TOP}<code>${this.getName()}</code>${BORDERS.RIGHT_TOP}`
        const atts = this.parseAtts()
        const threads = this.parseThreads()
        const mainContext = ''
            + BORDERS.TAB
            // TODO: parse name inside comment text
            + this.text
            + (atts ? `\n${atts}` : '')
            + (this.likes ? `\n♡ ${this.likes}` : '')
            + (threads ? `\n${threads}` : '')
        return ''
            + topBorder
            + `\n`
            + mainContext.replaceAll('\n', `\n${BORDERS.TAB}`)
            + `\n`
            + BORDERS.LEFT_BOT
    }

    parseThreads() {
        return this.threadCount
            ? `<a href="https://t.me/${process.env.COMMENTS_BOT_ALIAS}?start=${this.ownerId}_${this.postId}_${0}_${this.id}">Thread [${this.threadCount}]</a>`
            : ''
    }

    parseAtts() {
        if (!this.atts) {
            return ''
        }
        // TODO: parse atts
        return `<b>Attachments</b> [${this.atts.length}]`
    }
}