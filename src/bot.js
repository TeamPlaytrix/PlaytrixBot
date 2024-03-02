require("dotenv").config();
const { Client, IntentsBitField, GatewayIntentBits } = require("discord.js");
const registerCommands = require("./commands.js");

//Command Utils
const version = require("./commands/version");
const gif = require("./commands/gif");
const help = require("./commands/help");
const { play, stop, queue, skip } = require("./commands/music");

let botName;
const cmdfuncs = {
	"help": help,
	"version": version,
	"gif": gif,
	"play": play,
	"queue": queue,
	"stop": stop,
	"skip": skip,
}

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
	registerCommands();
});

botClient.on("interactionCreate", async function(interaction) {
    if(!interaction.isChatInputCommand()) return;

	const command = interaction.commandName;
	const cmdfunc = cmdfuncs[command];

	try {
		await cmdfunc(interaction);
	} catch(error) {
		interaction.reply("📡 Dieser Befehl existiert nicht oder ich habe ihn nicht erkannt. Bitte versuche es erneut.");
		console.error(error);
	}
});

botClient.login(process.env.TOKEN);