const { PermissionFlagsBits } = require('discord.js');
const { Scam } = require('../../../utils/functions/data/scam');
const { scamConfig, scamPerms } = require('../_config/admin/scam');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermission = await main_interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
    );
    if (!hasPermission) {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.permissions.user.useCommand'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }

    const link = main_interaction.options.getString('link');

    switch (main_interaction.options.getSubcommand()) {
        case 'add':
            Scam.add({
                value: link,
                guild_id: main_interaction.guild.id,
                guild_name: main_interaction.guild.name,
                bot,
                author: main_interaction.user,
            })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    return main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch(() => {});
                });
            break;

        case 'remove':
            Scam.remove({
                value: link,
                guild_id: main_interaction.guild.id,
                guild_name: main_interaction.guild.name,
                bot,
                author: main_interaction.user,
            })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    return main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch(() => {});
                });
            break;
        case 'view':
            Scam.view({
                value: link,
                channel: main_interaction.channel,
                author: main_interaction.user,
            })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    return main_interaction.reply({
                        content: err,
                        ephemeral: true,
                    });
                });
            break;
    }
};

module.exports.data = scamConfig;
module.exports.permissions = scamPerms;
