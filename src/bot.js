require("dotenv").config();

const fetch = require("node-fetch");
const { Client, IntentsBitField } = require("discord.js");
const botVersion = "0.1";
let botName;

const botClient = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

botClient.login(process.env.TOKEN);

botClient.on("ready", function(client) {
    botName = client.user.username;
    console.log(`📡 ${botName} wurde gestartet.`);
});

botClient.on("interactionCreate", async function(interaction) {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "version") {
        interaction.reply(`📡 Der ${botName}-Bot ist auf der Version ${botVersion}!`);
    }

    if(interaction.commandName === "gif") {
        try {
            const topic = interaction.options.getString("thema");
            const url = `https://tenor.googleapis.com/v2/search?q=${topic}&key=${process.env.TENORKEY}&client_key=PlaytrixBot&ContentFilter=high`;

            let response = await fetch(url);
            let json = await response.json();
            const index = Math.floor(Math.random() * json.results.length);

            await interaction.reply(json.results[index].url);
            await interaction.channel.send(`Suchwort: ${topic}`);
        } catch (error) {
            interaction.reply("📡 Dieses Suchkriterium hat leider nicht geklappt. Probiere vielleicht ein anderes aus.");
        }
    }

    if(interaction.commandName === "bosnia") {
        interaction.reply("https://www.youtube.com/watch?v=hFbZLEZa-y8");
    }
});

botClient.on("messageCreate", function(message) {
    //Check if user is a bot
    if(message.author.bot) {
        return;
    }
});