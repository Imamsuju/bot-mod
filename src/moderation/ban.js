import { PermissionFlagsBits, userMention } from 'discord.js';

export default async function (message, args, config){
    // Check if the author has permission to ban members
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Anda tidak diperbolehkan melakukan penghytaman.");
    }

    // Get the mentioned user or target ID
    const targetUserBan = message.mentions.users.first();
    if (!targetUserBan || targetUserBan == config.clientId) {
        return message.reply("❌ Tolong sediakan username atau ID User orang yang ingin dihytamkan.");
    }

    // Extract the ban reason (if any provided)
    const reasonBan = args.slice(-1).join(' ') || 'No reason provided';

    try {
        // Attempt to resolve the target as a guild member
        const targetMemberBan = typeof targetUserBan === 'string' 
            ? await message.guild.members.fetch(targetUserBan).catch(() => null)
            : await message.guild.members.fetch(targetUserBan.id).catch(() => null);
    
        // If the user is in the guild, verify if they are bannable
        if (targetMemberBan) {
            if (!targetMemberBan.bannable) {
                return message.reply(`❌ Mohon maaf, saya tidak bisa menghytamkan ${targetMemberBan} karena posisinya lebih tinggi dari saya.`);
            }
            
            // DM the user before executing the ban
            await targetMemberBan.send(`⚠️ Kamu telah di Ban dari **${message.guild.name}** dikarenakan: ${reasonBan}`).catch(() => {
                console.log("Could not send DM to the user.");
            });
    
            await targetMemberBan.ban({ reason: reasonBan });
            return message.reply(`✅ Selamat, anda berhasil meng hytam kan **${targetMemberBan.user.tag}** karena: ${reasonBan}`);
        } else {
            // If the user is not in the server, ban them via user ID directly
            const userId = typeof targetUserBan === 'string' ? targetUserBan : targetUserBan.id;
            await message.guild.bans.create(userId, { reason: reasonBan });
            return message.reply(`✅ Selamat, anda berhasil meng hytam kan ID **${userId}** karena: ${reasonBan}`);
        }
    } catch (error) {
        console.error(error);
        return message.reply(`❌ Mohon maaf, saya tidak bisa menghytamkan ${targetUserBan} karena posisinya lebih tinggi dari saya.`);
    }
}

/*

*/