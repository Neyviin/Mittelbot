const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageUpdate = async (bot, messageBefore, messageAfter) => {
    if (messageBefore.content === messageAfter.content) return;
    if (
        messageBefore == null ||
        messageAfter == null ||
        messageBefore.content == null ||
        messageAfter.content == null
    ) {
        return;
    }
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(messageBefore.guild.id, 'message_update');
    if (!isEnabled) return;
    await auditLog.init(bot, messageBefore.guild.id, true);

    const cleanedMessage = (text) => {
        if (text.length > 1024) {
            return text.slice(0, 1021) + '...';
        } else {
            return text;
        }
    };

    await auditLog.setEmbed({
        color: '#36d30a',
        text: `**Message sent by <@${messageAfter.author.id}> edited in <#${
            messageAfter.channelId
        }>\n[Jump to Message](https://discord.com/channels/${messageAfter.guildId}/${
            messageAfter.channelId
        }/${messageAfter.id})**\n\n**Before**\n${cleanedMessage(
            messageBefore.content
        )}\n\n**After**\n${cleanedMessage(messageAfter.content)}`,
    });
    await auditLog.sendToAuditLog({
        guildId: messageBefore.guild.id,
        target: messageBefore,
        type: 'messagelog',
    });
};
