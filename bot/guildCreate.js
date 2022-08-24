const database = require('../src/db/db');
const { checkDatabase } = require('../_scripts/checkDatabase');
const {
  errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const { delay } = require('../utils/functions/delay/delay');
const { isGuildBlacklist } = require('../utils/blacklist/guildBlacklist');

async function guildCreate(guild, bot) {

  if(isGuildBlacklist({guild_id: guild.id})) {
    await bot.users.cache.get(guild.ownerId).send({
      content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.blackdayz.de/support.`
    }).catch(err => {})

    errorhandler({fatal: false, message: ` I joined a BLACKLISTED Guild: ${guild.name} (${guild.id})`});

    return guild.leave();
  }

  errorhandler({fatal: false, message: ` I joined a new Guild: ${guild.name} (${guild.id})`});

  await database.query(`SELECT guild_id FROM all_guild_id WHERE guild_id = ?`, [guild.id]).then(async res => {
    if (res.length <= 0) await database.query(`INSERT INTO all_guild_id (guild_id) VALUES (?)`, [guild.id]).catch(err => {})
  });
  
  await delay(1000);

  await checkDatabase();

  await delay(4000);

  await database.query(`INSERT INTO ${guild.id}_config (guild_id) VALUES (?)`, [guild.id]).catch(err => {
    errorhandler({
      err,
      fatal: true
    })
  });

  await database.query(`INSERT INTO ${guild.id}_guild_logs (id) VALUES (?)`, [1]).catch(err => {
    errorhandler({
      err,
      fatal: true
    })
  });

  const obj = {"antispam":{"enabled":false,"action":"[]"}}
  await database.query(`INSERT INTO guild_automod (guild_id, settings) VALUES (?, ?)`, [guild.id, JSON.stringify(obj)]).catch(err => {
    errorhandler({
      err,
      fatal: true
    })
  });

  let commands = [];
  await bot.commands.map(cmd => {
    commands.push(cmd.help.name);
  });

  await database.query(`INSERT INTO active_commands (active_commands, disabled_commands, guild_id, global_disabled) VALUES (?, ?, ?, ?)`, [JSON.stringify(commands), "[]", guild.id, "[]"]).catch(err => {
    errorhandler({
      err,
      fatal: true
    })
  });

  await database.query(`INSERT INTO guild_config (guild_id) VALUES (?)`, [guild.id]).catch(err => {
    errorhandler({
      err,
      fatal: true
    })
  });

  return;
}

module.exports = {
  guildCreate
}