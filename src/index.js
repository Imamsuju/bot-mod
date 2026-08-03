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

// Check Renew Server
const renew = require('./utils/renew');
renew(client, config);

// Helper function to escape special regex characters from a static prefix
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const staticPrefix = '!'; // Your default text prefix

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
          if(message.member.roles.cache.has(config.moderatorId)){
            // console.log(args);
            
            switch (command) {
              case "ping":
                await message.reply('Pong!');
                break;

              case "hytamkan":
                mod.ban.default(message, args, config);
                break;

              case "musnahkan":
                mod.kick.default(message, args, config);
                break;

              case "bungkam":
                mod.mute.default(message, args, config);
                break;

              case "lepaskan":
                mod.unmute.default(message);
                break;

              case "tandai":
                await message.reply('User telah diberi peringatan');
                break;
              
              case "id":
                utils.userid.default(message);
                break;
                
              default:
                if (message.member.id == config.creatorId || message.member.id == config.ownerId) {
                  await message.reply(`Selamat datang, Yang Mulia <@${message.member.id}> <:ranilove:1243122088093417493>`);
                } else {
                  await message.reply('Hallo, ada yang bisa saya bantu? <:raniwow:1243122472379748402>');
                }
                break;
            }
          } else if (message.member.roles.cache.has(config.membershipId)) {
            switch (command) {
              case "ping":
                await message.reply('Pong!');
                break;
              
              case "id":
                utils.userid.default(message);
                break;

              default:
                await message.reply('Hallo, ada yang bisa saya bantu? <:raniwow:1243122472379748402>');
                break;
            }
          } else {
            switch (command) {
              case "id":
                utils.userid.default(message);
                break;
            
              default:
                await message.reply(`Siapa elo? <:raniwlee:1243122882973012081>`);
                break;
            }
          }
      } catch (error) {
          console.error('Failed to send reply:', error);
      }
  }
});

client.login(config.token);