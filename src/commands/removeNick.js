async function removeNick(interaction) {
    interaction.guild.members.cache.get(interaction.client.user.id).setNickname("");
}

module.exports = removeNick;