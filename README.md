# tg-external-feed
Telegram bot with ability to read external feed sources

Currently implemeted:
- Add vk.com public group to feed
- View own list of sources
- Delete a source from a list
- View comments and its threads with pagination
- Attachments: photos in posts

Bot uses throttling system due to telegram limits. 
Each user could receive 20 messages per minute from the bot (~1 message in 3 sec.)
In general, bot could send ~30 messages per second to different users.

TBD:
- Proper DB integration
- Proper logging/documentation
- Extend supported attachments list (video, stickets etc.)
- Reposts support
- Long texts support (> 4096 supported by telegram (implement as posts pagination or something similar))
