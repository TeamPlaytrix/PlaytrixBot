const {  getVoiceConnection } = require('@discordjs/voice');
const removeNick = require("./removeNick");

async function stop(interaction) {
    try {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) return interaction.reply("📡 Du musst in einem Sprachkanal sein, um die Ausgabe zu stoppen!");

        const connection = getVoiceConnection(voiceChannel.guild.id);

        if (connection) {
            const playerSubscription = connection.state?.subscription;

            if (playerSubscription) {
                const audioPlayer = playerSubscription.player;

                if (audioPlayer) {
                    audioPlayer.stop();
                    if(connection && !connection.destroyed) {
                        connection.destroy();
                        removeNick(interaction);
                    }
                    interaction.reply("📡 Die Ausgabe wurde gestoppt, und der Bot hat den Sprachkanal verlassen!");
                } else {
                    console.log("AudioPlayer is undefined or null:", audioPlayer);
                    interaction.reply("📡 Der AudioPlayer ist nicht verfügbar. Möglicherweise wurde keine Musik abgespielt.");
                }
            } else {
                console.log("PlayerSubscription is undefined or null:", playerSubscription);
                interaction.reply("📡 Die PlayerSubscription ist nicht verfügbar.");
            }
        } else {
            console.log("VoiceConnection is undefined or null.");
            interaction.reply("📡 Der Bot ist derzeit in keinem Sprachkanal aktiv.");
        }
    } catch (error) {
        console.error("Error in stop command:", error);
        interaction.reply("📡 Ein Fehler ist aufgetreten. Versuche es später erneut.");

        // If the connection is still open, you may want to destroy it
        const voiceChannel = interaction.member.voice.channel;
        const connection = getVoiceConnection(voiceChannel.guild.id);
        if (connection && !connection.destroyed) {
            connection.destroy();
        }
    }
}

module.exports = stop;