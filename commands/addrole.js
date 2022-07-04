const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('addrole')
		.setDescription('adds a role to a user')
		.addStringOption(option =>
			option.setName('message-link')
				.setDescription('link to the message you want to add the role to')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('role-name')
				.setDescription('name of the role you want to add')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('emoji you want to use to represent the role')
				.setRequired(true)),
	async execute(interaction) {
		const messageLink = interaction.options.get('message-link').value;
		const roleName = interaction.options.get('role-name').value;
		const emoji = interaction.options.get('emoji').value;
		// extract the channel id from the message link
		const channelId = messageLink.split('/')[5];
		// extract the message id from the message link
		const messageId = messageLink.split('/')[6];
		console.log(`channelId: ${channelId}`);
		console.log(`messageId: ${messageId}`);
		channel = global.client.channels.cache.get(channelId);
		const message = await channel.messages.fetch(messageId);
		console.log(message);
		console.log(emoji);
		message.react(emoji).then(() => {
			console.log('Reacted!');
			interaction.reply(`Added role ${roleName} to message ${messageLink}`);
		},
		).catch(err => {
			console.log(err);
			interaction.reply(`Error adding role ${roleName} to message ${messageLink}`);
		},
		);
	},
};