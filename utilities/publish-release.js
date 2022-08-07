const env = require('../env.js');
const fetch = require('node-fetch');
const embedcreator = require('../embed.js');
const { AttachmentBuilder } = require('discord.js');
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
	collector.on('collect', (m) => {
		console.log('message received');
		if (m.attachments.size > 0) {
			const attachment = m.attachments.first();
			const url = attachment.url;
			file = fetch(url);
			file = new AttachmentBuilder();
			user.send(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Image submission',
							description: 'Your image has been submitted',
							color: 0x19ebfe,
							image: {
								url: url,
							},
						},
					)],
				},
			);
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


module.exports = { publishRelease };