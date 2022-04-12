const keyboard = require('./keyboard')
const dayjs = require('dayjs')
const vkRegex = /(https?:\/\/(.+?\.)?vk\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/

let groups
const utils = {
    getSourcesReplyMarkup(sources) {
        return sources.length
            ? keyboard
                .sources(sources)
                .getMarkup({ resize_keyboard: true })
            : undefined
    },
    getSourcesText(sources, firstName) {
        return sources.length
            ? 
            `Here is your sources list, ${firstName}!
            \nPress on the option to view posts.
            `
            :
            `Your sources list is empty.
            \nSend me a link to a vk group to continue.  
            `
    },
    attachmentFormatter(att) {
        if (att.type === 'photo') {
            return ''
        }
        // TODO: parse atts
        return `${att.type}\n`
    },
    getPostPhotos(post) {
        return post.atts
            .filter(att => att.type === 'photo')
    },
    formatPost(post) {
        const atts = post.atts
            ? `\n${post.atts.reduce((acc, att) => {
                acc += this.attachmentFormatter(att)
                return acc
            }, '')}`
            : ''
        return `[${post.name}]\n`
            + `${this.dateFormatter(post.date)}\n`
            + `\n${post.text}\n`
            + atts
            + '\n/next'
    },
    dateFormatter(vkDate) {
        const date = dayjs(vkDate * 1000)
        const today = dayjs()
        if (today.isSame(date, 'day')) {
            return date.format('@ HH:mm')
        }
        if (today.isSame(date, 'year')) {
            return date.format('D MMM @ HH:mm')
        }
        return date.format('D MMM YYYY @ HH:mm')
    }
}

const _methods = {
    start: db => vk => bot => async msg => {
        const id = msg.chat.id
        // TODO: hello message with help
        await bot.sendMessage(
            id,
            `Welcome, ${msg.chat.first_name}!`,
            // { reply_markup: keyboard.menu(null).getMarkup({ resize_keyboard: true }) }
        )
    },
    sources: db => vk => bot => async msg => {
        const id = msg.chat.id

        // TODO: sources list as keyboard
        // const sources = db.getSourcesByUserId(id)
        // const answerText = utils.getSourcesText(sources, msg.chat.first_name)
        // const answerKeyboard = utils.getSourcesReplyMarkup(sources)
        // await bot.sendMessage(
        //     id,
        //     answerText,
        //     { 
        //         reply_markup: answerKeyboard,
        //         reply_to_message_id: msg.message_id
        //     }
        // )
    },
    update: db => vk => bot => async msg => {
        // TODO: remove this method
        // const id = msg.chat.id

        // const feedMsg = await bot.sendMessage(
        //     id,
        //     'Preparing your feed...'
        // )
        // const sources = db.getSourcesByUserId(id)
        // const post = await groups.formFeed(id, sources)
        // const feedText = utils.formatPost(post)

        // await bot.sendMediaGroup(
        //     id,
        //     [{
        //         caption: feedText,
        //         type: 'photo',
        //         media: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
        //     }, {
        //         type: 'photo',
        //         media: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
        //     }, {
        //         type: 'photo',
        //         media: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
        //     }]
        // )
        // await bot.sendMessage(
        //     id,
        //     '➤➤➤',
        //     {
        //         reply_markup: keyboard
        //             .next
        //             .getMarkup({ resize_keyboard: true })
        //     }
        // )

        // TODO: refactor to separated method
        // if (post.atts) {
        //     const photos = utils.getPostPhotos(post)
        //     if (photos.length) {
        //         await bot.sendMediaGroup(
        //             id,
        //             [{
        //                 type: 'photo',
        //                 media: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
        //             }, {
        //                 type: 'photo',
        //                 media: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
        //             }, {
        //                 type: 'photo',
        //                 media: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
        //             }]
        //         )
        //     }
        // }

        // bot.editMessageText(feedText, {
        //     chat_id: id,
        //     message_id: feedMsg.message_id,
        //     reply_markup: keyboard
        //         .next
        //         .getMarkup({ resize_keyboard: true })
        // })
    },
    addSource: db => vk => bot => async msg => {
        const id = msg.chat.id
        const url = msg.text
        const msg_id = msg.message_id

        const progressMsg = await bot.sendMessage(
            id,
            `Processing...`,
            { reply_to_message_id: msg_id }
        )

        let groupData = null
        try {
            groupData = await vk.getGroupData(url)
        } catch (groupDataReceiveErr) {
            return bot.editMessageText(`Failed to process the group: ${groupDataReceiveErr.message}`, {
                chat_id: id,
                message_id: progressMsg.message_id
            })
        }

        try {
            db.addSource(id, groupData)
        } catch (saveSourceErr) {
            return bot.editMessageText(`Failed to save the source: ${saveSourceErr.message}`, {
                chat_id: id,
                message_id: progressMsg.message_id
            })
        }
        bot.editMessageText(`Processing done.\n${groupData.name} saved.`, {
            chat_id: id,
            message_id: progressMsg.message_id
        })
    },
    deleteSource: db => vk => bot => async ({ data, query }) => {
        // TODO: remove user from sources arr
        // const id = query.from.id
        // try {
        //     const name = db.deleteSource(id, data)
        //     const sources = db.getSourcesByUserId(id)
        //     const replyMarkup = utils.getSourcesReplyMarkup(sources)
        //     if (!replyMarkup) {
        //         const text = utils.getSourcesText(sources, query.message.chat.first_name)
        //         return bot.editMessageText(text, {
        //             chat_id: id,
        //             message_id: query.message.message_id
        //         })
        //     }
        //     await bot.editMessageReplyMarkup(replyMarkup, {
        //         chat_id: id,
        //         message_id: query.message.message_id
        //     })
        //     await bot.sendMessage(id, `${name} deleted.`)
        // } catch (err) {
            // console.error(`Failed to delete the group: ${err}`)
            // await bot.sendMessage(id, `Failed to delete the group.`)
        // }
    }
}

let bot
module.exports = function({ db, vk }) {
    if (!bot) {
        const _bot = new (require('node-telegram-bot-api'))(process.env.BOT_TOKEN, { polling: true })
        const methods = getConfiguredMethods(db, vk, _bot, _methods)
        configureBot(_bot, methods)
        bot =_bot
    }
    if (!groups) {
        groups = require('./groups')(vk)
    }
    return bot
}

function getConfiguredMethods(db, vk, bot, methods) {
    return Object.keys(methods).reduce((acc, key) => {
        acc[key] = methods[key](db)(vk)(bot)
        return acc
    }, {})
}

function configureBot(bot, methods) {
    bot.onText(/\/start/, methods.start)
    bot.onText(/Sources/, methods.sources)
    bot.onText(/Update/, methods.update)
    bot.onText(vkRegex, methods.addSource)


    bot.on('callback_query', async query => {
        const [ action, data ] = query.data.split(':')
        const callback = methods[action]
        if (!callback) {
            return console.error(`Cant find such callback: ${action}`)
        }
        bot.answerCallbackQuery(query.id, 'Processing...')
        await callback({ query, data })
    })
}