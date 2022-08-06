const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const env = require('../env.js');

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
		const submission = await interaction.awaitModalSubmit({
			max: 1,
			time: 60000,
			filter: i => i.customId === 'publish-release',
		});
		if (!submission) {
			return interaction.reply('Timed out.');
		}
		if (submission.cancel) {
			return interaction.reply('Cancelled.');
		}
		var artistnameanswer = submission.fields.getTextInputValue('artistname');
		var tracknameanswer = submission.fields.getTextInputValue('trackname');
		var releasedescriptionanswer = submission.fields.getTextInputValue('releasedescription');
		var songwhipanswer = submission.fields.getTextInputValue('songwhip');
		var embed = await embedcreator.setembed({
			title: `${artistnameanswer} - ${tracknameanswer}`,
			description: releasedescriptionanswer,
			color: 0x19ebfe,
			fields: [
				{ name: 'Songwhip', value: songwhipanswer },
			],
		});
		const channel = global.client.channels.cache.get(env.utilities.releases_channel);
		channel.send({ embeds: [embed] });

	},
};