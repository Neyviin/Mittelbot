const config = require('../src/assets/json/_config/config.json');
const { delay } = require('../utils/functions/delay/delay');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { Guilds } = require('../utils/functions/data/Guilds');
const Afk = require('../utils/functions/data/Afk');
const { Levelsystem } = require('../utils/functions/data/levelsystemAPI');
const Translate = require('../utils/functions/data/translate');
const { checkOwnerCommand } = require('../utils/functions/data/Owner');
const AutoBlacklist = require('../utils/functions/data/AutoBlacklist');
const ScamDetection = require('../utils/checkForScam/checkForScam');
const Autodelete = require('../utils/functions/data/Autodelete');
const { EmbedBuilder, ChannelType } = require('discord.js');
const { banAppealModule } = require('../utils/modules/banAppeal');
const Modules = require('../utils/functions/data/Modules');
const Counter = require('../utils/functions/data/Counter/Counter');
const AutomodAntiSpam = require('../utils/functions/data/Automoderation/Automod-AntiSpam');
const AutomodAntiInsults = require('../utils/functions/data/Automoderation/Automod-AntiInsuts');
const AutomodAntiInvite = require('../utils/functions/data/Automoderation/Automod-AntiInvite');
const AutomodAntiLinks = require('../utils/functions/data/Automoderation/Automod-AntiLinks');

const antiSpam = new AutomodAntiSpam();
const antiInsults = new AutomodAntiInsults();
const antiInvite = new AutomodAntiInvite();
const antiLinks = new AutomodAntiLinks();
const antiScam = new ScamDetection();
antiScam.loadScam();

async function messageCreate(message, bot) {
    message.bot = bot;

    if (
        message.channel.type === ChannelType.DM &&
        !message.author.bot &&
        !message.author.system &&
        message.reference
    ) {
        return await banAppealModule(message, bot);
    }

    if (message.channel.type === ChannelType.DM && message.author.id === config.Bot_Owner_ID) {
        return checkOwnerCommand(message);
    }

    /** ======================================================= */

    let moduleApi;
    let defaultModuleSettings;
    try {
        moduleApi = new Modules(message.guild.id, bot);
        defaultModuleSettings = moduleApi.getDefaultSettings();
    } catch (e) {
        // dm message
        return;
    }

    /** ======================================================= */

    if (
        message.channel.id !== process.env.DC_DEBUG &&
        moduleApi.checkEnabled(defaultModuleSettings.autodelete.name)
    ) {
        if (await new AutoBlacklist().check(message, bot)) {
            return;
        }
    }
    if (
        message.channel.type === ChannelType.DM ||
        message.author.system ||
        !message.author ||
        (bot.user.id === '921779661795639336' && message.author.id !== bot.ownerId) ||
        message.author.bot
    )
        return;

    /** ======================================================= */

    const isOnBlacklist = (await moduleApi.checkEnabled(defaultModuleSettings.blacklist.name))
        .enabled
        ? await Guilds.isBlacklist(message.guild.id)
        : false;
    if (isOnBlacklist) {
        const guild = bot.guilds.cache.get(message.guild.id);

        await bot.users.cache
            .get(guild.ownerId)
            .send({
                content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.blackdayz.de/support.`,
            })
            .catch(() => {});

        errorhandler({
            fatal: false,
            message: ` I was in a BLACKLISTED Guild, but left after >messageCreate< : ${guild.name} (${guild.id})`,
        });

        return guild.leave().catch(() => {});
    }

    /** ======================================================= */

    const isScam = (await moduleApi.checkEnabled(defaultModuleSettings.scamdetection.name)).enabled
        ? await antiScam.check(message, bot)
        : false;
    if (isScam) {
        return;
    }

    /** ======================================================= */

    const isSpam = (await moduleApi.checkEnabled(defaultModuleSettings.antiSpam.name)).enabled
        ? await (await antiSpam.init(message.guild.id, bot)).check(message)
        : false;
    if (isSpam) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has spammed in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isInvite = (await moduleApi.checkEnabled(defaultModuleSettings.anitInvite.name)).enabled
        ? await antiInvite.check(message, bot)
        : false;
    if (isInvite) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has sent an invite in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isInsult = (await moduleApi.checkEnabled(defaultModuleSettings.antiInsults.name)).enabled
        ? await antiInsults.check(message, bot)
        : false;
    if (isInsult) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has sent an insult in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isLink = (await moduleApi.checkEnabled(defaultModuleSettings.antiLinks.name)).enabled
        ? await antiLinks.check(message, bot)
        : false;
    if (isLink) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has sent a link in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isAutodelete = (await moduleApi.checkEnabled(defaultModuleSettings.autodelete.name))
        .enabled
        ? await new Autodelete(bot).check(message.channel, message)
        : false;
    if (isAutodelete) {
        message.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Wrong message Type!')
                        .setDescription(
                            'This channel is not accessable with the message type you have sent. Please send the right message type or use another channel. (only Text, only Emotes, only Media or only Stickers)'
                        )
                        .setColor('#FF0000'),
                ],
            })
            .then(async (msg) => {
                await delay(6000);
                msg.delete().catch(() => {});
            })
            .catch(() => {});

        return message.delete().catch(() => {});
    }

    /** ======================================================= */

    new Counter()
        .get(message.guild.id)
        .then(async (counter) => {
            if (counter.channel_id !== message.channel.id) return;

            await new Counter()
                .isValidCount(message.guild.id, message.author.id, message.content)
                .then(async () => {
                    message.react('✅').catch(() => {});
                })
                .catch(async (err) => {
                    message
                        .reply({
                            content: global.t.trans(
                                ['error.fun.counter.countReseted'],
                                message.guild.id
                            ),
                            embeds: [err],
                        })
                        .then(async (msg) => {
                            await delay(6000);
                            msg.delete().catch(() => {});
                        })
                        .catch(() => {});

                    message.channel.send({
                        content: '============================',
                    });
                });
        })
        .catch(() => {});

    /** ======================================================= */

    if ((await moduleApi.checkEnabled(defaultModuleSettings.autotranslate.name)).enabled) {
        new Translate().translate(message);
    }

    /** ======================================================= */

    if ((await moduleApi.checkEnabled(defaultModuleSettings.level.name)).enabled) {
        Levelsystem.run({ message, bot });
    }

    /** ======================================================= */

    if ((await moduleApi.checkEnabled(defaultModuleSettings.utils.name)).enabled) {
        const isAFK = await new Afk().check({ message });
        if (isAFK) {
            return message
                .reply(
                    `The user is currently afk.\`Reason: ${isAFK.reason}\` Since: <t:${isAFK.time}:R>`
                )
                .then(async (msg) => {
                    await delay(8000);
                    msg.delete().catch(() => {});
                })
                .catch(() => {});
        }
    }

    /** ======================================================= */

    return false;
}

module.exports = {
    messageCreate,
};
