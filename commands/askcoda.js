const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { createCompletion } = require('../utilities/openai.js');

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
							title: prompt,
							description: response,
							color: 0x2ecc71,
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

