import { PermissionFlagsBits, userMention } from 'discord.js';

export default function (message){
    // Permission validation check
    if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply('❌ Anda tidak diperbolehkan melepas pembungkaman.');
    }

    const targetLepas = message.mentions.members.first();
    if (!targetLepas) return message.reply('❌ Tolong berikan username atau ID target yang akan dilepas pembungkamannya');

    if (!targetLepas.communicationDisabledUntilTimestamp) {
        return message.reply('ℹ️ User ini sedang tidak dibungkam.');
    }

    try {
        // Remove Timeout by sending null timeout value
        targetLepas.timeout(null);
        message.reply(`🔊 **${targetLepas.user.tag}** berhasil dilepas pembungkamannya.`);
    } catch (error) {
        console.error(error);
        message.reply('❌ Gagal melepas pembungkaman.');
    }
}