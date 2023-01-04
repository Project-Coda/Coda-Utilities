const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { createCompletion } = require('../utilities/openai.js');
const { codeBlock, inlineCode } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('askcoda')
		.setDescription('give me a prompt and i will generate a response, powered by openai')
		.addStringOption(option =>
			option.setName('prompt')
				.setDescription('prompt to ask coda')
				.setRequired(true)),
	async execute(interaction) {
		try {
			const prompt = interaction.options.get('prompt').value;
			// delay reply to prevent interaction timeout
			await interaction.deferReply();
			const response = await createCompletion(prompt);
			await interaction.editReply(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Response to ' + inlineCode(prompt) + '',
							author: {
								name: 'OpenAI',
								url: 'https://openai.com/',
							},
							description: codeBlock(response),
							color: 0x2ecc71,
							footer : {
								text: 'Ask Coda, Powered by OpenAI',
							},
						},
					)],
				},
			);
		}
		catch (err) {
			console.log(err);
			await interaction.editReply(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Error',
							description: err,
							color: 0xe74c3c,
						},
					)],
				},
			);
		}
	},
};

