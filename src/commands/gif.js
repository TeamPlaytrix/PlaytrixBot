const fetch = require("node-fetch");

async function gif(interaction) {
	try {
		const topic = interaction.options.getString("thema");
		const url = `https://tenor.googleapis.com/v2/search?q=${topic}&key=${process.env.TENORKEY}&client_key=PlaytrixBot&ContentFilter=high`;

		let response = await fetch(url);
		let json = await response.json();
		const index = Math.floor(Math.random() * json.results.length);

		await interaction.reply(json.results[index].url);
		await interaction.channel.send(`Suchkriterium: ${topic}`);
	} catch(error) { interaction.reply("📡 Dieses Suchkriterium hat leider nicht geklappt. Probiere vielleicht ein anderes aus.") }
}

module.exports = gif;