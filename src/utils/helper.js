const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { warn, unmute, mute } = require('../moderation/mod');
const { membershipId, clientId, muteThreshold, kickThreshold, banThreshold } = require('./config');

function getUser(message){
    // Get the mentioned user or target ID
    const user = message.mentions.users.first();
    if (!user || user.id === clientId) {
        return console.log("❌ Tolong kasih username yang jelas.");
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

function isMembershipMember(message){
    // Check if the member has the membership role
    const isMember = message.member.roles.cache.has(membershipId);
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

function verifyCommandPermissions(cmd, message) {
    if (cmd.moderator && !moderatorOnly(message)) {
        message.reply("❌ Anda tidak diperbolehkan menggunakan perintah keluarga kerajaan.");
        return false;
    }

    if (cmd.membership && !isMembershipMember(message)) {
        message.reply("❌ Anda harus menjadi anggota berlangganan untuk menggunakan perintah ini.");
        return false;
    }

    return true;
}

function countDurationMs(durationStr){
    let durationMs = 0;
    const unit = durationStr.slice(-1);
    const value = parseInt(durationStr.slice(0, -1));

    if (isNaN(value)) {
        return message.reply('❌ Kasih waktu pembungkaman yang benar dong, waktunya bukan angka');
    }

    switch (unit) {
        case 'm':
            durationMs = value * 60 * 1000;
            if(value > 60) {
                return message.reply('❌ Bang, menit itu cuma sampe 60, yang bener dong');
            }
            break;
        case 'h':
            durationMs = value * 60 * 60 * 1000;
            if(value > 24) {
                return message.reply('❌ Bang, jam itu cuma sampe 24, yang bener dong');
            }
            break;
        case 'd':
            durationMs = value * 24 * 60 * 60 * 1000;
            break;
        default:
            return message.reply('❌ Kasih satuan waktunya yang jelas. gunakan m untuk menit, h untuk jam, atau d untuk hari.');
    }

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
        return message.reply('❌ Durasi pembungkaman tidak boleh lebih dari 28 hari.');
    }
    return durationMs;
}

function checkThreshold(message){
    const targetUser = getUser(message);
    const totalWarnings = warn.getUserWarnings(targetUser.id).length;
    console.log(totalWarnings);
    if(totalWarnings >= banThreshold) {
        return message.reply(`<@${targetUser.id}>, karena sudah memiliki lebih dari ${banThreshold} tanda.\nMaka dengan titah kerajaan Gato Palace, kau ku Hytamkan.\nGosong Chef!!!`);
    } else if(totalWarnings >= kickThreshold){
        return message.reply(`<@${targetUser.id}>, karena sudah memiliki lebih dari ${kickThreshold} tanda.\nMaka dengan titah kerajaan Gato Palace, kau ku Tendang.\nBismillah...\n1\n2\n3\nRider Kick!!!`);
    } else if(totalWarnings >= muteThreshold){
        mute.timeoutUserById(message,targetUser.id,countDurationMs("12h"), "Terkena 5 warning");
        return message.reply(`<@${targetUser.id}>, karena sudah memiliki lebih dari ${muteThreshold} tanda.\nMaka dengan titah kerajaan Gato Palace, kau ku Bungkam.\nAwokwowkowkwokwokwokwok`);
    }
    return false;
}

async function checkUserID(message)
{
    message.author.send(`ID Discord anda : \`\`${message.author.id}\`\``);
    await message.reply(`Cek DM anda`);
}

async function sendAttachment(message, filePath, description) {
    const attachment = new AttachmentBuilder(filePath);
    await message.reply({ content: description, files: [attachment] });
}

async function executeCommand(command, message, args) {
    const cmd = getCommand(command); // Check if the command is valid
    if (!cmd) {
        console.log(`Command "${command}" not recognized.`);
        return false;
    }
    console.log(cmd);
    const targetUser = getUser(message);
    console.log(targetUser);

    const reason = args.slice(2).join(' ') || 'No reason provided';
    const duration = args[1] || "24h";    

    switch (command) {
        case 'hytamkan':
            break;

        case 'musnahkan':
            break;

        case 'bungkam':
        case 'silence':
            console.log(`Command "bungkam" recognized`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if(mute.timeoutUserById(message,targetUser.id,countDurationMs(duration), reason)){
                    return message.reply(`✅ <@${targetUser.id}> berhasil dibungkam dengan **Righteous Fervor (Skill 1 Mortos AoV)** selama ${duration}.\nTidurlah dengan nyenyak selama terkena skill ini.\nLATOM🙏`);
                };
            }
            break;

        case 'lepaskan':
            console.log(`Command "lepaskan" recognized`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if(mute.kaiho(message, targetUser.id, reason)) {
                    return message.reply(`✅ <@${targetUser.id}> berhasil dibebaskan dari pembungkaman\nJangan lupa ucapkan terimakasih dulu <@${targetUser.id}>`)
                }
            }
            break;

        case 'tandai':
            console.log(`Command "tandai" recognized.`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if(warn.addWarning(targetUser.id, reason, countDurationMs(duration))){
                    totalWarnings = warn.getUserWarnings(targetUser.id).length;
                    if(!checkThreshold(message)){
                        return message.reply(`✅ <@${targetUser.id}> sudah ditandai dengan alasan "${reason}". Total peringatan yang aktif: ${totalWarnings}`);
                    }
                } else {
                    message.reply(`❌ Gagal memberi peringatan ke ${targetUser.id}.`);
                }
            }
            break;

        case 'id':
            console.log(`Command "id" recognized.`);
            // Checking if the user is a moderator or membership member
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                return checkUserID(message);
            }
            break;

        case 'sayang':
            console.log(`Command "sayang" recognized.`);
            // Checking if the user is a moderator or membership member
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if (isMembershipMember(message)) {
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
            if(verifyCommandPermissions(cmd, message)){
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