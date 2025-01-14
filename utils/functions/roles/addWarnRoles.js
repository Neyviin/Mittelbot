const { errorhandler } = require('../errorhandler/errorhandler');
const { getFutureDate } = require('../getFutureDate');
const config = require('../../../src/assets/json/_config/config.json');
const { Temproles } = require('../data/Temproles');
const { Warnroles } = require('../data/Warnroles');

module.exports.addWarnRoles = async ({ user, inf_id, guild }) => {
    const roles = await Warnroles.get(guild.id);

    let hasRoleAlready = false;
    if (roles.length > 0) {
        for (let i in roles) {
            let role = await guild.roles.cache.find((role) => role.id === roles[i]).id;
            const guild_user = await guild.members.cache.get(user.id);
            if (guild_user) {
                if (!guild_user.roles.cache.has(role)) {
                    return await guild_user.roles
                        .add([role])
                        .then(() => {
                            errorhandler({
                                fatal: false,
                                message: `${user.id} has got a warn roles in ${guild.id}`,
                            });
                            Temproles.insert({
                                uid: user.id,
                                role_id: roles[i],
                                till_date: getFutureDate(2678400),
                                infraction_id: inf_id,
                                gid: guild.id,
                            });
                            return true;
                        })
                        .catch((err) => {
                            return {
                                error: true,
                                message: config.errormessages.nopermissions.manageRoles,
                            };
                        });
                } else {
                    hasRoleAlready = true;
                }
            }
        }
        if (hasRoleAlready) {
            //If User already have all Roles
            errorhandler({
                fatal: false,
                message: `${user.id} has already all roles ${guild.id}`,
            });

            return {
                error: false,
                hasAllRoles: true,
                message: 'This User already have all warn roles!',
            };
        }
    } else {
        return true;
    }
};
