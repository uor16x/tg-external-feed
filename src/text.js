module.exports = {
    SOURCES: {
        EMPTY: () => 'Your sources list is empty.\nSend me a link to a vk group to continue.',
        HINT: () => 'Use the keyboard buttons to delete a group.',
        PROCESSING: () => 'Processing...',
        PROCESSING_FAILED: msg => `Failed to process the group: ${msg}`,
        SAVING_FAILED: msg => `Failed to save the source: ${msg}`,
        SAVED: name => `Done. \n${name} saved`,
        UPDATED: () => 'Sources list updated.'
    },
    DELETE: {
        NOT_FOUND: name => `Unable to find ${name} source`,
        NOT_SUBSCRIBED: name => `You're not currently subscribed to ${name}.`,
        CONFIRM: name => `Click the button below if you want to delete ${name} from your feed.`,
        FAILED: () => 'Failed to delete'
    },
    REGEX: {
        START: () => /\/start/,
        SOURCES: () => /\/sources/,
        REQUEST_DELETE: () => /✘ (.+)/,
        VK: () => /(https?:\/\/(.+?\.)?vk\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/,
        COMMENT_REFERENCE: () => /\[(id(.*)|club(.*))\|(.*?)\]/
    },
    COMMENT: {
        TOO_BIG: () => '\n<b> ⚠️ This comment is to big to be sent ⚠️</b>',
        VIEW_FULL: link => `\n<a href="${link}">View full comment</a>`,
        THREAD: (link, count) => `<a href="${link}">Thread [${count}]</a>`,
        ATTACHMENT: {
            PHOTO: link => `\n<a href="${link}">Photo</a>`,
            VIDEO: title => `\n<b>Video: </b> ${title}`,
            LINK: (url, caption) => `\n<b>Link: </b> \n<a href="${url}">${caption}</a>`,
            AUDIO: (artist, title) => `\n<b>Audio: </b> ${artist} - ${title}`,
            FILE: title => `\n<b>File: </b> ${title}`,
            UNSUPPORTED: type => `\nUnsupported attachment: ${type}`
        },
        BORDER: {
            LEFT_TOP: '╔═◤ ',
            LEFT_BOT: '╚══════',
            RIGHT_TOP: ' ◥═╗',
            TAB: '│\t\t'
        }
    }
}