const { ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const { Modroles } = require('../../../utils/functions/data/Modroles');
const config = require('../../assets/json/_config/config.json');
const { modRolesConfig, modRolesPerms } = require('../_config/admin/modroles');

module.exports.run = async ({ main_interaction, bot }) => {
    const roles = main_interaction.options.getRole('roles');

    const guildConfig = await GuildConfig.get(main_interaction.guild.id);
    const modroles = guildConfig.modroles;

    const dbEntity = modroles.find((x) => x.role === roles.id) || {};
    const serverRole = await main_interaction.guild.roles.fetch(roles.id);

    if (!serverRole)
        return main_interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['error.modroles.doesntExists'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });

    const modRoleEmbed = new EmbedBuilder().setTitle(
        `Choose setting for _${serverRole.name}_. \n\nCurrent: **${
            dbEntity
                ? dbEntity.isAdmin
                    ? 'Admin'
                    : dbEntity.isMod
                    ? 'Moderator'
                    : dbEntity.isHelper
                    ? 'Helper'
                    : 'Not set yet'
                : 'Not set yet'
        }**`
    );

    const buttons = Modroles.generateButtons();

    const row = new ActionRowBuilder();

    if (!dbEntity.isAdmin) {
        row.addComponents(buttons.isAdmin);
        modRoleEmbed.addFields(
            global.t.trans(['info.modroles.info.admin'], main_interaction.guild.id)
        );
    }
    if (!dbEntity.isMod) {
        row.addComponents(buttons.isMod);
        modRoleEmbed.addFields(
            global.t.trans(['info.modroles.info.mod'], main_interaction.guild.id)
        );
    }
    if (!dbEntity.isHelper) {
        row.addComponents(buttons.isHelper);
        modRoleEmbed.addFields(
            global.t.trans(['info.modroles.info.helper'], main_interaction.guild.id)
        );
    }

    if (dbEntity.isAdmin || dbEntity.isMod || dbEntity.isHelper) {
        row.addComponents(buttons.isRemove);
        modRoleEmbed.addFields(
            global.t.trans(['info.modroles.info.remove'], main_interaction.guild.id)
        );
    }

    const sentMessage = await main_interaction
        .reply({ embeds: [modRoleEmbed], components: [row], ephemeral: true })
        .then((msg) => {
            return msg;
        })
        .catch(() => {
            return false;
        });

    if (!sentMessage) return;

    let returnMessage = '';

    const collector = sentMessage.createMessageComponentCollector({ time: 60000, max: 1 });
    collector.on('collect', async (interaction) => {
        switch (interaction.customId) {
            case 'isAdmin':
                returnMessage = await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: true,
                    isMod: false,
                    isHelper: false,
                });
                buttons.isAdmin.setStyle(ButtonStyle.Success);
                break;
            case 'isMod':
                returnMessage = await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: true,
                    isHelper: false,
                });
                buttons.isMod.setStyle(ButtonStyle.Success);
                break;
            case 'isHelper':
                returnMessage = await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: false,
                    isHelper: true,
                });
                buttons.isHelper.setStyle(ButtonStyle.Success);
                break;
            case 'isRemove':
                returnMessage = await Modroles.remove({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                });
                buttons.isRemove.setStyle(ButtonStyle.Success);
                break;

            default:
                break;
        }

        buttons.isAdmin.setDisabled(true);
        buttons.isMod.setDisabled(true);
        buttons.isHelper.setDisabled(true);
        buttons.isRemove.setDisabled(true);
        interaction.update({
            content: returnMessage,
            components: [row],
        });
    });

    collector.on('end', (collected, reason) => {
        if (reason !== 'time') return;

        main_interaction.editReply({
            content: `**${global.t.trans(['error.timelimit'], main_interaction.guild.id)}**`,
            embeds: [modRoleEmbed],
            components: [],
            ephemeral: true,
        });
    });
};

module.exports.data = modRolesConfig;
module.exports.permissions = modRolesPerms;
