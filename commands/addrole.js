const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
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
		// Limit command to Founders
		if (!interaction.member.roles.cache.has(env.discord.founders_role)) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incedent Detected',
						description: `${interaction.member.user.tag} tried to use the addrole command but did not have the Founders role.
						Detailed information:
						Message Link : ${messageLink}
						Role : ${role}
						Emoji : ${emoji}`,
						color: 0xFF0000,
					},
				)],
			});
			return interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incedent Reported',
						description: 'You do not have permission to use this command. This incident has been reported.',
						color: 0xFF0000,
					},
				),
				],
			}).then(() => {
				setTimeout(async function() {
					await interaction.deleteReply();
				}, 5000);
			},
			);
		}
		try {
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
				interaction.reply(`Error adding role ${role} to message ${messageLink}`);
			},
			);
		}
		catch (err) {
			console.log(err);
			interaction.reply({ content: 'Invalid data try again', ephemeral: true });
		}
	},
};