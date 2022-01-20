const { log } = require("../../../logs");
const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const { insertDataToOpenInfraction } = require("../insertDataToDatabase");
const { getAllRoles } = require("../roles/getAllRoles");
const { getMutedRole } = require("../roles/getMutedRole");
const { removeAllRoles } = require("../roles/removeAllRoles");

async function muteUser(Member, message, bot, config, reason, time, dbtime) {
    var user_roles = await getAllRoles(Member);
    var MutedRole = await getMutedRole(message);

    if (Member.roles.cache.has(MutedRole)) return message.channel.send(`Member Is Already Muted!`)

    await Member.roles.add(MutedRole).catch(err => { return message.channel.send(`I don't have permissions to do this task!`)});

    await removeAllRoles(Member);

    if (Member.roles.cache.has(MutedRole)) {
        try {
            insertDataToOpenInfraction(Member.id, message.author.id, 1, 0, getFutureDate(dbtime, time), reason, createInfractionId(), message.guild.id, JSON.stringify(user_roles))
            setNewModLogMessage(bot, config.defaultModTypes.mute, message.author.id, Member.id, reason, time, message.guild.id);
            publicModResponses(message, config.defaultModTypes.mute, message.author.id, Member.id, reason, time);
            privateModResponse(Member, config.defaultModTypes.mute, reason, time);
        } catch (err) {
            return errorhandler(err, config.errormessages.general, message.channel, log, config)
        }
    }
}

module.exports = {
    muteUser
}