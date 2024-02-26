const { queues } = require("./play");
const { playQueue } = require("./play");

async function skip(interaction) {
    try {
        const guildId = interaction.guild.id;
        const serverQueue = queues.get(guildId);

        if (!serverQueue || !serverQueue.connection) {
            return interaction.reply("📡 Es gibt keine aktive Warteschlange, die übersprungen werden kann.");
        }

        if (serverQueue.songs.length <= 1) {
            return interaction.reply("📡 Es gibt keine weiteren Songs in der Warteschlange zum Überspringen. Wenn du die Musik beenden willst, benutze **/stop**.");
        }

        // Wait for a short time before playing the next song
        setTimeout(() => {
            // Remove the current song from the queue
            serverQueue.songs.shift();

            console.log(`Länge: ${serverQueue.songs.length}`)
            if (serverQueue.songs.length > 0) {
                // Play the next song in the queue
                playQueue(interaction.guild, serverQueue, serverQueue.songs[0]);
            } else {
                // No more songs in the queue, clean up
                const connection = getVoiceConnection(guildId);
                if (connection && !connection.destroyed) {
                    connection.destroy();
                }
                queues.delete(guildId);
            }
        }, 1000); // Adjust the delay as needed

        interaction.reply("📡 Song übersprungen!");
    } catch (error) {
        console.error("Fehler beim Überspringen des Songs:", error);
        interaction.reply("📡 Ein Fehler ist beim Überspringen des Songs aufgetreten.");
    }
}

module.exports = skip;