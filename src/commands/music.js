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

const audioQueue = [];
let channelName;

let audioPlayer;
let voiceConnection;
let channelID;
let lastMember;

async function play(interaction) {
    try {
        const voiceChannel = interaction.member.voice.channel;
        const link = interaction.options.getString("link");
        channelID = interaction.channelId;
        lastMember = interaction.member;

        const getAudio = await playdl.search(link, { limit: 1 });
        audioQueue.push(getAudio[0]);
    
        if(audioQueue.length === 1) {
            voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
            playFirstInQueue(voiceConnection, audioQueue, true);
        }
        channelName = await interaction.guild.channels.fetch(voiceConnection.joinConfig.channelId);
        const replyMSG = audioQueue.length === 1 ? `📡 **${audioQueue[0].title}** wird abgespielt!` : `📡 **${audioQueue[0].title}** wurde zur Queue hinzugefügt!`;
        interaction.reply(replyMSG);
        console.log("[LOG]: ", replyMSG);
    } catch(error) { console.error(error) }   
}

async function playFirstInQueue(voiceConnection, audioQueue, isFirst) {
    if(audioQueue.length === 0) { 
        stop();
        return;
    }
    try {
        if(!isFirst) {
            const headers = { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" };
            const data = { content: "📡 **Der nächste Song der Queue wird abgespielt!**" };
            axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, data, { headers });
        }
        audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        const URL = audioQueue[0].url.trim();
        const stream = await playdl.stream(URL, { quality: 140 });

        if(stream && stream.stream && stream.type) {
            const audioResource = createAudioResource(stream.stream, { inputType: stream.type });
            const subscription = voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }

        audioPlayer.on("idle", queueManagement);
    } catch (error) { console.error("[ERROR]: ", error) }
}

function listenerManagement() {
    audioPlayer.off("idle", queueManagement);
    audioPlayer.stop();
}

function queueManagement() {
    try {
        listenerManagement();
        audioQueue.shift();
        playFirstInQueue(voiceConnection, audioQueue, false);
    } catch(error) { console.error("[ERROR]: ", error) }
}

function queue(interaction) {
    if(audioQueue.length === 0) return interaction.reply(`📡 **Die aktuelle Queue ist leer.**`);  

    let message = `📡 **Die aktuelle Queue in ${channelName}:**\n\n▶️ **Spielt jetzt:** `;
    for(let index = 0; index < audioQueue.length; index++) {
        let titleElement;
        if(index !== 0) { titleElement = `⬆️ **Spielt danach:** ${audioQueue[index].title}\n\n` }
        else { titleElement = `${audioQueue[index].title}\n\n` }
        message += titleElement;
    }

    interaction.reply(message);
}

function stop() {
    let msg;
    try {
        const voiceChannel = lastMember.voice.channel;
        if(!voiceChannel) msg = "📡 **Du musst in einem Sprachkanal sein, um die Ausgabe zu stoppen!**";

        const connection = getVoiceConnection(voiceChannel.guild.id);
        if(!connection) msg = "📡 **Der Bot ist derzeit in keinem Sprachkanal aktiv.**";
        listenerManagement();
        msg = "📡 **Die Ausgabe wurde gestoppt, und der Bot wird bald den Sprachkanal verlassen!**";

        setTimeout(() => {
            if(connection && !connection.destroyed) {
                connection.destroy();
            }
        }, 3500);
    } catch(error) { console.error("[ERROR]: ", error) }

    const headers = { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" };
    const data = { content: msg };
    axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, data, { headers });
}

function skip(interaction) {
    try {
        if(!audioQueue) return interaction.reply("📡 Es gibt keine aktive Warteschlange, die übersprungen werden kann.");
        if(audioQueue.length <= 1) return interaction.reply("📡 Es gibt keine weiteren Songs in der Warteschlange zum Überspringen. Wenn du die Musik beenden willst, benutze **/stop**.");
        queueManagement();
    } catch(error) { console.error("[ERROR]: ", error) }
}

module.exports = { play, stop, queue, skip };