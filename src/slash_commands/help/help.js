const cmd_help = require('../../../src/assets/json/command_config/command_help.json');
const config = require('../../../src/assets/json/_config/config.json');
const {
    MessageEmbed
} = require('discord.js');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { log } = require('../../../logs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports.run = async ({main_interaction, bot}) => {
    const helpEmbedMessage = new MessageEmbed()
        .setTitle('Everything you need to know from each Command \n Choose a category')
        .setDescription('Something wrong? Report it on my discord https://discord.gg/5d5ZDFQM4E \n _I\'ll use the default prefix \'!\'_ ')

    for (const [index, [key, value]] of Object.entries(Object.entries(cmd_help))) {
        helpEmbedMessage.addField(`${value._icon} ${key.charAt(0).toUpperCase() + key.slice(1)}`, value._desc);
    }
    //main_interaction.reply / ephemeral: true
    await main_interaction.channel.send({
        embeds: [helpEmbedMessage]
    }).then(async msg => {
        var filterEmoji = [];

        let pass = true;    


        async function addCloseReaction() {
            if(!pass) return;
            await msg.react('❌').catch(err => {
                pass = false;
                return errorhandler({err, fatal: true});
            });
            if(filterEmoji.indexOf('❌') === -1) filterEmoji.push('❌');
        }

        async function addHomeReactions() {
            for (let i in cmd_help) {
                if(!pass) return;
                await msg.react(cmd_help[i]._icon).catch(err => {
                    pass = false;
                    return errorhandler({err, fatal: true});
                });
                if(filterEmoji.indexOf(cmd_help[i]._icon) === -1) filterEmoji.push(cmd_help[i]._icon)
            }
        }
        await addCloseReaction();
        if(!pass) return;

        await addHomeReactions();

        const filter = (reaction, user) => filterEmoji.indexOf(reaction.emoji.name) !== -1 && user.id === main_interaction.user.id;
    
        const collector = msg.createReactionCollector({
            filter,
            time: 60000
        });
        
        collector.on('collect', async (reaction, user) => {
            await reaction.users.remove(user).catch(err => {
                return errorhandler({err, fatal: true});
            });
            
            if(reaction.emoji.name === '❌') {
                collector.ended = true;
                return await msg.delete().catch(err=> {})
            }

            if(reaction.emoji.name === '🔼') {
                msg.edit({
                    embeds: [helpEmbedMessage]
                }).catch(err => {
                    return errorhandler({err, fatal: true});
                })
                msg.reactions.removeAll().catch(err => {
                    return errorhandler({err, fatal: true});
                });
                addCloseReaction();
                addHomeReactions();
            }

            for (const [index, [key, value]] of Object.entries(Object.entries(cmd_help))) {
                if(value._icon === reaction.emoji.name) {

                    const edithelpEmbedMessage = new MessageEmbed()
                        .setTitle(`Settings for ${key.charAt(0).toUpperCase() + key.slice(1)}`)
                        .setDescription('Something wrong? Report it on my discord https://discord.gg/5d5ZDFQM4E \n _I\'ll use the default prefix \'!\'_ ')

                    for(let i in value) {
                        if(typeof value[i] === 'object') {
                            edithelpEmbedMessage.addField(`${value[i].icon || ''} ${value[i].name.charAt(0).toUpperCase() + value[i].name.slice(1)}`, `${value[i].description || 'Not set yet'} \n${'**'+value[i].usage+'**' || 'Not set'}`)
                        }
                    }

                    msg.edit({
                        embeds: [edithelpEmbedMessage]
                    }).catch(err => {
                        return errorhandler({err, fatal: true});
                    })

                    msg.reactions.removeAll().catch(err => {});

                    addCloseReaction();
                    msg.react('🔼').catch(err => {
                        return errorhandler({err, fatal: true});
                    });
                    if(filterEmoji.indexOf('🔼') === -1) filterEmoji.push('🔼');
                    return;
                }
            }
        });

        collector.on('end', (collected, reason) => {
            try {
                if(reason === 'time') {
                    msg.edit({content: '**Time limit reached**'}).catch(err => {});
                    msg.reactions.removeAll().catch(err => {
                        return errorhandler({err, fatal: true});
                    });
                }else {
                    msg.edit({content: `**Collector ended cause: ${reason}**`});
                    msg.reactions.removeAll().catch(err => {
                        return errorhandler({err, fatal: true});
                    });
                }
            }catch(err) {}
        });
    }).catch(err => {
        return errorhandler({err, fatal: true});
    });


}

module.exports.data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Get help for all commands')