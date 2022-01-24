const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { warnUser } = require('../../../utils/functions/moderations/warnUser');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async (bot, message, args, database) => {
    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete();
    }
    if (!await hasPermission(message, database, 0, 0)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }
    try {
        args[0] = removeMention(args[0]);

        var Member = await message.guild.members.fetch(args[0]);

        if(checkMessage(message, Member, bot, 'warn')) return message.reply(checkMessage(message, Member, bot, 'warn'));
    }catch(err) {
        return message.reply(`I can't find this user!`);
    }

    if (await isMod(Member, message, database)) return message.channel.send(`<@${message.author.id}> You can't warn a Moderator!`) 

    let reason = args.slice(1).join(" ");
    if (!reason) return message.reply('Please add a reason!');
    
    return await warnUser(bot, config, message, Member, reason, database, log);
}

module.exports.help = {
    name:"warn"
}