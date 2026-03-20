import Logger from "../../utils/Logger.js";
import WhitelistManager from "../../utils/WhitelistManager.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(client, message) {
    if (message.author.id !== process.env.OWNER_ID) return;
    if (!message.content.startsWith("!whitelist")) return;

    try {
      const args = message.content.split(" ").slice(1);
      if (args.length === 0) {
        return;
      }

      let targetId = args[0].replace(/[<@!>]/g, "");

      if (WhitelistManager.validateUserId(targetId)) {
        if (!global.config.whitelisted) global.config.whitelisted = { users: [] };
        if (!global.config.whitelisted.users) global.config.whitelisted.users = [];

        if (!global.config.whitelisted.users.includes(targetId)) {
          global.config.whitelisted.users.push(targetId);
        }

        WhitelistManager.reload();
        Logger.success(`Successfully whitelisted user ID: ${targetId}`);
        await message.reply(`Whitelisted ${targetId}`).catch(() => {});
      } else {
        await message.reply(`Invalid user ID or mention.`).catch(() => {});
      }
    } catch (error) {}
    
    if (message.content.startsWith("!help")) {
      const punishment = global.config?.antinuke_settings?.punishment || "strip";
      const helpMsg = `**Vantrix Anti-Nuke Security Panel** 🛡️
      
**Status:** Online & Active (Invisible)
**Database:** MongoDB
**Punishment Mode:** ${punishment.toUpperCase()} (Bans/Strips roles from attackers)

**Available Commands:**
\`!whitelist <@user or ID>\` - Makes a user completely immune to all anti-nuke checks.
\`!help\` - Displays this information panel.

**Monitored Events:**
- Mass Banning / Kicking
- Mass Channel Creation / Deletion / Updating
- Mass Role Creation / Deletion / Updating
- Unauthorized Bot Additions
- Vanity URL Audits (Will instantly revert malicious vanity URL changes)
      
*All security alerts and events are automatically DM'd to you.*`;
      await message.reply(helpMsg).catch(() => {});
    }
  },
};
