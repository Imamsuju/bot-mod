const cron = require('node-cron');
const fs = require('fs');

module.exports = {
    startRenewTask: function(client, config) {
        // Runs every day at 18:00 WIB (6 PM WIB)
        cron.schedule('0 18 * * *', () => {
            const tuan = client.users.fetch(config.creatorId);
            tuan.then(user => user.send("Saatnya melakukan pengecekan server, jangan lupa untuk melakukan perpanjangan server ya\nCek di https://fps.ms/"));

            const channel = client.channels.fetch(config.reminderChannelId);
            channel.then(ch => ch.send("Saatnya melakukan pengecekan server, jangan lupa untuk melakukan perpanjangan server ya\nCek di https://fps.ms/"));
        }, {
            timezone: "Asia/Jakarta" // Set your local timezone
        });
    },
    happyBirthdayTask: function(client, config) {
        // Runs every day at 05:00 WIB
        cron.schedule('0 5 * * *', async () => {
            // Implementation for birthday greetings
            const rawData = fs.readFileSync('./src/db/ultah.json');
            const birthdays = JSON.parse(rawData);

            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const currentDate = `${month}-${day}`;
            console.log(`Checking birthdays for date: ${currentDate}`);

            const channel = await client.channels.fetch(config.happyBirthdayChannelId).catch(() => null);
            if (!channel) return;

            for (const [userId, bday] of Object.entries(birthdays)) {
                if (bday === currentDate) {
                    channel.send(`Happy Birthday to <@${userId}>! 🎉🎂\nAs Always https://youtu.be/KnJ7oeJzXyo?si=dxxMIJF4pnMn2e8c\nSemoga sehat selalu dan diberi kemudahan dalam setiap langkah kehidupan 🙏`);
                }
            }
        }, {
            timezone: "Asia/Jakarta"
        });
    },
    setPendudukLocal:function(client, config) {
        // Dilakukan tiap jam 6 Pagi WIB
        cron.schedule('0 6 * * *', async () => {
            const guild = client.guilds.cache.get(config.guildId);
            const pendudukLocal = config.pendudukLokalId;
            const pendatang = config.pendatangId;

            // Fetch members and filter those who meet your criteria
            const members = await guild.members.cache.filter(member => !member.user.bot);
            const now = Date.now();
            const delayMs = 30 * 24 * 60 * 60 * 1000; // 30 days

            for (const [id, member] of members) {
                if (!member.roles.cache.has(pendudukLocal)) {
                    if (now - member.joinedTimestamp >= delayMs) {
                        await member.roles.add(pendudukLocal).catch(console.error);
                        await member.roles.remove(pendatang).catch(console.error);
                    }
                }
            }
        });
    }
}