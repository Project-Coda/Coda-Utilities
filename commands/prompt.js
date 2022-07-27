const prompt = require('../utilities/prompt.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('prompt')
		.setDescription('Get a random writing prompt'),
	async execute(interaction) {
		const writingprompt = await prompt.getPrompt();
		interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Writing Prompt',
				description: writingprompt,
				color: 0x19ebfe,
			})],
		});
		embedcreator.log(`${interaction.member.user} used the prompt command.`);
	},
};