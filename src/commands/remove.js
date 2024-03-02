const { queues } = require("./music");
const skip = require("./skip");
const queue = require("./queue");

async function remove(interaction) {
    let position = interaction.options.getInteger("position");
    const arrayPosition = position-1;

    if(queues.size === 0) { interaction.reply(`📡 Die aktuelle Queue ist leer.`); return; } 
    const serverQueue = queues.get(interaction.guild.id)

    if(!serverQueue.songs[arrayPosition]) { interaction.reply(`📡 Die Position "${position}" wurde nicht in der Queue gefunden.`); return; }
    if(arrayPosition === 0) { await skip(interaction); return; }

    serverQueue.songs.splice(arrayPosition, 1);
    await interaction.reply(`📡 Die Position "${position}" wurde aus der Queue entfernt.`);
    await interaction.followUp(await queue(interaction));
}

module.exports = remove;