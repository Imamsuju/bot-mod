import { PermissionFlagsBits, userMention } from 'discord.js';

export default async function (message, args, config){
    // Check if the author has permission to kick members
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Anda tidak diperbolehkan melakukan pemusnahan.");
    }

    // Get the mentioned user or target ID
    const targetUserKick = message.mentions.users.first();
    if (!targetUserKick || targetUserKick == config.clientId) {
        return message.reply("❌ Tolong sediakan username orang yang ingin dimusnahkan.");
    }

    // Extract the ban reason (if any provided)
    const reasonKick = args.slice(1).join(' ') || 'No reason provided';

    // Attempt to resolve the target as a guild member
    const targetMemberKick = await message.guild.members.fetch(targetUserKick.id).catch(() => null);

    if (!targetMemberKick) {
        return message.reply(`User tersebut tidak ada di server ini.`);
    }

    // Safety check: Ensure the bot has permissions to kick the member
    if (!targetMemberKick.kickable) {
        return message.reply(`❌ Mohon maaf, saya tidak bisa memusnahkan ${targetUserKick} karena ${targetUserKick} tidak bisa dimusnahkan.`);
    }

    try {
        // DM the user before executing the kick
        await targetMemberKick.send(`⚠️ Kamu telah di Kick dari **${message.guild.name}** dikarenakan: ${reasonKick}`).catch(() => {
            console.log("Could not send DM to the user.");
        });
        
        await targetMemberKick.kick({ reason: reasonKick });
        return message.reply(`✅ Selamat, anda berhasil memusnahkan **${targetMemberKick.user.tag}** karena: ${reasonKick}`);
    
    } catch (error) {
        console.error(error);
        return message.reply(`❌ Mohon maaf, saya tidak bisa memusnahkan ${targetUserKick} karena posisinya lebih tinggi dari saya.`);
    }
}