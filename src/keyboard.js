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

module.exports2 = {
    menu: currentSrc => {
        new ReplyKeyboard(
            new Row( new KeyboardButton('Sources')),
            currentSrc
                ? new Row(new KeyboardButton(`${currentSrc.name} ➤➤`))
                : null
        )
    },
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