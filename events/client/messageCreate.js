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
    } catch (error) {
    }
  },
};
