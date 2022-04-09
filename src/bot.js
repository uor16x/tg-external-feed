const keyboard = require('./keyboard')
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
            \nPress on the option to delete it.
            `
            :
            `Your sources list is empty.
            \nSend me a link to a vk group to continue.  
            `
    }
}

const _methods = {
    start: db => vk => bot => async msg => {
        const id = msg.chat.id
        db.getOrCreateUser(id)
        await bot.sendMessage(
            id,
            `Welcome, ${msg.chat.first_name}!`,
            { reply_markup: keyboard.start.getMarkup({ resize_keyboard: true }) }
        )
    },
    sources: db => vk => bot => async msg => {
        const id = msg.chat.id

        const sources = db.getSourcesByUserId(id)
        const answerText = utils.getSourcesText(sources, msg.chat.first_name)
        const answerKeyboard = utils.getSourcesReplyMarkup(sources)
        await bot.sendMessage(
            id,
            answerText,
            { 
                reply_markup: answerKeyboard,
                reply_to_message_id: msg.message_id
            }
        )
    },
    update: db => vk => bot => async msg => {
        const id = msg.chat.id

        const sources = db.getSourcesByUserId(id)
        await groups.formFeed(sources)
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
        const id = query.from.id
        try {
            const name = db.deleteSource(id, data)
            const sources = db.getSourcesByUserId(id)
            const replyMarkup = utils.getSourcesReplyMarkup(sources)
            if (!replyMarkup) {
                const text = utils.getSourcesText(sources, query.message.chat.first_name)
                return bot.editMessageText(text, {
                    chat_id: id,
                    message_id: query.message.message_id
                })
            }
            await bot.editMessageReplyMarkup(replyMarkup, {
                chat_id: id,
                message_id: query.message.message_id
            })
            await bot.sendMessage(id, `${name} deleted.`)
        } catch (err) {
            console.error(`Failed to delete the group: ${err}`)
            await bot.sendMessage(id, `Failed to delete the group.`)
        }
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