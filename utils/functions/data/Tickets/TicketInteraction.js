const { EmbedBuilder } = require('discord.js');

module.exports = class TicketInteraction {
    constructor(bot, main_interaction) {
        this.main_interaction = main_interaction;
        this.bot = bot;
    }

    interacte() {
        return new Promise(async (resolve, reject) => {
            const interaction = this.main_interaction.customId;
            if (interaction === 'create_ticket') {
                const settingsExists = await this.getSettingsOfMessage(
                    this.main_interaction.message.url
                );

                if (!settingsExists) return resolve();

                await this.create()
                    .then((message) => {
                        resolve(message);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else if (interaction === 'close_ticket' && (await this.isModerator())) {
                await this.close()
                    .then((message) => {
                        resolve(message);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else if (interaction === 'save_ticket' && (await this.isModerator())) {
                await this.saveTranscript()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else if (interaction === 'delete_ticket' && (await this.isModerator())) {
                await this.delete()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }

            resolve();
        });
    }

    create() {
        return new Promise(async (resolve, reject) => {
            const userhasTicket = await this.hasUserAlreadyTicket(
                this.main_interaction.message.url
            ).catch((err) => {
                return reject(
                    global.t.trans(
                        ['error.generalWithMessage', err],
                        this.main_interaction.guild.id
                    )
                );
            });

            if (userhasTicket) {
                return reject(global.t.trans(['error.ticket.interacte.hasTicketAlready']));
            }

            const channel = await this.generateTicketChannel().catch((err) => {
                return resolve(
                    global.t.trans(
                        ['error.ticket.interacte.create'],
                        this.main_interaction.guild.id
                    )
                );
            });

            Promise.all([
                await this.sendTicketChannelEmbed(channel),
                await this.saveTicket(channel),
            ])
                .then(() => {
                    return resolve(
                        global.t.trans(
                            ['success.ticket.interacte.create', channel],
                            this.main_interaction.guild.id
                        )
                    );
                })
                .catch((err) => {
                    return reject(
                        global.t.trans(
                            ['error.generalWithMessage', err],
                            this.main_interaction.guild.id
                        )
                    );
                });
        });
    }

    close() {
        return new Promise(async (resolve, reject) => {
            await this.closeTicket()
                .then(() => {
                    Promise.all([
                        this.setOwnerPermissionsToFalse(),
                        this.moveChannelToClosedCategory(),
                        this.clearBtns(),
                        this.generateDeleteButton(),
                        this.generateTranscriptButton(),
                        this.appendButtons(),
                    ])
                        .then(() => {
                            resolve(
                                global.t.trans(
                                    ['success.ticket.interacte.close'],
                                    this.main_interaction.guild.id
                                )
                            );
                        })
                        .catch((err) => {
                            reject(
                                global.t.trans(
                                    ['error.ticket.interacte.close'],
                                    this.main_interaction.guild.id
                                )
                            );
                        });
                })
                .catch((err) => {
                    reject(
                        global.t.trans(
                            ['error.ticket.interacte.close'],
                            this.main_interaction.guild.id
                        )
                    );
                });
        });
    }

    saveTranscript() {
        return new Promise(async (resolve, reject) => {
            const channel = this.main_interaction.bot.channels.cache.get(
                this.main_interaction.channel.id
            );
            const transcript = await this.generateTranscript(channel);

            this.main_interaction
                .reply({
                    content: global.t.trans(
                        ['success.ticket.interacte.saveTranscript'],
                        this.main_interaction.guild.id
                    ),
                    files: [transcript],
                })
                .then(async () => {
                    Promise.all([
                        await this.clearBtns(),
                        await this.generateDeleteButton(),
                        await this.appendButtons(),
                    ])
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(
                                global.t.trans(['error.general'], this.main_interaction.guild.id)
                            );
                        });
                })
                .catch(() => {});
        });
    }

    delete() {
        return new Promise(async (resolve, reject) => {
            Promise.all([await this.clearBtns(), await this.appendButtons()])
                .then(async () => {
                    await this.main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['info.ticket.deletedTicket'],
                                        this.main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.info'])),
                        ],
                    });
                    setTimeout(async () => {
                        this.main_interaction.channel.delete().catch(() => {
                            reject(
                                gloval.t.trans(
                                    ['error.permissions.bot.channelDelete'],
                                    this.main_interaction.guild.id
                                )
                            );
                        });
                    }, 5100); // 5 seconds + 100ms Delay
                    resolve();
                })
                .catch((err) => {
                    reject(global.t.trans(['error.general'], this.main_interaction.guild.id));
                });
        });
    }

    isModerator() {
        return new Promise(async (resolve) => {
            await this.isTicketModerator()
                .then((isTicketModerator) => {
                    resolve(isTicketModerator);
                })
                .catch(async () => {
                    resolve(false);
                });
        });
    }
};
