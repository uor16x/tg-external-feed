const keyboard = require('./keyboard')

const _methods = {
    start: db => vk => bot => async msg => {
        const id = msg.chat.id
        // add/get user
        await bot.sendMessage(
            id,
            `Welcome, ${msg.chat.first_name}!`,
            { reply_markup: keyboard.sources.getMarkup({ resize_keyboard: true }) }
        )
    },
}

let bot
module.exports = function({ db, vk }) {
    if (!bot) {
        const _bot = new (require('node-telegram-bot-api'))(process.env.BOT_TOKEN, { polling: true })
        const methods = getConfiguredMethods(db, vk, _bot, _methods)
        configureBot(_bot, methods)
        bot =_bot
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
}