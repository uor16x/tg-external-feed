const text = require('./text')
const MAX_COMMENT_TEXT_LENGTH = 500
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

    static getCommentLink(
        ownerId,
        postId,
        offset,
        commentId,
        count
    ) {
        const owner = +ownerId > 0
            ? `-${ownerId}`
            : ownerId
        let link = `https://t.me/${process.env.COMMENTS_BOT_ALIAS}?start=${owner}_${postId}`
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
        this.text = this.text.replace(text.REGEX.COMMENT_REFERENCE(), ($0, $1, $2, $3, $4) => $4)
    }

    getText(singleCommentMode = false) {
        this.replaceTextRefs()
        const maxCommentLength = singleCommentMode
            ? MAX_COMMENT_TEXT_LENGTH * 5
            : MAX_COMMENT_TEXT_LENGTH
        const textTabulated = `${this.text}`.replaceAll('\n', `\n${text.COMMENT.BORDER.TAB()}`)
        if (textTabulated.length > maxCommentLength) {
            this.text = this.text.substring(0, maxCommentLength) + ' ...'
            if (singleCommentMode) {
                this.text += text.COMMENT.TOO_BIG()
            } else {
                this.text += text.COMMENT.VIEW_FULL(
                    Comment.getCommentLink(
                        this.ownerId,
                        this.postId,
                        0,
                        this.id,
                        1
                    )
                )
            }
        }
        if (this.text.length) {
            this.text = `\n${this.text}`
        }
        return this.text
    }

    asText(singleCommentMode = false) {
        const topBorder = `${text.COMMENT.BORDER.LEFT_TOP()}<code>${this.getName()}</code>${text.COMMENT.BORDER.RIGHT_TOP()}`
        const atts = this.getAttachmentsText()
        const threads = this.parseThreads()
        const mainContext = ''
            + this.getText(singleCommentMode)
            + atts
            + (this.likes ? `\n💙 ${this.likes}` : '')
            + (threads ? `\n${threads}` : '')
        return ''
            + topBorder
            + mainContext.replaceAll('\n', `\n${text.COMMENT.BORDER.TAB()}`)
            + `\n`
            + text.COMMENT.BORDER.LEFT_BOT()
    }

    parseThreads() {
        return this.threadCount
            ? text.COMMENT.THREAD(
                Comment.getCommentLink(
                    this.ownerId,
                    this.postId,
                    0,
                    this.id
                ),
                this.threadCount
            )
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
                        acc += text
                            .COMMENT
                            .ATTACHMENT
                            .PHOTO(Comment.getPhotoUrl(att))
                        break
                    case 'video':
                        acc += text
                            .COMMENT
                            .ATTACHMENT
                            .VIDEO(att.video.title)
                        break
                    case 'link':
                        acc += text
                            .COMMENT
                            .ATTACHMENT
                            .LINK(att.link.url, att.link.caption)
                        break
                    case 'audio':
                        acc += text
                            .COMMENT
                            .ATTACHMENT
                            .AUDIO(att.audio.artist, att.audio.title)
                        break
                    case 'file':
                        acc += text
                            .COMMENT
                            .ATTACHMENT
                            .FILE(att.file.title)
                    default:
                        acc =+ text
                            .COMMENT
                            .ATTACHMENT
                            .UNSUPPORTED(att.type)
                }
                return acc
            }, '')
    }
}