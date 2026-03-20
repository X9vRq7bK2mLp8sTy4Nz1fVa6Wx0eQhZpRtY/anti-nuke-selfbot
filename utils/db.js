import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  process.exit(1);
}

mongoose.connect(mongoUri, { dbName: "ANTI-NUKE" }).catch(() => process.exit(1));

const actionSchema = new mongoose.Schema({
  user_id: String,
  guild_id: String,
  action_type: String,
  timestamp: Number,
});
const Action = mongoose.model("Action", actionSchema);

const deletedChannelSchema = new mongoose.Schema({
  guild_id: String,
  channel_id: String,
  metadata: String,
  deleted_at: Number,
});
const DeletedChannel = mongoose.model("DeletedChannel", deletedChannelSchema);

const deletedRoleSchema = new mongoose.Schema({
  guild_id: String,
  role_id: String,
  metadata: String,
  deleted_at: Number,
});
const DeletedRole = mongoose.model("DeletedRole", deletedRoleSchema);

const bannedUserSchema = new mongoose.Schema({
  guild_id: String,
  user_id: String,
  executor_id: String,
  banned_at: Number,
});
const BannedUser = mongoose.model("BannedUser", bannedUserSchema);

const kickedUserSchema = new mongoose.Schema({
  guild_id: String,
  user_id: String,
  executor_id: String,
  kicked_at: Number,
});
const KickedUser = mongoose.model("KickedUser", kickedUserSchema);

const unbannedUserSchema = new mongoose.Schema({
  guild_id: String,
  user_id: String,
  executor_id: String,
  unbanned_at: Number,
});
const UnbannedUser = mongoose.model("UnbannedUser", unbannedUserSchema);

const createdChannelSchema = new mongoose.Schema({
  guild_id: String,
  channel_id: String,
  created_at: Number,
});
const CreatedChannel = mongoose.model("CreatedChannel", createdChannelSchema);

const createdRoleSchema = new mongoose.Schema({
  guild_id: String,
  role_id: String,
  created_at: Number,
});
const CreatedRole = mongoose.model("CreatedRole", createdRoleSchema);

const originalChannelSchema = new mongoose.Schema({
  guild_id: String,
  channel_id: { type: String, unique: true },
  metadata: String,
  saved_at: Number,
});
const OriginalChannel = mongoose.model("OriginalChannel", originalChannelSchema);

const originalRoleSchema = new mongoose.Schema({
  guild_id: String,
  role_id: { type: String, unique: true },
  metadata: String,
  saved_at: Number,
});
const OriginalRole = mongoose.model("OriginalRole", originalRoleSchema);

const originalMemberSchema = new mongoose.Schema({
  guild_id: String,
  member_id: { type: String, unique: true },
  role_ids: String,
  saved_at: Number,
});
const OriginalMember = mongoose.model("OriginalMember", originalMemberSchema);

const originalServerSchema = new mongoose.Schema({
  guild_id: { type: String, unique: true },
  metadata: String,
  saved_at: Number,
});
const OriginalServer = mongoose.model("OriginalServer", originalServerSchema);

export async function recordAction(userId, guildId, actionType) {
  await new Action({ user_id: userId, guild_id: guildId, action_type: actionType, timestamp: Date.now() }).save();
}

export async function countActions(userId, guildId, actionType, timeWindow) {
  return Action.countDocuments({ user_id: userId, guild_id: guildId, action_type: actionType, timestamp: { $gte: Date.now() - timeWindow } });
}

export async function clearUserActions(userId, guildId, actionType) {
  await Action.deleteMany({ user_id: userId, guild_id: guildId, action_type: actionType });
}

export async function saveDeletedChannel(guildId, channelId, metadata) {
  await new DeletedChannel({ guild_id: guildId, channel_id: channelId, metadata: JSON.stringify(metadata), deleted_at: Date.now() }).save();
}

export async function getDeletedChannels(guildId, withinMs = 60000) {
  const docs = await DeletedChannel.find({ guild_id: guildId, deleted_at: { $gte: Date.now() - withinMs } }).sort({ deleted_at: -1 });
  return docs.map((r) => ({ ...r.toObject(), metadata: JSON.parse(r.metadata) }));
}

export async function clearDeletedChannels(guildId) {
  await DeletedChannel.deleteMany({ guild_id: guildId });
}

export async function saveDeletedRole(guildId, roleId, metadata) {
  await new DeletedRole({ guild_id: guildId, role_id: roleId, metadata: JSON.stringify(metadata), deleted_at: Date.now() }).save();
}

export async function getDeletedRoles(guildId, withinMs = 60000) {
  const docs = await DeletedRole.find({ guild_id: guildId, deleted_at: { $gte: Date.now() - withinMs } }).sort({ deleted_at: -1 });
  return docs.map((r) => ({ ...r.toObject(), metadata: JSON.parse(r.metadata) }));
}

export async function clearDeletedRoles(guildId) {
  await DeletedRole.deleteMany({ guild_id: guildId });
}

export async function saveBannedUser(guildId, userId, executorId) {
  await new BannedUser({ guild_id: guildId, user_id: userId, executor_id: executorId, banned_at: Date.now() }).save();
}

export async function getBannedUsers(guildId, executorId, withinMs = 60000) {
  const docs = await BannedUser.find({ guild_id: guildId, executor_id: executorId, banned_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => r.user_id);
}

export async function clearBannedUsers(guildId, executorId) {
  await BannedUser.deleteMany({ guild_id: guildId, executor_id: executorId });
}

export async function saveKickedUser(guildId, userId, executorId) {
  await new KickedUser({ guild_id: guildId, user_id: userId, executor_id: executorId, kicked_at: Date.now() }).save();
}

export async function getKickedUsers(guildId, executorId, withinMs = 60000) {
  const docs = await KickedUser.find({ guild_id: guildId, executor_id: executorId, kicked_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => r.user_id);
}

export async function clearKickedUsers(guildId, executorId) {
  await KickedUser.deleteMany({ guild_id: guildId, executor_id: executorId });
}

export async function saveUnbannedUser(guildId, userId, executorId) {
  await new UnbannedUser({ guild_id: guildId, user_id: userId, executor_id: executorId, unbanned_at: Date.now() }).save();
}

export async function getUnbannedUsers(guildId, executorId, withinMs = 60000) {
  const docs = await UnbannedUser.find({ guild_id: guildId, executor_id: executorId, unbanned_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => r.user_id);
}

export async function clearUnbannedUsers(guildId, executorId) {
  await UnbannedUser.deleteMany({ guild_id: guildId, executor_id: executorId });
}

export async function saveCreatedChannel(guildId, channelId) {
  await new CreatedChannel({ guild_id: guildId, channel_id: channelId, created_at: Date.now() }).save();
}

export async function getCreatedChannels(guildId, withinMs = 60000) {
  const docs = await CreatedChannel.find({ guild_id: guildId, created_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => r.channel_id);
}

export async function clearCreatedChannels(guildId) {
  await CreatedChannel.deleteMany({ guild_id: guildId });
}

export async function saveCreatedRole(guildId, roleId) {
  await new CreatedRole({ guild_id: guildId, role_id: roleId, created_at: Date.now() }).save();
}

export async function getCreatedRoles(guildId, withinMs = 60000) {
  const docs = await CreatedRole.find({ guild_id: guildId, created_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => r.role_id);
}

export async function clearCreatedRoles(guildId) {
  await CreatedRole.deleteMany({ guild_id: guildId });
}

export async function saveOriginalChannel(guildId, channelId, metadata) {
  await OriginalChannel.findOneAndUpdate(
    { guild_id: guildId, channel_id: channelId },
    { metadata: JSON.stringify(metadata), saved_at: Date.now() },
    { upsert: true }
  );
}

export async function getOriginalChannel(guildId, channelId) {
  const doc = await OriginalChannel.findOne({ guild_id: guildId, channel_id: channelId });
  return doc ? JSON.parse(doc.metadata) : null;
}

export async function getOriginalChannels(guildId, withinMs = 60000) {
  const docs = await OriginalChannel.find({ guild_id: guildId, saved_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => ({ channelId: r.channel_id, metadata: JSON.parse(r.metadata) }));
}

export async function deleteOriginalChannel(guildId, channelId) {
  await OriginalChannel.deleteOne({ guild_id: guildId, channel_id: channelId });
}

export async function clearOriginalChannels(guildId) {
  await OriginalChannel.deleteMany({ guild_id: guildId });
}

export async function saveOriginalRole(guildId, roleId, metadata) {
  await OriginalRole.findOneAndUpdate(
    { guild_id: guildId, role_id: roleId },
    { metadata: JSON.stringify(metadata), saved_at: Date.now() },
    { upsert: true }
  );
}

export async function getOriginalRole(guildId, roleId) {
  const doc = await OriginalRole.findOne({ guild_id: guildId, role_id: roleId });
  return doc ? JSON.parse(doc.metadata) : null;
}

export async function getOriginalRoles(guildId, withinMs = 60000) {
  const docs = await OriginalRole.find({ guild_id: guildId, saved_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => ({ roleId: r.role_id, metadata: JSON.parse(r.metadata) }));
}

export async function deleteOriginalRole(guildId, roleId) {
  await OriginalRole.deleteOne({ guild_id: guildId, role_id: roleId });
}

export async function clearOriginalRoles(guildId) {
  await OriginalRole.deleteMany({ guild_id: guildId });
}

export async function saveOriginalMember(guildId, memberId, roleIds) {
  await OriginalMember.findOneAndUpdate(
    { guild_id: guildId, member_id: memberId },
    { role_ids: JSON.stringify(roleIds), saved_at: Date.now() },
    { upsert: true }
  );
}

export async function getOriginalMember(guildId, memberId) {
  const doc = await OriginalMember.findOne({ guild_id: guildId, member_id: memberId });
  return doc ? JSON.parse(doc.role_ids) : null;
}

export async function getOriginalMembers(guildId, withinMs = 60000) {
  const docs = await OriginalMember.find({ guild_id: guildId, saved_at: { $gte: Date.now() - withinMs } });
  return docs.map((r) => ({ memberId: r.member_id, roleIds: JSON.parse(r.role_ids) }));
}

export async function deleteOriginalMember(guildId, memberId) {
  await OriginalMember.deleteOne({ guild_id: guildId, member_id: memberId });
}

export async function clearOriginalMembers(guildId) {
  await OriginalMember.deleteMany({ guild_id: guildId });
}

export async function saveOriginalServer(guildId, metadata) {
  await OriginalServer.findOneAndUpdate(
    { guild_id: guildId },
    { metadata: JSON.stringify(metadata), saved_at: Date.now() },
    { upsert: true }
  );
}

export async function getOriginalServer(guildId) {
  const doc = await OriginalServer.findOne({ guild_id: guildId });
  return doc ? JSON.parse(doc.metadata) : null;
}

export async function deleteOriginalServer(guildId) {
  await OriginalServer.deleteOne({ guild_id: guildId });
}

export async function runCleanup(timeWindow) {
  const cutoff = Date.now() - timeWindow;
  await Action.deleteMany({ timestamp: { $lt: cutoff } });
  await DeletedChannel.deleteMany({ deleted_at: { $lt: cutoff } });
  await DeletedRole.deleteMany({ deleted_at: { $lt: cutoff } });
  await BannedUser.deleteMany({ banned_at: { $lt: cutoff } });
  await KickedUser.deleteMany({ kicked_at: { $lt: cutoff } });
  await UnbannedUser.deleteMany({ unbanned_at: { $lt: cutoff } });
  await CreatedChannel.deleteMany({ created_at: { $lt: cutoff } });
  await CreatedRole.deleteMany({ created_at: { $lt: cutoff } });
  await OriginalChannel.deleteMany({ saved_at: { $lt: cutoff } });
  await OriginalRole.deleteMany({ saved_at: { $lt: cutoff } });
  await OriginalMember.deleteMany({ saved_at: { $lt: cutoff } });
  await OriginalServer.deleteMany({ saved_at: { $lt: cutoff } });
}

export async function closeDb() {
  await mongoose.disconnect();
}
