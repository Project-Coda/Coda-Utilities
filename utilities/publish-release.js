const env = require('../env.js');
const fetch = require('node-fetch');
const embedcreator = require('../embed.js');
const { AttachmentBuilder } = require('discord.js');
attachmenturl = null;
async function publishRelease(interaction, answers) {
	DMUser(interaction, answers);
	console.log('publishRelease');
}
async function DMUser(interaction, answers) {
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
			const attachment = m.attachments.first();
			const url = attachment.url;
			file = await fetch(url);
			releaseimage = new AttachmentBuilder(url, attachment.filename);
			console.log('image sent');
			// send image to discord
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
async function previewRelease(answers, attachmenturl, user) {
	console.log('previewRelease');
	artist = answers.artist;
	track = answers.track;
	description = answers.description;
	songwhip = answers.songwhip;
	embed = {
		title: track,
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
			url: attachmenturl,
		},
	};

	user.send(
		{
			content: 'Embed Preview',
			embeds: [embedcreator.setembed({
				title: 'Embed Preview',
				description: 'This is the embed preview',
			},
			),
			embed],
		},
	);
	console.log('preview sent');
}


module.exports = { publishRelease };