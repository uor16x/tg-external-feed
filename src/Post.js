const dayjs = require('dayjs')
const Comment = require('./Comment')
const MAX_IMAGE_CAPTION_LENGTH = 800

module.exports = class Post {
    constructor(
        id,
        name,
        srcId,
        text,
        atts,
        date,
        commentsCount,
        pinned,
    ) {
        this.id = id
        this.name = name
        this.srcId = srcId
        this.text = text
        this.atts = atts
        this.date = date
        this.commentsCount = commentsCount
        this.pinned = pinned
    }

    asText(full = false) {
        return ''
            + `[ <code>${this.name}</code> ] @ <i>${dateFormatter(this.date)}</i>`
            + `\n${this.getText()}`
            + this.getAttachmentsText()
            + this.getCommentsLink()
    }

    getText(full = false) {
        // TODO: repost parse
        return full 
            ? this.text
            : (
                this.text.length > MAX_IMAGE_CAPTION_LENGTH - 3 
                ? this.text.substr(0, MAX_IMAGE_CAPTION_LENGTH) + '...'
                : this.text
            )

    }

    getCommentsLink() {
        return this.commentsCount
            ? `\n<a href="${Comment.getCommentLink(this.srcId, this.id)}">Comments [${this.commentsCount}]</a>`
            : ''
    }

    getAttachmentsText() {
        if (!this.atts) {
            return ''
        }
        return this.atts
            .filter(att => att.type !== 'photo')
            .reduce((acc, att) => {
                switch (att.type) {
                    case 'video':
                        acc += `\nVideo: ${att.video.title}`
                        break
                    case 'link':
                        acc += ('\nLink: \n'
                            + `<b>${att.link.caption}</b> >> `
                            + `<pre>${att.link.description}</pre>\n`
                            + `<a href="${att.link.url}">Open</a>`
                        )
                        break
                    case 'audio':
                        acc += `\nAudio: ${att.audio.artist} - ${att.audio.title}`
                        break
                    case 'file':
                        acc += `\nFile: ${att.file.title}`
                    default:
                        acc =+ `\nUnsupported attachment: ${att.type}`
                }
                return acc
            }, '')
    }

    getPhotos() {
        return this.atts 
            ? this.atts
                .filter(att => att.type === 'photo')
                .map(att => att.photo.sizes[att.photo.sizes.length - 1].url)
            : []
    }
}

function dateFormatter(vkDate) {
    const date = dayjs(vkDate)
    const today = dayjs()
    if (today.isSame(date, 'day')) {
        return date.format('HH:mm')
    } else if (today.isSame(date, 'year')) {
        return date.format('D MMM')
    } else {
        return date.format('D MMM YY')
    }
}