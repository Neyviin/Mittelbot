const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const config = require('../../../src/assets/json/_config/config.json');
const { Infractions } = require('../../../utils/functions/data/Infractions');
const { infractionsConfig, infractionPerms } = require('../_config/moderation/infractions');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    switch (main_interaction.options.getSubcommand()) {
        case 'all':
            const user = main_interaction.options.getUser('user');

            const closed_infractions = await Infractions.getClosed({
                user_id: user.id,
                guild_id: main_interaction.guild.id,
            });

            const open_infractions = await Infractions.getOpen({
                user_id: user.id,
                guild_id: main_interaction.guild.id,
            });

            if (!closed_infractions || !open_infractions) {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(['error.general'], main_interaction.guild.id)
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }

            if (closed_infractions.length <= 0 && open_infractions.length <= 0) {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.infractions.dontHaveAny', user],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
            if (JSON.parse(process.env.DEBUG)) console.info('Infraction Command passed!');

            await publicInfractionResponse({
                member: user.id,
                closed: closed_infractions,
                open: open_infractions,
                main_interaction,
            });
            break;

        case 'view':
            const inf_id = main_interaction.options.getString('infractionid');

            const { infraction } = await Infractions.get({
                inf_id,
                guild_id: main_interaction.guild.id,
            });

            if (!infraction) {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.infractions.notFoundWithId', inf_id],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }

            const response = await publicInfractionResponse({
                guild: main_interaction.guild,
                isOne: true,
                infraction,
            });

            main_interaction
                .followUp({
                    embeds: [response.message],
                    ephemeral: true,
                })
                .catch((err) => {});
            break;

        case 'remove':
            const infraction_id = main_interaction.options.getString('infractionid');

            const { table } = await Infractions.get({
                inf_id: infraction_id,
                guild_id: main_interaction.guild.id,
            });

            if (table) {
                if (table === 'open') {
                    await Infractions.deleteOpen(inf_id);
                } else {
                    await Infractions.deleteClosed(infraction_id);
                }

                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        [
                                            'success.infractions.removed',
                                            infraction_id,
                                            response ? 'has beend' : 'could not',
                                        ],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            } else {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.infractions.notFoundWithId', infraction_id],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
    }
};

module.exports.data = infractionsConfig;
module.exports.permissions = infractionPerms;
