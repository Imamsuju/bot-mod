export default function(message)
{
    message.author.send(`ID Discord anda : \`\`${message.author.id}\`\``);
    return message.reply(`Cek DM anda`);
}