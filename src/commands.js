require("dotenv").config();
const { REST, Routes, ApplicationCommand, ApplicationCommandOptionType } = require("discord.js");
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
        ]
    },
    {
        name: "bosnia",
        description: "proud to be BOSSNIAN",
    },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.BOTCLIENTID, process.env.SERVERID),
            { body: commands }
        );
        console.log("Registered slash commands")
    } catch (error) {
        console.log(error);
    }
})();