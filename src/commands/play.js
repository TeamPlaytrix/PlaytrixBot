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

        if (!voiceChannel) {
            return interaction.reply("📡 Du musst in einem Sprachkanal sein, um Musik abzuspielen zu können.");
        }

        const serverQueue = queues.get(interaction.guild.id) || { songs: [], connection: null };
        const ytInfo = await playdl.search(link, { limit: 1 });

        serverQueue.songs.push(ytInfo[0]);

        if (!serverQueue.connection) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            serverQueue.connection = connection;
            queues.set(interaction.guild.id, serverQueue);

            playQueue(interaction.guild, serverQueue, ytInfo[0]);
        }

        const replyMessage = serverQueue.songs.length === 1
            ? `📡 **${ytInfo[0].title}** wird abgespielt!`
            : `📡 **${ytInfo[0].title}** wurde zur Queue hinzugefügt!`;

        interaction.reply(replyMessage);
    } catch (error) {
        console.error("An unexpected error occurred in play:", error);

        if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
            interaction.reply("📡 Timeout error connecting to external services. Please try again later.");
        } else {
            interaction.reply("📡 An error occurred. Please try again later.");
        }

        const voiceConnection = getVoiceConnection(interaction.guild.id);
        if (voiceConnection) {
            voiceConnection.destroy();
        }
    }
}

async function playQueue(guild, serverQueue, yt_info) {
    if(serverQueue.songs.length === 0) {
        console.log("Trying to leave..")
        const connection = getVoiceConnection(guild.id);
        if (connection && !connection.destroyed) {
            connection.destroy();
        }

        queues.delete(guild.id);
    } else {
        try {
            const audioPlayer = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });
    
            serverQueue.connection.subscribe(audioPlayer);
    
            const cleanedURL = yt_info.url.trim();
            if (!cleanedURL) {
                console.error("Invalid URL:", yt_info.url);
                return;
            }
    
            const stream = await playdl.stream(cleanedURL, { quality: 140 });
    
            if (stream && stream.stream && stream.type) {
                const resource = createAudioResource(stream.stream, { inputType: stream.type });
                audioPlayer.play(resource);
            } else {
                console.error("Invalid Stream or Type", stream);
                return;
            }
    
            let songFinished = false;
    
            audioPlayer.on(AudioPlayerStatus.Playing, () => {
                // The song has started playing
                console.log("Song is now playing");
            });
    
            audioPlayer.on(AudioPlayerStatus.Idle, () => {
                console.log(`Audioplayer-Status: ${JSON.stringify(audioPlayer.state)}`);
                if (!songFinished) {
                    // The song has truly finished playing
                    songFinished = true;
                    console.log("Idle event called");
                    serverQueue.songs.shift();
                    const nextSong = serverQueue.songs[0];
                    console.log("NextSong:", JSON.stringify(nextSong));
                    playQueue(guild, serverQueue, nextSong);
                }
            });
        } catch (error) {
            console.error("Error playing the queue:", error);
            // Handle the error, maybe skip to the next song or remove the guild queue.
        }
    }
}

module.exports = { play, playQueue, queues };