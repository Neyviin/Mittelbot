const config = require('../../src/assets/json/_config/config.json');
const { Temproles } = require('../../utils/functions/data/Temproles');

module.exports.checkTemproles = async (bot) => {
    console.info('🔎📜 CheckTemproles handler started');
    setInterval(async () => {
        const results = await Temproles.getAll();

        let done = 0;
        for (let i in results) {
            if (results[i].till_date == null) continue;

            const currentdate = new Date().getTime();
            const till_date = results[i].till_date.getTime();

            const currentYear = new Date().getFullYear();
            const infYear = results[i].till_date.getFullYear();
            if (currentdate - till_date <= 0 && currentYear <= infYear) {
                try {
                    done++;
                    const guild = await bot.guilds.cache.get(results[i].guild_id);
                    const user = await guild.members
                        .fetch(results[i].user_id)
                        .then((members) => members);
                    await user.roles
                        .remove([
                            bot.guilds.cache
                                .get(results[i].guild_id)
                                .roles.cache.find((r) => r.id === results[i].role_id),
                        ])
                        .catch((err) => {});
                } catch (err) {}
                await Temproles.delete(results[i].infraction_id);
            }
        }
        console.info(`Check Temproles finished. ${done} roles removed`);
    }, config.defaultCheckTemprolesTimer);
};
