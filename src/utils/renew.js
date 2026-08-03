const cron = require('node-cron');

module.exports = function renew(client, config){
    // Runs every day at 19:00 WIB (7 PM WIB)
    cron.schedule('0 19 * * *', () => {
        const tuan = client.users.fetch(config.creatorId);
        tuan.then(user => user.send("Saatnya melakukan pengecekan server, jangan lupa untuk melakukan perpanjangan server ya\nCek di https://pella.app/"));
    }, {
        timezone: "Asia/Jakarta" // Set your local timezone
    });
}