const botVersion = "0.5";

async function version(interaction) {
    interaction.reply(`📡 Der PlaytrixBot ist auf der Version ${botVersion}!`);
}

module.exports = version;