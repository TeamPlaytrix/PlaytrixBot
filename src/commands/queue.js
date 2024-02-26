const { queues } = require("./play.js");

async function queue(interaction) {
    if(queues.size === 0) {
        interaction.reply(`📡 Die aktuelle Queue ist leer.`);
    } else {
        const serverQueue = queues.get(interaction.guild.id)
        let message = "📡 **Die aktuelle Queue:**\n\n▶️ **Spielt jetzt:** ";

        for (let index = 0; index < serverQueue.songs.length; index++) {
            let titleElement;
            if(index !== 0) {
                titleElement = `⬆️ **Spielt danach:** ${serverQueue.songs[index].title}\n\n`;
            } else {
                titleElement = `${serverQueue.songs[index].title}\n\n`;
            }
            message += titleElement;
        }
        if (!interaction.replied) {
            interaction.reply(message);
            return;
        }
        return message;
    }

}

module.exports = queue;