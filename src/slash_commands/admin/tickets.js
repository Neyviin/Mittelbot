const { EmbedBuilder } = require('discord.js');
const Tickets = require('../../../utils/functions/data/Tickets/Tickets');
const { ticketConfig, ticketPerms } = require('../_config/admin/tickets');
const ticketModel = require('../../db/Models/tables/tickets.model');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const subcommand = main_interaction.options.getSubcommand();

    const channel = main_interaction.options.getChannel('channel');
    const description = main_interaction.options.getString('description');
    const category = main_interaction.options.getChannel('category');
    const close_category = main_interaction.options.getChannel('close_category');
    const ticket_description = main_interaction.options.getString('ticket_description');
    const message_link = main_interaction.options.getString('message_link');
    let moderator = main_interaction.options.getString('moderator');

    const ticketApi = new Tickets(bot, main_interaction);
    if (subcommand === 'create') {
        if (moderator) {
            moderator = removeMention(moderator).split(' ');
        }

        ticketApi
            .createSettings({
                channel: channel.id,
                description,
                category,
                close_category,
                moderator,
                ticket_description,
            })
            .then((res) => {
                main_interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(res)
                            .setColor(global.t.trans(['general.colors.success']))
                            .setTimestamp(),
                    ],
                    ephemeral: true,
                });
            })
            .catch((err) => {
                main_interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(err)
                            .setColor(global.t.trans(['general.colors.error']))
                            .setTimestamp(),
                    ],
                    ephemeral: true,
                });
            });
    } else {
        Promise.all([
            ticketApi.deleteTicket(message_link),
            ticketApi.deleteEmbed(message_link),
        ]).then(async (res) => {
            await ticketApi
                .deleteSettings(message_link)
                .then((res) => {
                    main_interaction
                        .followUp({
                            embeds: [
                                new EmbedBuilder().setDescription(
                                    global.t.trans(
                                        ['success.ticket.setting.delete'],
                                        main_interaction.guild.id
                                    )
                                ),
                            ],
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    main_interaction
                        .followUp({
                            embeds: [
                                new EmbedBuilder().setDescription(
                                    global.t.trans(
                                        ['error.ticket.setting.delete'],
                                        main_interaction.guild.id
                                    )
                                ),
                            ],
                        })
                        .catch(() => {});
                });
        });
    }
};

module.exports.data = ticketConfig;
module.exports.permissions = ticketPerms;
