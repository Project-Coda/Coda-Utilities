const { SlashCommandBuilder } = require('@discordjs/builders');
const prompts = require('../static/prompts.txt');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prompt')
		.setDescription('Replies with Prompt!'),
	async execute(interaction) {
		return interaction.reply({
			content: prompts.split('/n')[Math.floor(Math.random() * lines.length)]
		});
	},
};

