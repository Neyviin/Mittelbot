const { GuildConfig } = require('../data/Config');
const { createMutedRole } = require('./createMutedRole');

const commonMutedRole = ['muted', 'mute'];

module.exports.getMutedRole = (guild) => {
    return new Promise(async (resolve) => {
        const guildConfig = await GuildConfig.get(guild.id);

        let mutedRole = guildConfig.mutedRole;
        if (mutedRole) {
            return resolve(guild.roles.cache.get(mutedRole).id);
        }

        try {
            mutedRole = await guild.roles.cache.find((role) => {
                let name = role.name.toLowerCase();
                return commonMutedRole.includes(name);
            }).id;
        } catch (err) {
            mutedRole = await createMutedRole({ guild });
        }
        return resolve(mutedRole);
    });
};
