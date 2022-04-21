const BORDERS = {
    LEFT_TOP: '╔═◤ ',
    LEFT_BOT: '╚══════',
    RIGHT_TOP: ' ◥═╗',
    TAB: '│\t\t'
}
const MAX_COMMENT_TEXT_LENGTH = 500
const MAX_NAME_LENGTH = 20
const REF_REGEX = new RegExp(/\[(id(.*)|club(.*))\|(.*?)\]/)

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

    static getCommentLink(
        ownerId,
        postId,
        offset,
        commentId,
        count
    ) {
        let link = `https://t.me/${process.env.COMMENTS_BOT_ALIAS}?start=${ownerId}_${postId}`
        if (offset !== undefined) {
            link += `_${offset}`
        }
        if (commentId !== undefined) {
            link += `_${commentId}`
        }
        if (count !== undefined) {
            link += `_${count}`
        }
        return link
    }

    getName() {
        const name = this.sendersData[Math.abs(this.fromId)] || 'DELETED'
        if (name > MAX_NAME_LENGTH) {
            return name.substring(0, MAX_NAME_LENGTH) + '...'
        }
        return name
    }

    replaceTextRefs() {
        this.text = this.text.replace(REF_REGEX, ($0, $1, $2, $3, $4) => $4)
    }

    getText(singleCommentMode = false) {
        this.replaceTextRefs()
        const textTabulated = `${this.text}`.replaceAll('\n', `\n${BORDERS.TAB}`)
        const maxCommentLength = singleCommentMode
            ? MAX_COMMENT_TEXT_LENGTH * 5
            : MAX_COMMENT_TEXT_LENGTH
        if (textTabulated.length > maxCommentLength) {
            this.text = this.text.substring(0, maxCommentLength) + ' ...'
            if (singleCommentMode) {
                this.text += '\n<b> ⚠️ This comment is to big to be sent ⚠️</b>'
            } else {
                this.text += `\n<a href="${Comment.getCommentLink(this.ownerId, this.postId, 0, this.id, 1)}">Load full comment</a>`
            }
        }
        return this.text
    }

    asText(singleCommentMode = false) {
        const topBorder = `${BORDERS.LEFT_TOP}<code>${this.getName()}</code>${BORDERS.RIGHT_TOP}`
        const atts = this.getAttachmentsText()
        const threads = this.parseThreads()
        const mainContext = ''
            + BORDERS.TAB
            // TODO: parse name inside comment text
            + this.getText(singleCommentMode)
            + atts
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
            ? `<a href="${Comment.getCommentLink(this.ownerId, this.postId, 0, this.id)}">Thread [${this.threadCount}]</a>`
            : ''
    }

    static getPhotoUrl(att) {
        return att
            && att.photo
            && att.photo.sizes
            && att.photo.sizes.length
            && att.photo.sizes[att.photo.sizes.length - 1]
            && att.photo.sizes[att.photo.sizes.length - 1].url
    }

    getAttachmentsText() {
        if (!this.atts) {
            return ''
        }
        return this.atts
            .reduce((acc, att) => {
                switch (att.type) {
                    case 'photo':
                        acc += `\n<a href="${Comment.getPhotoUrl(att)}">Photo</a>`
                        break
                    case 'video':
                        acc += `\n<b>Video: </b> ${att.video.title}`
                        break
                    case 'link':
                        acc += '\n<b>Link: </b> \n'
                            + `<a href="${att.link.url}">${att.link.caption}</a>`
                        break
                    case 'audio':
                        acc += `\n<b>Audio: </b> ${att.audio.artist} - ${att.audio.title}`
                        break
                    case 'file':
                        acc += `\n<b>File: </b> ${att.file.title}`
                    default:
                        acc =+ `\nUnsupported attachment: ${att.type}`
                }
                return acc
            }, '')
    }
}