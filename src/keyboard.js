const { 
    ReplyKeyboard,
    Row,
    KeyboardButton,
    InlineKeyboard,
    InlineKeyboardButton,
} = require('node-telegram-keyboard-wrapper')

module.exports = {
    sources: list => list.length
        ? (
            new ReplyKeyboard(
                ...list.map(item => new Row(new KeyboardButton(`✘ ${item.name}`)))
            ).getMarkup({ resize_keyboard: true })
        )
        : undefined,
    confirm: id => new InlineKeyboard(
        new Row(
            new InlineKeyboardButton(
                'Confirm',
                'callback_data',
                id
            ),
        )
    ).getMarkup({ resize_keyboard: true })
}
