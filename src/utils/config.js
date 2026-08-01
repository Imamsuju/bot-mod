require('dotenv').config();

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  moderatorId: process.env.MODERATOR_ID,
  creatorId: process.env.CREATOR_ID,
  membershipId: process.env.MEMBERSHIP_ID,
  ownerId:process.env.OWNER_ID
};
