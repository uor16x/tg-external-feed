const nodeBotApi = require('node-telegram-bot-api')
const feed = require('./feed')
const Broadcaster = require('./Broadcaster')
const Comment = require('./Comment')
const keyboard = require('./keyboard')
const dayjs = require('dayjs')
const vkRegex = /(https?:\/\/(.+?\.)?vk\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/

const TEXT = {
    SOURCES_EMPTY: 'Your sources list is empty.\nSend me a link to a vk group to continue.'
}

const utils = {
    async sendSources(
        bot,
        id,
        sources,
        successMsg,
        reply_to
    ) {
        if (!sources.length) {
            return await bot.sendMessage(
                id,
                TEXT.SOURCES_EMPTY,
                { 
                    reply_markup: keyboard.sources(sources),
                    reply_to_message_id: msg_id
                }
            )
        }
        await bot.sendMessage(
            id,
            successMsg,
            { 
                reply_markup: keyboard.sources(sources),
                reply_to_message_id: reply_to
            }
        )
    }
}

const _methods = {
    start: db => vk => bot => async msg => {
        const id = msg.chat.id
        // TODO: hello message with help
        await bot.sendMessage(
            id,
            `Welcome, ${msg.chat.first_name}!`,
        )
    },
    sources: db => vk => bot => async msg => {
        const id = msg.chat.id
        const msg_id = msg.message_id
        const sources = db.getSourcesByUserId(id)

        await utils.sendSources(
            bot,
            id,
            sources,
            'Use the keyboard buttons to delete a group.',
            msg_id
        )
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

        const sources = db.getSourcesByUserId(id)
        await utils.sendSources(
            bot,
            id,
            sources,
            `Done.\n${groupData.name} saved.`,
            progressMsg.message_id
        )
    },
    requestSourceDelete: db => vk => bot => async (msg, match) => {
        const id = msg.chat.id
        const msg_id = msg.message_id
        const fullName = match[1]

        let source = null
        try {
            source = db.getSourceByFullName(fullName)
        } catch (searchErr) {
            return await bot.sendMessage(
                id,
                `Unable to find ${fullName} source`,
                { reply_to_message_id: msg_id }
            )
        }
        if (!source.receivers.includes(id)) {
            return await bot.sendMessage(
                id,
                `You're not currently subscribed to ${fullName}.`,
                { reply_to_message_id: msg_id }
            )
        }
        await bot.sendMessage(
            id,
            `Click the button below if you want to delete ${fullName} from your feed.`,
            { 
                reply_to_message_id: msg_id,
                reply_markup: keyboard.confirm(source.id)
            }
        )
    },
    removeSource: db => vk => bot => async query => {
        const id = query.from.id
        const srcId = query.data
        const msg_id = query.message.message_id
        await bot.editMessageReplyMarkup(null, {
            chat_id: id,
            message_id: msg_id
        })

        try {
            await db.deleteSource(id, srcId)
        } catch (deleteErr) {
            return await bot.editMessageText('Failed to delete.', {
                chat_id: id,
                message_id: query.message.message_id
            })
        }

        const updatedSources = db.getSourcesByUserId(id)
        await utils.sendSources(
            bot,
            id,
            updatedSources,
            'Sources list updated.',
            msg_id
        )
    }
}

let bot
module.exports = function({ db, vk }) {
    if (!bot) {
        const _bot = new (nodeBotApi)(process.env.BOT_TOKEN, { polling: true })
        const methods = getConfiguredMethods(db, vk, _bot, _methods)
        configureBot(_bot, methods)
        bot =_bot
        require('./commentsBot')(vk)

        Broadcaster.broadcast(null, () => feed(bot, vk, db))
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
    bot.onText(/\/sources/, methods.sources)
    bot.onText(vkRegex, methods.addSource)
    bot.onText(/✘ (.+)/, methods.requestSourceDelete)
    bot.on('callback_query', methods.removeSource)
}