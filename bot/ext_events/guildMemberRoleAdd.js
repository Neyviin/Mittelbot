const Auditlog = require('../../utils/functions/data/Auditlog');

module.exports.guildMemberRoleAdd = async (bot, member, role) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(
        member.guild.id,
        'guildMemberNicknameUpdate'
    );
    if (!isEnabled) return;
    await auditLog.init(bot, member.guild.id);
    await auditLog.setEmbed({
        text: `**Role added to ${member}**\n**Role**\n${role}`,
        checkWhiteList: true,
    });
    await auditLog.sendToAuditLog({
        guildId: member.guild.id,
        target: member,
        checkWhiteList: true,
    });
};
