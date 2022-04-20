const Comment = require('./Comment')
const { nextPage } = require('./keyboard')
const MAX_COMMENT_LENGTH = 4000

module.exports = async vk => {
    const commentsBot = new (require('node-telegram-bot-api'))(process.env.COMMENTS_BOT_TOKEN, { polling: true })
    commentsBot.onText(/start (.+)/, async (msg, match) => {
        const id = msg.chat.id
        const postUrl = match[1]
        const [
            ownerId,
            postId,
            offset,
            commentId
        ] = postUrl.split('_')
        // TODO: handle err
        await sendComments(
            commentsBot,
            vk,
            id,
            ownerId,
            postId,
            offset,
            commentId
        )
    })
    commentsBot.on('callback_query', async query => {
        const id = query.from.id
        const postUrl = query.data
        const [
            ownerId,
            postId,
            offset,
            commentId
        ] = postUrl.split('_')
        // TODO: handle err
        await sendComments(
            commentsBot,
            vk,
            id,
            ownerId,
            postId,
            offset,
            commentId
        )
    })
}

async function sendComments(
    bot,
    vk,
    receiver,
    ownerId,
    postId,
    offset,
    commentId
) {
    const comments = await vk.getComments(
        ownerId,
        postId,
        offset,
        commentId
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

    const messages = formCommentsMessages(commentItems.map(item => item.getText()))
    console.log(messages)
    await bot.sendMessage(
        receiver,
        messages[0],
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: nextPage(
                ownerId,
                postId,
                +offset + 5,
                commentId,
            )
        }
    )
}

function formCommentsMessages(comments) {
    const messages = []
    let msg = ''
    comments.forEach((comment, index) => {
        const newPageRequired = msg.length + comment.length >= MAX_COMMENT_LENGTH
        if (newPageRequired) {
            messages.push(`${msg}`)
            msg = ''
        }
        msg += `${comment}\n\n`
        if (index === comments.length - 1) {
            messages.push(`${msg}`)
        }
    })
    return messages
}