const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { isBanned } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { unbanUser } = require('../../../utils/functions/moderations/unbanUser');

module.exports.run = async (bot, message, args, database) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if(!await hasPermission(message, database, 0, 1)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let Member = args[0];
    if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
    Member = removeMention(Member)

    let reason = args.slice(1).join(" ");
    if(!reason) return message.channel.send('Please add a reason!');


    if(await isBanned(database, Member, message) == false) return message.reply('This user isn`t banned!')

    return await unbanUser(database, Member, config, message, log, reason, bot);
}

module.exports.help = {
    name:"unban",
    description: "Unban an User",
    usage: "unban <Mention User> <Reason>"
}