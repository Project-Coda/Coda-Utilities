const env = require('../env.js');
const fetch = require('node-fetch');
const embedcreator = require('../embed.js');
const { AttachmentBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({ url: env.utilities.releases.webhook_url });
url = null;
answers = null;
guild = null;
nickname = null;
async function CollectImage(interaction, answers) {
	// get userid from interaction
	guild = await global.client.guilds.cache.get(env.discord.guild);
	const userid = await interaction.user.id;
	userobject = await guild.members.fetch(userid);
	nickname = await userobject.nickname;

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
			time: 900000,
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
			embedcreator.log(nickname + ' timed out on image submission');
			user.send(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Image submission',
							description: 'You have not sent an image in time, please resubmit',
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
				value: nickname,
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
	embedpreview = await user.send(
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
	const collector = embedpreview.channel.createMessageCollector(
		{
			time: 900000,
			max: 1,
		},
	);
	collector.on('collect', async i => {
		console.log('message received');
		if (i.customId === 'submit') {
			console.log('submit');
			await sendImage(answers);
		}
		else if (i.customId === 'cancel') {
			console.log('cancel');
			user.send(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Release Submission',
							description: 'Your submission has been cancelled',
							color: 0x19ebfe,
						},
					)],
				},
			);
		}
	},
	);
	collector.on('end', (collected, reason) => {
		if (reason === 'time') {
			embedcreator.log(nickname + ' timed out on embed preview');
			user.send(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Embed Preview',
							description: 'You have not responded in time, please resubmit',
							color: 0x19ebfe,
						},
					)],
				},
			);
		}
	},
	);
}
async function sendImage(answers) {
	guild = await global.client.guilds.fetch(env.discord.guild);
	channel = await guild.channels.fetch(env.utilities.releases.image_channel);
	channel.send({ files: [releaseimage] }).then(async (message) => {
		// get attachment url
		attachmenturl = await message.attachments.first().url;
		return sendRelease(answers);
	},
	);
}
async function sendRelease(answers) {
	guild = await global.client.guilds.fetch(env.discord.guild);
	channel = await guild.channels.fetch(env.utilities.releases_channel);
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
				value: nickname,
				inline: true,
			},
		],
		color: 0x19ebfe,
		image: {
			url: url,
		},
	};
	webhookClient.send(
		{
			name: '',
			avatarURL: '',
			content: '<@&' + env.discord.utilities.releases.release_role + '>',
			embeds: [embed],
		});
}


module.exports = { CollectImage };