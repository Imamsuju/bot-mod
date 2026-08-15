require('dotenv').config();

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  moderatorId: process.env.MODERATOR_ID,
  creatorId: process.env.CREATOR_ID,
  membershipId: process.env.MEMBERSHIP_ID,
  ownerId:process.env.OWNER_ID,
  reminderChannelId: process.env.REMINDER_CHANNEL_ID,
  happyBirthdayChannelId: process.env.HAPPY_BIRTHDAY_CHANNEL_ID,
  muteThreshold: parseInt(process.env.MUTE_THRESHOLD, 10) || 5,
  kickThreshold: parseInt(process.env.KICK_THRESHOLD, 10) || 10,
  banThreshold: parseInt(process.env.BAN_THRESHOLD, 10) || 20,
  pendudukLokalId:process.env.PENDUDUK_LOKAL_ID,
  pendatangId:process.env.PENDATANG_ID
};
