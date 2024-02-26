require("dotenv").config();
const { Client, IntentsBitField, GatewayIntentBits } = require("discord.js");

//Command Utils
const version = require("./commands/version");
const bosnia = require("./commands/bosnia");
const gif = require("./commands/gif");

const { play } = require("./commands/play");
const stop = require("./commands/stop");
const queue = require("./commands/queue");
const remove = require("./commands/remove");
const skip = require("./commands/skip");

let botName;

const botClient = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
    ],
});

botClient.on("ready", function(client) {
    botName = client.user.username;
    console.log(`📡 ${botName} wurde gestartet.`);
});

botClient.on("interactionCreate", async function(interaction) {
    if(!interaction.isChatInputCommand()) return;

	const command = interaction.commandName;

	switch(command) {
		case "version":
			version(interaction);
			break;
		case "bosnia":
			bosnia(interaction);
			break;
		case "play":
			play(interaction);
			break;
		case "stop":
			stop(interaction);
			break;
		case "gif":
			gif(interaction);
			break;
		case "queue":
			queue(interaction);
			break;
		case "remove":
			remove(interaction);
			break;
		case "skip":
			skip(interaction);
			break;
		default:
			interaction.reply("📡 Dieser Befehl existiert nicht oder ich habe ihn nicht erkannt. Bitte versuche es erneut.");
			break;
	}
});

botClient.login(process.env.TOKEN);