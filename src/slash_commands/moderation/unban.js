const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isBanned } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { unbanUser } = require('../../../utils/functions/moderations/unbanUser');


module.exports.run = async ({main_interaction, bot}) => {
    if (!await hasPermission(main_interaction, 0, 1)) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    const reason = main_interaction.options.getString('reason');

    
    const isUserBanned = await isBanned(user, main_interaction.guild);


    if(isUserBanned.error) {
        return main_interaction.reply({
            content: isUserBanned.message,
            ephemeral: true
        }).catch(err => {});
    }

    if (!isUserBanned.isBanned) {
        return main_interaction.reply({
            content: 'This user isnt banned!',
            ephemeral: true
        }).catch(err => {});
    }

    const unbanned = await unbanUser({user, bot, mod: main_interaction.user, reason, guild: main_interaction.guild});

    if (unbanned.error) {
        return main_interaction.reply({
            content: unbanned.message,
            ephemeral: true
        }).catch(err => {});
    }

    return main_interaction.reply({
        embeds: [unbanned.message],
        ephemeral: true
    }).catch(err => {});
}


module.exports.data = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban an user from the server')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to unban')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for the unban')
        .setRequired(false)
    )