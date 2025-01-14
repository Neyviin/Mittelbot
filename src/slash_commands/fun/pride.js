const { EmbedBuilder } = require('discord.js');

const genders = require('../../../utils/data/pride/gender/');
const sexualities = require('../../../utils/data/pride/sexualities/');
const { prideConfig } = require('../_config/fun/pride');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getString('type');
    const newEmbed = new EmbedBuilder();

    if (type === 'gender') {
        const getRandomGender = () => {
            return genders[Math.floor(Math.random() * genders.length)];
        };

        const newGender = getRandomGender();

        newEmbed.setTitle(`Gender: ${newGender.name}`);
        newEmbed.setDescription(newGender.description);
        newEmbed.addFields({
            name: global.t.trans(['info.pride.similarto'], main_interaction.guild.id),
            value: newGender.differentFrom.join(', '),
        });

        newEmbed.addFields({
            name: global.t.trans(
                ['info.general.tryCommandAgainWithoutArgs'],
                main_interaction.guild.id
            ),
            value: `</pride:${main_interaction.commandId}>`,
        });
        newEmbed.setImage(newGender.flag);
    } else if (type === 'sexuality') {
        const getRandomSexuality = () => {
            return sexualities[Math.floor(Math.random() * sexualities.length)];
        };

        const newSexuality = getRandomSexuality();

        newEmbed.setTitle(
            globla.t.trans(['info.pride.sexuality', newSexuality.name], main_interaction.guild.id)
        );
        newEmbed.setDescription(newSexuality.description);
        newEmbed.addFields(
            {
                name: global.t.trans(['info.pride.genderField'], main_interaction.guild.id),
                value: newSexuality.gender.join(', '),
            },
            {
                name: global.t.trans(['info.pride.attractedto'], main_interaction.guild.id),
                value: newSexuality.attractedTo.join(', '),
            },
            {
                name: global.t.trans(['info.pride.attractiontype'], main_interaction.guild.id),
                value: newSexuality.attractionType,
            },
            {
                name: global.t.trans(['info.pride.similarto'], main_interaction.guild.id),
                value: newSexuality.differentFrom.join(', '),
            },
            {
                name: global.t.trans(
                    ['info.general.tryCommandAgainWithoutArgs'],
                    main_interaction.guild.id
                ),
                value: `</pride:${main_interaction.commandId}>`,
            }
        );
        newEmbed.setImage(newSexuality.flag);
    }

    return main_interaction
        .reply({
            embeds: [newEmbed],
        })
        .catch((err) => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = prideConfig;
