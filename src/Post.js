const dayjs = require('dayjs')

module.exports = class Post {
    constructor(
        id,
        name,
        srcId,
        text,
        atts,
        date,
        pinned,
    ) {
        this.id = id
        this.name = name
        this.srcId = srcId
        this.text = text
        this.atts = atts
        this.date = date
        this.pinned = pinned
    }

    getText() {
        const { firstLine, secondLine } = dateFormatter(this.date)
        const secondLineText = secondLine
            ? `\n${secondLine}`
            : ''
        return ''
            + `[ <code>${this.name}</code> ] @ <i>${firstLine}</i>`
            + secondLineText
            + `\n${this.text}`
            + this.getAttachmentsText()
    }

    getAttachmentsText() {
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
            .filter(att => att.type === 'photo')
            .map(att => att.photo.sizes[att.photo.sizes.length - 1].url)
    }
}

function dateFormatter(vkDate) {
    const date = dayjs(vkDate)
    const today = dayjs()
    const firstLine = date.format('HH:mm')
    let secondLine = ''
    if (today.isSame(date, 'day')) {
        return { firstLine, secondLine }
    } else if (today.isSame(date, 'year')) {
        secondLine = date.format('D MMM')
    } else {
        secondLine = date.format('D MMM YY')
    }
    return { firstLine, secondLine }
}