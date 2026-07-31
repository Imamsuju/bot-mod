export default function (message){
    console.log('kick');
    return message;
}

/*

// Check if the author has permission to kick members
if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return message.reply("❌ Anda tidak diperbolehkan melakukan pemusnahan.");
}

// Get the mentioned user or target ID
const targetUserKick = message.mentions.users.first() || args[0];
if (!targetUserKick) {
    return message.reply("❌ Tolong sediakan username atau ID User orang yang ingin dimusnahkan.");
}

// Extract the ban reason (if any provided)
const reasonKick = args.slice(1).join(' ') || 'No reason provided';

// Attempt to resolve the target as a guild member
let targetMemberKick = await message.guild.members.fetch(targetUserKick.id).catch(() => null);

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
    
    await targetMemberKick.kick({ reason: reason });
    return message.reply(`✅ Selamat, anda berhasil memusnahkan **${targetMemberKick.user.tag}** karena: ${reasonKick}`);

} catch (error) {
    console.error(error);
    return message.reply(`❌ Mohon maaf, saya tidak bisa memusnahkan ${targetUserKick} karena posisinya lebih tinggi dari saya.`);
}
*/