const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const welcome = require('../utilities/welcome.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('test-welcome')
		.setDescription('Test Welcome'),
	async execute(interaction) {
		const welcomemsg = await welcome.getWelcome();
		interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Welcome Message',
				description: welcomemsg,
				color: 0x19ebfe,
			})], ephemeral: true,
		});
		embedcreator.log(`${interaction.member.user} tested the welcome command.`);
	},
};