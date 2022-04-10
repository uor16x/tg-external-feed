const { 
    ReplyKeyboard,
    Row,
    KeyboardButton,
    InlineKeyboard,
    InlineKeyboardButton,
} = require('node-telegram-keyboard-wrapper')

module.exports = {
    start: new ReplyKeyboard(
        new Row(
            new KeyboardButton('Sources'),
            new KeyboardButton('Update')
        )
    ),
    sources: data => new InlineKeyboard(
        ...data.map(item => new Row(
            new InlineKeyboardButton(
                item.name,
                'callback_data',
                `deleteSource:${item.id}`
            ),
        ))
    ),
    next: new InlineKeyboard(
        new Row(
            new InlineKeyboardButton(
                'Next',
                'callback_data',
                'next:0'
            )
        )
    )
}