const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { warn, mute, kick, ban } = require('../moderation/mod');
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

async function checkThreshold(message){
    const targetUser = getUser(message);
    const totalWarnings = warn.getUserWarnings(targetUser.id).length + 1;
    console.log(totalWarnings);
    if(totalWarnings >= banThreshold) {
        ban.hytamkan(message,targetUser,`Terkena ${banThreshold} Warning`);
        return message.reply(`<@${targetUser.id}>, karena sudah memiliki lebih dari ${banThreshold} tanda.\nMaka dengan titah kerajaan Gato Palace, kau ku Hytamkan.\nhttps://tenor.com/view/tewas-dihitamkan-patrick-hitam-gif-18417932086044069974`);
    } else if(totalWarnings >= kickThreshold){
        let count = 0;
    
        const intervalId = setInterval(() => {
        count++;
        console.log(`Count: ${count}`);
        message.reply(`${count}`);

        // Stop the interval once the count reaches 5
        if (count === 3) {
            clearInterval(intervalId);
            message.reply(`https://klipy.com/gifs/kamen-rider-kabuto-kamen-rider-stronger`);
            console.log("Timer stopped.");
            const riderKick = setTimeout(()=>{
                kick.tendang(message, targetUser, `Terkena ${kickThreshold} warning`);
            }, 3000)
        }
        }, 1000);
    } else if(totalWarnings >= muteThreshold){
        mute.timeoutUserById(message,targetUser.id,countDurationMs("12h"), `Terkena ${muteThreshold} warning`);
        await message.reply(`https://klipy.com/gifs/ssst-isilop`);
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

function selfTarget(message, targetUser){
    console.log(targetUser.id);
    if (targetUser.id === message.author.id) return message.reply('❌ Kamu tidak bisa menargetkan dirimu sendiri.');
}

function kickable(message, targetUser){
    console.log(targetUser);
    const targetKick = message.guild.members.cache.get(targetUser.id);
    if (!targetKick.kickable) return message.reply('❌ Saya tidak bisa menendang target karena posisi target lebih tinggi.');
}
function bannable(message, targetUser){
    console.log(targetUser);
    const targetBan = message.guild.members.cache.get(targetUser.id);
    if (!targetBan.bannable) return message.reply('❌ Saya tidak bisa memghytamkan target karena posisi target lebih tinggi.');
}
function moderatable(message, targetUser){
    const targetModeratable = message.guild.members.cache.get(targetUser.id);
    if (!targetModeratable.moderatable) return message.reply('❌ Saya tidak bisa menendang target karena posisi target lebih tinggi.');
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

    let reason = args.slice(2).join(' ') || 'No reason provided';
    let duration = args[1] || "24h";    

    switch (command) {
        case 'hytamkan':
            console.log(`Command "hytamkan" recognized`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if (verifyCommandPermissions(cmd, message)) {
                if(!selfTarget(message, targetUser)){
                    if(!bannable(message, targetUser)){
                        let reasonBan = '';
                        if(duration === "24h"){
                            reasonBan = `${reason}`;
                        } else {
                            reasonBan = `${duration} ${reason}`;
                        }
                        console.log(reasonBan);
                        ban.hytamkan(message,targetUser,reasonBan);
                        return message.reply(`https://tenor.com/view/tewas-dihitamkan-patrick-hitam-gif-18417932086044069974`);
                    }
                }
            }
            break;

        case 'musnahkan':
            console.log(`Command "musnahkan" recognized`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if (!selfTarget(message, targetUser)) {
                    if (!kickable(message,targetUser)) {
                        let reasonKick = `${duration} ${reason}`; 
                        let count = 0;
    
                        const intervalId = setInterval(() => {
                        count++;
                        console.log(`Count: ${count}`);
                        message.reply(`${count}`);
    
                        // Stop the interval once the count reaches 5
                        if (count === 3) {
                            clearInterval(intervalId);
                            message.reply(`https://klipy.com/gifs/kamen-rider-kabuto-kamen-rider-stronger`);
                            console.log("Timer stopped.");
                            const riderKick = setTimeout(()=>{
                                let reasonKick = ''
                                if(duration === "24h"){
                                    reasonKick = `${reason}`;
                                } else {
                                    reasonKick = `${duration} ${reason}`;
                                }
                                console.log(reasonKick);
                                kick.tendang(message, targetUser, reasonKick);
                            }, 3000)
                        }
                        }, 1000);
                    }
                }
            }
            break;

        case 'bungkam':
        case 'silence':
            console.log(`Command "bungkam" recognized`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if (!selfTarget(message, targetUser)) {
                    if(!moderatable(message, targetUser)){
                        if(mute.timeoutUserById(message,targetUser.id,countDurationMs(duration), reason)){
                            await message.reply(`https://klipy.com/gifs/ssst-isilop`);
                            return message.reply(`✅ <@${targetUser.id}> berhasil dibungkam dengan **Righteous Fervor (Skill 1 Mortos AoV)** selama ${duration}.\nTidurlah dengan nyenyak selama terkena skill ini.\nLATOM🙏`);
                        }
                    }
                }
            }
            break;

        case 'lepaskan':
            console.log(`Command "lepaskan" recognized`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if (!selfTarget(message,targetUser)) {
                    const reasonKai = `${duration} ${reason}`;
                    if(mute.kaiho(message, targetUser.id, reasonKai)) {
                        return message.reply(`✅ <@${targetUser.id}> berhasil dibebaskan dari pembungkaman\nJangan lupa ucapkan terimakasih dulu kepada <@${message.author.id}> karena sudah membebaskanmu dari pembungkaman`)
                    }
                }
            }
            break;

        case 'tandai':
            console.log(`Command "tandai" recognized.`);
            console.log(`Moderator Only: ${cmd.moderator}, Membership Only: ${cmd.membership}`);
            if(verifyCommandPermissions(cmd, message)){
                if (!selfTarget(message,targetUser)) {
                    if(warn.addWarning(targetUser.id, reason, countDurationMs(duration))){
                        checkThreshold(message);
                        totalWarnings = warn.getUserWarnings(targetUser.id).length + 1;
                        return message.reply(`✅ <@${targetUser.id}> sudah ditandai dengan alasan "${reason}". Total peringatan yang aktif: ${totalWarnings}`);
                    } else {
                        message.reply(`❌ Gagal memberi peringatan ke ${targetUser.id}.`);
                    }
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
            return false;
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