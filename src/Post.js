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
            ? `${secondLine}\n`
            : ''
        return ''
            + `[ <code>${this.name}</code> ] @ <i>${firstLine}</i>\n`
            + secondLineText
            + `\n${this.text}`
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