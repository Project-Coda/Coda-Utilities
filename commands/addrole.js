const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('../db.js');
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
		const role = interaction.options.get('role-name').value;
		const emoji = interaction.options.get('emoji').value;
		// extract the channel id from the message link
		const channelId = messageLink.split('/')[5];
		// extract the message id from the message link
		const messageId = messageLink.split('/')[6];
		const roleid = role.replace(/[^0-9.]+/g, '');
		console.log(`roleId: ${roleid}`);
		console.log(`channelId: ${channelId}`);
		console.log(`messageId: ${messageId}`);
		channel = global.client.channels.cache.get(channelId);
		const message = await channel.messages.fetch(messageId);
		// Add to roles table if it doesn't exist
		const db = await mariadb.getConnection();
		await db.query(`INSERT INTO roles (id, emoji, message_id) VALUES ('${roleid}', '${emoji}', '${messageId}')`);
		db.query(`SELECT * FROM roles WHERE id = '${roleid}'`)
			.then(rows => {
				console.log(rows);
			},
			),
		await db.end();
		message.react(emoji).then(() => {
			console.log('Reacted!');
			interaction.reply(`Added role ${roleid} to message ${messageLink}`);
		},
		).catch(err => {
			console.log(err);
			interaction.reply(`Error adding role ${roleid} to message ${messageLink}`);
		},
		);
	},
};