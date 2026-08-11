const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { sendAttachment, checkUserID } = require('./public');
const { warn } = require('../moderation/mod');

function getUser(message, config){
    // Get the mentioned user or target ID
    const user = message.mentions.users.first();
    if (!user || user == config.clientId) {
        return console.error("❌ Please insert valid username or ID User.");
    }
    return user;
}

function checkCommand(command){
    const COMMAND = path.join(__dirname, '../db/command.json');
    const commandData = JSON.parse(fs.readFileSync(COMMAND, 'utf8'));
    return commandData.some(cmd => cmd.name === command);
}

function moderatorOnly(message){
    // Check if the member has moderator permissions
    const isMod = message.member.permissions.has([
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ManageMessages
    ]);
    if (isMod) {
        console.log(`${message.author.tag} is a moderator.`);
        return true;
    } else {
        console.log("You do not have permission to use this command.");
        return false;
    }
}

function isMembershipMember(message, config){
    // Check if the member has the membership role
    const isMember = message.member.roles.cache.has(config.membershipId);
    if (isMember) {
        console.log(`${message.author.tag} is a membership member.`);
        return true;
    } else {
        console.log("You must be a membership member to use this command.");
        return false;
    }
}

function getCommand(commandName){
    const COMMAND = path.join(__dirname, '../db/command.json');
    const commandData = JSON.parse(fs.readFileSync(COMMAND, 'utf8'));
    return commandData.find(cmd => cmd.name === commandName);
}

function verifyCommandPermissions(cmd, message, config) {
    if (cmd.moderator && !moderatorOnly(message)) {
        message.reply("❌ Anda tidak diperbolehkan menggunakan perintah keluarga kerajaan.");
        return false;
    }

    if (cmd.membership && !isMembershipMember(message, config)) {
        message.reply("❌ Anda harus menjadi anggota berlangganan untuk menggunakan perintah ini.");
        return false;
    }

    return true;
}

function executeCommand(command, message, args, config) {
    const cmd = getCommand(command); // Check if the command is valid
    if (!cmd) {
        console.log(`Command "${command}" not recognized.`);
        return false;
    }
    console.log(cmd);
    const targetUser = getUser(message, config);
    console.log(targetUser);

    const reason = args.slice(1).join(' ') || 'No reason provided';

    switch (command) {
        case 'hytamkan':
            require('./ban')(message, args, config);
            break;

        case 'musnahkan':
            require('./kick')(message, args, config);
            break;

        case 'bungkam':
            require('./mute')(message, args, config);
            break;

        case 'lepaskan':
            require('./unmute')(message, args, config);
            break;

        case 'tandai':
            console.log(`Command "tandai" recognized.`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message, config)){
                if(warn.addWarning(targetUser.id, reason)){
                    totalWarnings = warn.getUserWarnings(targetUser.id).length;
                    message.reply(`✅ <@${targetUser.id}> sudah ditandai dengan alasan "${reason}". Total tanda yang aktif: ${totalWarnings}`);
                } else {
                    message.reply("❌ Gagal menandai target.");
                }
            }
            break;

        case 'id':
            console.log(`Command "id" recognized.`);
            // Checking if the user is a moderator or membership member
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message, config)){
                return checkUserID(message);
            }
            break;

        case 'sayang':
            console.log(`Command "sayang" recognized.`);
            // Checking if the user is a moderator or membership member
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message, config)){
                if (isMembershipMember(message,config)) {
                    return sendAttachment(message, './src/img/sayang-member.webp', 'Ini untukmu sayangku! 💖');
                } else {
                    return sendAttachment(message, './src/img/sayang-non-member.webp', 'Ini untukmu sayangku, muach (kiss dari jauh)! 💖');
                }
            }
            break;
            
        case 'nyebut':
            console.log(`Command "nyebut" recognized.`);
            // Checking if the user is a moderator or membership member
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message, config)){
                return sendAttachment(message, './src/img/astagfirullah.webp', '');
            }
            break;

        default:
            console.log(`Command "${command}" not recognized.`);
            break;
    }
}

module.exports = {
    getUser,
    checkCommand,
    moderatorOnly,
    isMembershipMember,
    executeCommand
}