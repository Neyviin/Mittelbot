const { GuildConfig } = require('./data/Config');

module.exports.isMod = async ({ member, guild }) => {
    if (!member || typeof member !== 'object') return false;

    const guildConfig = await GuildConfig.get(guild.id);
    const modroles = guildConfig.modroles;

    let isTeam = false;
    for (let i in await modroles) {
        if (member.roles.cache.find((r) => r.id === modroles[i].role) !== undefined) {
            isTeam = true;
            break;
        }
    }
    return isTeam;
};
