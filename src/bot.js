const nodeBotApi = require('node-telegram-bot-api')
const feed = require('./feed')
const Broadcaster = require('./Broadcaster')
const Comment = require('./Comment')
const keyboard = require('./keyboard')
const text = require('./text')

async function sendSources(
    bot,
    id,
    sources,
    successMsg,
    reply_to
) {
    if (!sources.length) {
        return await bot.sendMessage(
            id,
            text.SOURCES.EMPTY(),
            { 
                reply_markup: keyboard.sources(sources),
                reply_to_message_id: reply_to
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

const _methods = {
    help: db => vk => bot => async msg => bot.sendMessage(
        msg.chat.id,
        text.HELP.POSTS(),
    ),
    sources: db => vk => bot => async msg => {
        const id = msg.chat.id
        const msg_id = msg.message_id
        const sources = db.getSourcesByUserId(id)

        await sendSources(
            bot,
            id,
            sources,
            text.SOURCES.HINT(),
            msg_id
        )
    },
    addSource: db => vk => bot => async msg => {
        const id = msg.chat.id
        const url = msg.text
        const msg_id = msg.message_id

        const progressMsg = await bot.sendMessage(
            id,
            text.SOURCES.PROCESSING(),
            { reply_to_message_id: msg_id }
        )

        let groupData = null
        try {
            groupData = await vk.getGroupData(url)
        } catch (groupDataReceiveErr) {
            return bot.editMessageText(
                text.SOURCES.PROCESSING_FAILED(groupDataReceiveErr.message),
                {
                    chat_id: id,
                    message_id: progressMsg.message_id
                }
            )
        }

        try {
            db.addSource(id, groupData)
        } catch (saveSourceErr) {
            return bot.editMessageText(
                text.SOURCES.SAVING_FAILED(saveSourceErr.message),
                {
                    chat_id: id,
                    message_id: progressMsg.message_id
                }
            )
        }

        const sources = db.getSourcesByUserId(id)
        await sendSources(
            bot,
            id,
            sources,
            text.SOURCES.SAVED(groupData.name),
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
                text.DELETE.NOT_FOUND(fullName),
                { reply_to_message_id: msg_id }
            )
        }
        if (!source.receivers.includes(id)) {
            return await bot.sendMessage(
                id,
                text.DELETE.NOT_SUBSCRIBED(fullName),
                { reply_to_message_id: msg_id }
            )
        }
        await bot.sendMessage(
            id,
            text.DELETE.CONFIRM(fullName),
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
        await bot.editMessageReplyMarkup(
            null,
            {
                chat_id: id,
                message_id: msg_id
            }
        )

        try {
            await db.deleteSource(id, srcId)
        } catch (deleteErr) {
            return await bot.editMessageText(
                text.DELETE.FAILED(),
                {
                    chat_id: id,
                    message_id: query.message.message_id
                }
            )
        }

        const updatedSources = db.getSourcesByUserId(id)
        await sendSources(
            bot,
            id,
            updatedSources,
            text.SOURCES.UPDATED,
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

        // Broadcaster.broadcast(null, () => feed(bot, vk, db))
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
    bot.onText(text.REGEX.START(), methods.help)
    bot.onText(text.REGEX.HELP(), methods.help)
    bot.onText(text.REGEX.SOURCES(), methods.sources)
    bot.onText(text.REGEX.VK(), methods.addSource)
    bot.onText(text.REGEX.REQUEST_DELETE(), methods.requestSourceDelete)
    bot.on('callback_query', methods.removeSource)
}