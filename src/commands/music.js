const {
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    getVoiceConnection,
    joinVoiceChannel,
} = require("@discordjs/voice");
const playdl = require("play-dl");
const axios = require("axios");
require("dotenv").config();

const audioQueue = new Map();
let channelName;
let latestSavedVoiceChannel;
let voiceConnection;
let guildID;
let channelID

async function play(interaction) {
    try {
        guildID = interaction.guildId;
        channelID = interaction.channelId;

        const voiceChannel = interaction.member.voice.channel;
        latestSavedVoiceChannel = voiceChannel;
        if(!voiceChannel) interaction.reply("📡 **Du musst in einem Sprachkanal sein, um Audio abzuspielen!**");

        const link = interaction.options.getString("link");
        let queue = audioQueue.get(guildID);
        if(!queue) {
            queue = [];
            audioQueue.set(guildID, queue);
        }

        const searchResult = await playdl.search(link, { limit: 1 });
        if(!searchResult || !searchResult[0]) interaction.reply("📡 **Fehler beim Finden einer Audio.");

        queue.push(searchResult[0]);
    
        if(queue.length === 1) {
            voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
            channelName = await interaction.guild.channels.fetch(voiceConnection.joinConfig.channelId);
            playFirstInQueue(voiceConnection, audioQueue, true, guildID);
        }
        const replyMSG = queue.length === 1 ? 
            `📡 **${queue[0].title}** wird abgespielt!` : 
            `📡 **${queue[queue.length - 1].title}** wurde zur Queue hinzugefügt!`
        ;
        interaction.reply(replyMSG);
        console.log("[LOG]: ", replyMSG);
    } catch(error) { console.error("[ERROR]: ", error) }   
}

async function playFirstInQueue(voiceConnection, audioQueue, isFirst) {
    let queue = audioQueue.get(guildID);
    if(queue.length === 0) { 
        destroy();
        return;
    }
    try {
        if(!isFirst) {
            const headers = { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" };
            const data = { content: "📡 **Der nächste Song der Queue wird abgespielt!**" };
            axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, data, { headers });
        }
        audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        const URL = queue[0].url.trim();
        const stream = await playdl.stream(URL, { quality: 140 });

        if(stream && stream.stream && stream.type) {
            const audioResource = createAudioResource(stream.stream, { inputType: stream.type });
            const subscription = voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }

        audioPlayer.on("idle", queueManagement);
        audioPlayer.on("error", error => { console.error("[ERROR]: ", error) });
    } catch(error) { console.error("[ERROR]: ", error) }
}

function listenerManagement() {
    audioPlayer.off("idle", queueManagement);
    audioPlayer.stop();
}

function queueManagement() {
    try {
        listenerManagement();
        let queue = audioQueue.get(guildID);
        queue.shift();
        playFirstInQueue(voiceConnection, audioQueue, false, guildID);
    } catch(error) { console.error("[ERROR]: ", error) }
}

function destroy() {
    try {
        const headers = { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" };
        const data = { content: "📡 **Die Queue ist vorbei und der Bot geht jetzt!**" };
        axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, data, { headers });
        setTimeout(function() {
            listenerManagement();
            voiceConnection.destroy();
        }, 3500);
    } catch(error) { console.error("[ERROR]: ", error) }
}

function queue(interaction) {
    let queue = audioQueue.get(guildID);

    if(!queue || queue.length === 0) return interaction.reply(`📡 **Die aktuelle Queue ist leer.**`);  

    let message = `📡 **Die aktuelle Queue in ${channelName}:**\n\n▶️ **Spielt jetzt:** `;
    for(let index = 0; index < queue.length; index++) {
        let titleElement;
        if(index !== 0) titleElement = `⬆️ **Spielt danach:** ${queue[index].title}\n\n`;
        else titleElement = `${queue[index].title}\n\n`;
        message += titleElement;
    }

    interaction.reply(message);
}

function stop(interaction) {
    let msg;
    try {
        const voiceChannel = latestSavedVoiceChannel;
        if(!voiceChannel) msg = "📡 **Du musst in einem Sprachkanal sein, um die Ausgabe zu stoppen!**";

        const connection = getVoiceConnection(voiceChannel.guild.id);
        if(!connection) msg = "📡 **Der Bot ist derzeit in keinem Sprachkanal aktiv.**";
        listenerManagement();
        msg = "📡 **Die Ausgabe wurde gestoppt, und der Bot wird den Sprachkanal verlassen!**";

        audioQueue.delete(guildID);

        if(connection && !connection.destroyed) {
            connection.destroy();
            interaction.reply(msg);
        }
    } catch(error) { console.error("[ERROR]: ", error) }
}

function skip(interaction) {
    try {
        const guildID = interaction.guildId;
        let queue = audioQueue.get(guildID);

        if(!queue) return interaction.reply("📡 Es gibt keine aktive Warteschlange, die übersprungen werden kann.");
        if(queue.length <= 1) return interaction.reply("📡 Es gibt keine weiteren Songs in der Warteschlange zum Überspringen.");
        queueManagement(guildID);
        interaction.reply("📡 **Einen Moment...**");
    } catch(error) { console.error("[ERROR]: ", error) }
}

module.exports = { play, stop, queue, skip };