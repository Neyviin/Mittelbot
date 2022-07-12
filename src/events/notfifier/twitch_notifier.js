const {
    ApiClient
} = require('@twurple/api');
const {
    ClientCredentialsAuthProvider
} = require('@twurple/auth');
const {
    MessageEmbed
} = require('discord.js');
const {
    delay
} = require('../../../utils/functions/delay/delay');
const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');

const config = require('../../assets/json/_config/config.json');
const database = require('../../db/db');

const clientId = config.twitch_client_id;
const clientSecret = config.twitch_secret;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);

module.exports.twitchApiClient = new ApiClient({
    authProvider
});

const twitchApiClient = new ApiClient({
    authProvider
});


async function isStreamLive(channel_id) {
    // const user = await apiClient.users.getUserByName(userName);
    // if (!user) {
    //     return false;
    // }

    return await twitchApiClient.streams.getStreamByUserId(channel_id) !== null;
}


module.exports.twitch_notifier = async ({
    bot
}) => {

    console.log("🔎 Twitch streams handler started");

    setInterval(async () => {

        const allTwitchAccounts = await database.query(`SELECT * FROM twitch_streams`)
            .then(res => {
                return res;
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                })
                return false;
            })

        if (!allTwitchAccounts || allTwitchAccounts.length === 0) return;

        for (let i in allTwitchAccounts) {

            if (allTwitchAccounts[i].channel_id) {
                const isLive = await isStreamLive(allTwitchAccounts[i].channel_id);

                if (isLive !== !!+allTwitchAccounts[i].isStreaming) {

                    database.query(`UPDATE twitch_streams SET isStreaming = ? WHERE guild_id = ? AND channel_id = ?`, [JSON.parse(isLive), allTwitchAccounts[i].guild_id, allTwitchAccounts[i].channel_id])
                        .then(() => {

                            if(isLive) {
                                const guild = bot.guilds.cache.get(allTwitchAccounts[i].guild_id);
                                const channel = guild.channels.cache.get(allTwitchAccounts[i].info_channel_id);

                                const pingrole = guild.roles.cache.get(allTwitchAccounts[i].pingrole);
                                if (pingrole) {
                                    var isEveryone = pingrole.name === '@everyone';
                                }

                                channel.send({
                                    content: ((pingrole) ? (isEveryone) ? '@everyone ' : `<@&${allTwitchAccounts[i].pingrole}> ` : '') + `${allTwitchAccounts[i].channel_name} just went live! Go check it out https://twitch.tv/${allTwitchAccounts[i].channel_name}`
                                });
                            }

                        })
                        .catch(err => {
                            errorhandler({
                                err,
                                fatal: true
                            })
                        })

                }
            }
            await delay(3000);
        }

    }, 600000); //? 10 minutes
}