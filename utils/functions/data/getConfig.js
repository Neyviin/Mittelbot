const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getAllGuildIds
} = require("./getAllGuildIds");
const {
    getFromCache
} = require('../cache/cache');

module.exports.getAllConfig = async () => {
    const all_guild_id = await getAllGuildIds();

    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            response.push(await this.getConfig({
                guild_id: all_guild_id[i].guild_id
            }));
        }
        return response;
    } else {
        return false;
    }
}


module.exports.getConfig = async ({
    guild_id
}) => {

    const cache = getFromCache({
        cacheName: "config",
        param_id: guild_id
    });

    if (cache.length > 0) {
        return cache[0];
    }

    return await database.query(`SELECT * FROM ${guild_id}_config`)
        .then(res => {
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        })
        .catch(err => {
            errorhandler({
                err: err,
                fatal: true
            });
            return false;
        });
}

module.exports.updateConfig = async ({guild_id, value, valueName}) => {
    return await database.query(`UPDATE ${guild_id}_config SET ${valueName} = ?`, [value]).catch(err => {
        return errorhandler({err, fatal: true});
    });
}




//######################################################################################################################
//? PREFIX


module.exports.checkPrefix = async ({
    value
}) => {
    let pass = 0;
    for (let i in config.settings.prefix.required) {
        if (!value.endsWith(config.settings.prefix.required[i])) pass++;
    }
    if (pass === (config.settings.prefix.required).length) return false

    return true;
}