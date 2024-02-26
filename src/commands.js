require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
    {
        name: "version",
        description: "Gibt die aktuelle Botversion aus.",
    },
    {
        name: "gif",
        description: "Gibt ein zufälliges Meme zu einem Thema aus.",
        options: [
            {
                name: "thema",
                description: "Thema des Memes.",
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ],
    },
    {
        name: "bosnia",
        description: "proud to be BOSSNIAN",
    },
    {
        name: "deutschland",
        description: "proud to be DEUTSCH",
    },
    {
        name: "play",
        description: "Spiele die Audio von einem Youtube-Link ab.",
        options: [
            {
                name: "link",
                description: "Der Link des Videos.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: "stop",
        description: "Stoppt die Audioausgabe.",
    },
    {
        name: "queue",
        description: "Gibt die aktuelle Song-Queue aus."
    },
    {
        name: "remove",
        description: "Entferne einen Song aus der Queue. Gib seine Postion an.",
        options: [
            {
                name: "position",
                description: "Die Position des Songs in der Queue. Beispiel: Der 2. Song wäre die 2",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    {
        name: "skip",
        description: "Überspringe den momentan spielenden Song.",
    },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.BOTCLIENTID, process.env.SERVERID),
            { body: commands }
        );
        console.log("📡 Registered slash commands");
    } catch (error) {
        console.error("📡 Error registering slash commands:", error);
    }
})();