const { 
    ReplyKeyboard,
    Row,
    KeyboardButton,
} = require('node-telegram-keyboard-wrapper')

module.exports = {
    sources: new ReplyKeyboard(
        new Row(
            new KeyboardButton('Sources')
        )
    )
}