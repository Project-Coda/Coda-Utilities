const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const pkg = require('../package.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Get the version of the bot'),
	async execute(interaction) {
		interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Version Information',
				description: `**Coda Utilities\nVersion:** ${pkg.version}`,
				color: '#2ecc71',
			})], ephemeral: true,
		});
		embedcreator.log(`${interaction.member.user} used the version command.`);
	},
};