module.exports = {
    HELP: {
        POSTS: () => {
            return ''
                + 'Welcome!\n'
                + 'This bot could send you posts from vk.com groups you\'d subscribe to.\n'
                + 'To subscribe please sent a link to public vk.com group.\n'
                + 'To view or edit you subscriptions list please use /sources command.\n\n'
                + 'To see comments to a post (if there are any) - press on the \'Comments\' link in the post message.\n'
                + `You will be redirected to @${process.env.COMMENTS_BOT_ALIAS}.\n`
                + 'Press \'Start\' button at the bottom of the screen there to load preselected post comments.'
        },
        COMMENTS: () => {
            return ''
                + 'Welcome!\n'
                + `This bot is used to see vk.com post comments from @${process.env.BOT_ALIAS}\n`
                + 'To see comments - press \'Comments\' link in the post message.\n\n'
                + 'Some comments have Threads.'
                + 'To load the thread - press on the \'Thread\' link in the comment message and \'Start\' button at the bottom of the screen.\n\n'
                + 'Some comments are too bit to be sent with others.'
                + `Such comments have 'View full comment' link.`
                + `Press it and then press the \'Start\' button at the bottom of the screen.`

        }
    },
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
        START: () => new RegExp(/\/start/),
        HELP: () => new RegExp(/\/help/),
        SOURCES: () => new RegExp(/\/sources/),
        REQUEST_DELETE: () => new RegExp(/✘ (.+)/),
        VK: () => new RegExp(/(https?:\/\/(.+?\.)?vk\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/),
        COMMENT_REFERENCE: () => new RegExp(/\[(id(.*)|club(.*))\|(.*?)\]/)
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
            LEFT_TOP: () => '╔═◤ ',
            LEFT_BOT: () => '╚══════',
            RIGHT_TOP: () => ' ◥═╗',
            TAB: () => '│\t\t'
        }
    }
}