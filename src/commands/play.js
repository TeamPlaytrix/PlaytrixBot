const {
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const playdl = require("play-dl");

// A Map to manage the queue for each server
const queues = new Map();

async function play(interaction) {
    try {
        const voiceChannel = interaction.member.voice.channel;
        const link = interaction.options.getString("link");
        if (!voiceChannel) return interaction.reply("📡 Du musst in einem Sprachkanal sein, um Musik abzuspielen zu können.");

        const serverQueue = queues.get(interaction.guild.id) || { songs: [], connection: null };
        const ytInfo = await playdl.search(link, { limit: 1 });
        serverQueue.songs.push(ytInfo[0]);

        if (!serverQueue.connection) {
            const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator });
            serverQueue.connection = connection;
            queues.set(interaction.guild.id, serverQueue);
            if (interaction.isCommand()) {
                const lastChannel = interaction.channel;
                console.log(lastChannel);
                playQueue(interaction.guild, serverQueue, ytInfo[0], lastChannel);
            }
        }

        const replyMessage = serverQueue.songs.length === 1 ? `📡 **${ytInfo[0].title}** wird abgespielt!` : `📡 **${ytInfo[0].title}** wurde zur Queue hinzugefügt!`;
        interaction.reply(replyMessage);
    } catch (error) {
        console.error("An unexpected error occurred in play:", error);

        if (error.code === 'UND_ERR_CONNECT_TIMEOUT') return interaction.reply("📡 Timeout error connecting to external services. Please try again later.");
        else interaction.reply("📡 An error occurred. Please try again later.");

        const voiceConnection = getVoiceConnection(interaction.guild.id);
        if (voiceConnection) voiceConnection.destroy();
    }
}

async function playQueue(guild, serverQueue, yt_info, lastChannel) {
    if (serverQueue.songs.length === 0) {
        setTimeout(function () {
            console.log("Trying to leave..")
            const connection = getVoiceConnection(guild.id);
            if (connection && !connection.destroyed) connection.destroy();
            queues.delete(guild.id);
            lastChannel.send("📡 Die Ausgabe wurde gestoppt, und der Bot hat den Sprachkanal verlassen!");
        }, 1500);
        return;
    }
    try {
        const audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        if(audioPlayer && audioPlayer.listenerCount("stateChange") > 0) audioPlayer.off("stateChange", handleStateChange);
        serverQueue.connection.subscribe(audioPlayer);

        const cleanedURL = yt_info.url.trim();
        if (!cleanedURL) return console.error("Invalid URL:", yt_info.url);
        const stream = await playdl.stream(cleanedURL, { quality: 140 });

        if (stream && stream.stream && stream.type) {
            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            audioPlayer.play(resource);
        } else return console.error("Invalid Stream or Type", stream); 

        audioPlayer.on("stateChange", handleStateChange);
        
        async function handleStateChange(oldState, newState) {
            if(newState.status === AudioPlayerStatus.Playing) console.log("Song is now playing");
            if(newState.status === AudioPlayerStatus.Idle) {
                console.log("Idle event called");
                serverQueue.songs.shift();
                const nextSong = serverQueue.songs[0];
                console.log(`NextSong: ${JSON.stringify(nextSong)}`);
                playQueue(guild, serverQueue, nextSong, lastChannel);
            }
        }
    } catch (error) { console.error("Error playing the queue:", error) }
}

module.exports = { play, playQueue, queues };