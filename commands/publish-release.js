const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { publishRelease } = require('../utilities/publish-release.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('publish-release')
		.setDescription('Publish a release to the releases channel'),
	async execute(interaction) {
		const motal = new ModalBuilder()
			.setTitle('Publish Release')
			.setCustomId('publish-release');
		const artistname = new TextInputBuilder()
			.setLabel('Artist Name')
			.setCustomId('artistname')
			.setStyle(TextInputStyle.Short);
		const trackname = new TextInputBuilder()
			.setLabel('Track Name')
			.setCustomId('trackname')
			.setStyle(TextInputStyle.Short);
		const releasedescription = new TextInputBuilder()
			.setLabel('Release Description')
			.setCustomId('releasedescription')
			.setStyle(TextInputStyle.Paragraph);
		const songwhip = new TextInputBuilder()
			.setLabel('Songwhip')
			.setCustomId('songwhip')
			.setStyle(TextInputStyle.Short);
		const firstquestion = new ActionRowBuilder().addComponents(artistname);
		const secondquestion = new ActionRowBuilder().addComponents(trackname);
		const thirdquestion = new ActionRowBuilder().addComponents(releasedescription);
		const fourthquestion = new ActionRowBuilder().addComponents(songwhip);
		motal.addComponents(firstquestion, secondquestion, thirdquestion, fourthquestion);
		await interaction.showModal(motal);
		const filter = i => i.customId === 'publish-release' && i.user.id === interaction.user.id;
		const answer = await interaction.awaitModalSubmit({ filter, time: 100000 });
		if (answer) {
			const artistnameanswer = answer.fields.getTextInputValue('artistname');
			const tracknameanswer = answer.fields.getTextInputValue('trackname');
			const releasedescriptionanswer = answer.fields.getTextInputValue('releasedescription');
			const songwhipanswer = answer.fields.getTextInputValue('songwhip');
			var answers = {
				artist: artistnameanswer,
				track: tracknameanswer,
				description: releasedescriptionanswer,
				songwhip: songwhipanswer,
			};
			answer.reply({
				embeds: [
					embedcreator.setembed(
						{
							title: 'Answers Submitted',
							description: 'Please check your DMs for further instructions.',
							color: 0x19ebfe,
						},
					)],
				ephemeral: true,
			});
			await publishRelease(interaction, answers);
		}
	},
};