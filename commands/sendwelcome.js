const { SlashCommandBuilder } = require('@discordjs/builders');
const {sendWelcome} = require('../utilities/greet.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('sendwelcome')
		.setDescription('Replies with Pong!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user to welcome')
				.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		await sendWelcome(user);
		return interaction.reply({ content: `Welcome message sent to ${user}`, ephemeral: true });
	},
};

