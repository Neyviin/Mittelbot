const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const Music = require('../../../utils/functions/data/Music');

module.exports.registerPlayerEvents = (player, bot) => {
    player.events.on('error', (queue, error) => {
        errorhandler({
            err: error,
            message: `Error emitted from the queue ${queue.guild.name} | ${error.message}`,
            fatal: false,
        });
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.generalWithMessage', err.message],
                                queue.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'], queue.guild.id)),
                ],
            })
            .catch(() => {
                // No permissions
            });

        new Music(null, bot, true).destroy(queue);
    });

    player.events.on('playerError', (queue, error) => {
        errorhandler({
            err: error,
            message: `Error emitted from the connection ${queue.guild.name} | ${error.message}`,
        });
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.generalWithMessage', err.message],
                                queue.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'], queue.guild.id)),
                ],
            })
            .catch(() => {
                // No permissions
            });
    });

    player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['info.music.nowPlayingOnlyTrack', track.title],
                                queue.guild.id
                            )
                        )
                        .addFields({
                            name: global.t.trans(['info.music.requestedBy'], queue.guild.id),
                            value: track.requestedBy
                                ? track.requestedBy.username || 'Unknown'
                                : 'Unknown',
                        })
                        .setColor(global.t.trans(['general.colors.info']))
                        .setThumbnail(track.thumbnail),
                ],
            })
            .catch(() => {
                // No permissions
            });
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['info.music.tracksAddedToQueue', track], queue.guild.id)
                        )
                        .addFields({
                            name: global.t.trans(['info.music.requestedBy'], queue.guild.id),
                            value: track.requestedBy
                                ? track.requestedBy.username || 'Unknown'
                                : 'Unknown',
                        })
                        .setColor(global.t.trans(['general.colors.info']))
                        .setThumbnail(track.thumbnail),
                ],
            })
            .catch(() => {
                // No permissions
            });
    });

    player.events.on('disconnect', (queue) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(global.t.trans(['info.music.disconnected'], queue.guild.id))
                        .setColor(global.t.trans(['general.colors.info']))
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });
        new Music(null, bot, true).destroy(queue);
    });

    player.events.on('emptyChannel', (queue) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(global.t.trans(['info.music.emptyChannel'], queue.guild.id))
                        .setColor(global.t.trans(['general.colors.info'])),
                ],
            })
            .catch(() => {
                // No permissions
            });

        new Music(null, bot, true).destroy(queue);
    });

    player.events.on('emptyQueue', (queue) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['info.music.queueHasEnded'], queue.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.info'])),
                ],
            })
            .catch(() => {
                // No permissions
            });

        try {
            new Music(null, bot, true).destroy(queue);
        } catch (e) {
            // Bot got probably disconnected with the /stop command
        }
    });
};
