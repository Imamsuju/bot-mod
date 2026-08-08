const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');

function checkUserID(message)
{
    message.author.send(`ID Discord anda : \`\`${message.author.id}\`\``);
    return message.reply(`Cek DM anda`);
}

function sendAttachment(message, filePath, description) {
    const attachment = new AttachmentBuilder(filePath);
    message.reply({ content: description, files: [attachment] });
}

module.exports = { checkUserID, sendAttachment };