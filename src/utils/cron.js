const cron = require('node-cron');
const fs = require('fs');

module.exports = {
    startRenewTask: function(client, config) {
        // Runs every day at 19:00 WIB (7 PM WIB)
        cron.schedule('0 19 * * *', () => {
            const tuan = client.users.fetch(config.creatorId);
            tuan.then(user => user.send("Saatnya melakukan pengecekan server, jangan lupa untuk melakukan perpanjangan server ya\nCek di https://pella.app/"));

            const channel = client.channels.fetch(config.reminderChannelId);
            channel.then(ch => ch.send("Saatnya melakukan pengecekan server, jangan lupa untuk melakukan perpanjangan server ya\nCek di https://pella.app/"));
        }, {
            timezone: "Asia/Jakarta" // Set your local timezone
        });
    },
    happyBirthdayTask: function(client, config) {
        // Runs every day at 00:00 WIB (midnight WIB)
        cron.schedule('0 0 * * *', async () => {
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
    }
}