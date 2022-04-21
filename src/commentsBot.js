const Comment = require('./Comment')
const { nextPage } = require('./keyboard')
const COMMENTS_PER_MSG = 5

module.exports = async vk => {
    const commentsBot = new (require('node-telegram-bot-api'))(process.env.COMMENTS_BOT_TOKEN, { polling: true })
    commentsBot.onText(/start (.+)/, async (msg, match) => {
        const id = msg.chat.id
        // TODO: handle err
        await sendComments(
            commentsBot,
            vk,
            id,
            match[1]
        )
    })
    commentsBot.on('callback_query', async query => {
        const id = query.from.id
        // TODO: handle err
        await sendComments(
            commentsBot,
            vk,
            id,
            query.data
        )
    })
}

async function sendComments(
    bot,
    vk,
    receiver,
    url
) {
    const [
        ownerId,
        postId,
        offset,
        commentId,
        count
    ] = url.split('_')

    const comments = await vk.getComments(
        ownerId,
        postId,
        offset,
        commentId,
        count
    )
    if (!comments.items.length) {
        // TODO: remove 'Next' button
        return bot.sendMessage(
            receiver,
            'No more comments'
        )
    }
    const commentItems = comments.items.map(commentItem => new Comment(
        ownerId,
        postId,
        commentItem.from_id,
        commentItem.id,
        commentItem.text,
        commentItem.attachments,
        commentItem.thread,
        commentItem.likes,
        [
            ...comments.profiles,
            ...comments.groups,
        ]
    ))

    const message = commentItems.map(item => item.asText(+count === 1)).join('\n')
    await bot.sendMessage(
        receiver,
        message,
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: commentItems.length === COMMENTS_PER_MSG
                ? nextPage(
                    ownerId,
                    postId,
                    +offset + COMMENTS_PER_MSG,
                    commentId,
                )
                : undefined
        }
    )
}
