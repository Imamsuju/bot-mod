import { PermissionFlagsBits, userMention } from 'discord.js';
import ms from "ms";

export default function (message, config, args){
    // Permission validation check
    if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply('❌ Anda tidak diperbolehkan melakukan pembungkaman.');
    }

    const targetMute = message.mentions.members.first();

    if (!targetMute || targetMute.user.id === config.clientId) return message.reply('❌ Tolong berikan username target yang akan dibungkam. Contohnya: `@MAID HYTAM bungkam @user 10d`');

    // Prevent users from muting themselves or administrators
    if (targetMute.id === message.author.id) return message.reply('❌ Kamu tidak bisa membungkam dirimu sendiri.');
    if (!targetMute.moderatable) return message.reply('❌ Saya tidak bisa membungkam target karena posisi target lebih tinggi.');

    const durationStr = args[1] || "1m";

    // const durationMs = ms(durationStr);
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

    // Extract the mute reason (if any provided)
    const reasonMute = args.slice(2).join(' ') || 'No reason provided';

    try {
        // Apply native Discord Timeout (Mute)
        targetMute.timeout(durationMs, reasonMute);
        message.reply(`🤐 **${targetMute.user.tag}** telah dibungkam selama **${durationStr}** | karena: *${reasonMute}*`);
    } catch (error) {
        console.error(error);
        message.reply('❌ Gagal melakukan pembungkaman karena ada error di sistem.');
    }

    // return message;
}

/*
// Permission validation check
if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
    return message.reply('❌ Anda tidak diperbolehkan melakukan pembungkaman.');
}

let targetMute = message.mentions.members.first();

if (!targetMute) return message.reply('❌ Tolong berikan username target yang akan dibungkam. Contohnya: `@MAID HYTAM bungkam @user 10d`');

// Prevent users from muting themselves or administrators
if (targetMute.id === message.author.id) return message.reply('❌ Kamu tidak bisa membungkam dirimu sendiri.');
if (!targetMute.moderatable) return message.reply('❌ Saya tidak bisa membungkam target karena posisi target lebih tinggi.');

const durationStr = args[1] || "60s";
// if (!durationStr) return message.reply('❌ Tolong kasih waktu pembungkaman (contohnya 10m, 1h, 1d).');

const durationMs = ms(durationStr);
if (!durationMs || durationMs < 10000 || durationMs > 2419200000) {
    return message.reply('❌ Kasih waktu pembungkaman yang jelas, antara 10 detik atau 28 hari');
}

// Extract the mute reason (if any provided)
const reasonMute = args.slice(2).join(' ') || 'No reason provided';

try {
    // Apply native Discord Timeout (Mute)
    await targetMute.timeout(durationMs, reasonMute);
    message.channel.send(`🤐 **${targetMute.user.tag}** telah dibungkam selama **${durationStr}** | karena: *${reasonMute}*`);
} catch (error) {
    console.error(error);
    message.reply('❌ Gagal melakukan pembungkaman karena ada error di sistem.');
}
*/