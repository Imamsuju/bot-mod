const { Client, GatewayIntentBits, PermissionFlagsBits, userMention } = require('discord.js');
const config = require('./utils/config');
const mod = require('./moderation/mod');
const utils = require('./utils/utils');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// Helper function to escape special regex characters from a static prefix
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const staticPrefix = '!'; // Your default text prefix

// Cleaning up expired warnings 
mod.warn.startCleanupTask(client, config);
// Check Renew Server
utils.cron.startRenewTask(client, config);
// Check Happy Birthday
utils.cron.happyBirthdayTask(client, config);
// ini buat yang gabung sebelum tanggal 15 Agustus 2026
utils.cron.setPendudukLocal(client, config);

utils.helper.setRolePenduduk(client, config);

// Bot online
client.once('clientReady', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Listen and respond to messages 
client.on('messageCreate', async(message) => { 

  // Ignore messages from bots 
  if (message.author.bot) return;

  // Ignore broad pings like @everyone or @here
  if (message.content.includes('@here') || message.content.includes('@everyone')) return;

  // Matches standard text prefix OR standard bot mention (<@id>) OR nickname bot mention (<@!id>)
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(staticPrefix)})\\s*`);

  // Stop execution if the message doesn't start with the mention or prefix
  if (!prefixRegex.test(message.content)) return;

  // Determine which prefix matched and separate it from the message text
  const [, matchedPrefix] = message.content.match(prefixRegex);
  
  // Slice off the matched prefix length, trim trailing spaces, and split by spaces for args
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

  // Extract the command name from the first argument array element
  const command = args.shift().toLowerCase();

  // Check if the bot's user ID is explicitly mentioned
  if (message.mentions.has(client.user.id)) {
      try {
          // Sends an in-thread inline reply directly linking back to the original message
          // console.log(args);
          const targetUser = utils.helper.getUser(message, config);
          console.log(targetUser);
          console.log(utils.helper.moderatorOnly(message));
          console.log(utils.helper.checkCommand(command));

          // Check if the user is a moderator
          if (utils.helper.moderatorOnly(message)) {
            utils.helper.executeCommand(command, message, args);
            // Check if the author is the owner or creator
            if(message.author.id === config.creatorId || message.author.id === config.ownerId){
              // Check if the command is invalid 
              if(!utils.helper.checkCommand(command)){
                return message.reply(`Selamat datang, Yang Mulia <@${message.author.id}> <:ranilove:1243122088093417493>`);
              }
            }
            // Check if the command is invalid 
            if(!utils.helper.checkCommand(command)){
              return message.reply(`Halo <@${message.author.id}>, aku siap membantu kamu. Silahkan gunakan perintah yang tersedia.`);
            }
          } else if(utils.helper.isMembershipMember(message, config)){
            // Check if the author is a membership member
            utils.helper.executeCommand(command, message, args);
            // Check if the command is invalid
            if(!utils.helper.checkCommand(command)){
              return message.reply(`Halo <@${message.author.id}>, aku siap membantu kamu.\nKalau tidak ingin dijutekin oleh aku, tetap membership yaa sayangku <:ranilove:1243122088093417493>`);
            }
        }
        else{
          utils.helper.executeCommand(command, message, args);
          // Check if the command is valid 
          if(!utils.helper.checkCommand(command)){
            return message.reply(`Siapa Elo?\nMau ngapain? Aku ga kenal sama elo, aku cuma kenal sama ownerku, moderator ku, dan <@${config.creatorId}>.`);
          }
        }
        } catch (error) {
          console.error('Failed to send reply:', error);
      }
  }
});

client.login(config.token);