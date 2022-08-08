const env = require('../env.js');
const fetch = require('node-fetch');
const embedcreator = require('../embed.js');
const { AttachmentBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
url = null;
answers = null;
guild = global.client.guilds.cache.get(env.guildid);
async function publishRelease(interaction, useranswers) {
	answers = useranswers;
	await CollectImage(interaction);

}
async function CollectImage(interaction) {
	// get userid from interaction
	const userid = interaction.user.id;
	// get user from client
	const user = await global.client.users.fetch(userid);
	message = await user.send(
		{
			embeds: [ embedcreator.setembed(
				{
					title: 'Image submission',
					description: 'Please send the image you want to submit',
					color: 0x19ebfe,
				},
			)],
		},
	);
	const collector = message.channel.createMessageCollector(
		{
			time: 60000,
			max: 1,
		},
	);
	collector.on('collect', async (m) => {
		console.log('message received');
		if (m.attachments.size > 0) {
			const attachment = await m.attachments.first();
			url = attachment.url;
			file = await fetch(url);
			releaseimage = new AttachmentBuilder(url, attachment.filename);
			previewRelease(answers, interaction.user);
		}
	},
	);
	collector.on('end', (collected, reason) => {
		if (reason === 'time') {
			user.send(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Image submission',
							description: 'You have not sent an image in time',
							color: 0x19ebfe,
						},
					)],
				},
			);
		}
	},
	);
}
async function previewRelease(answers, user) {
	console.log('previewRelease');
	artist = answers.artist;
	track = answers.track;
	description = answers.description;
	songwhip = answers.songwhip;
	embed = {
		title: track,
		url: songwhip,
		description: description,
		fields: [
			{
				name: 'Link',
				value: songwhip,
				inline: true,
			},
			{
				name: 'Submitted by',
				value: user.username,
				inline: true,
			},
		],
		color: 0x19ebfe,
		image: {
			url: url,
		},
	};

	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('submit')
				.setLabel('Submit')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Danger),
		);
	user.send(
		{
			content: 'Embed Preview',
			embeds: [embedcreator.setembed({
				title: 'Embed Preview',
				description: 'Please review the embed before submitting\n press submit to publish your submission\n press cancel to cancel your submission',
			},
			),
			embed], components: [row],
		},
	);
	console.log('preview sent');
}


module.exports = { publishRelease };