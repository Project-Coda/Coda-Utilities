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
		console.log(emoji);
		if (emoji.includes('>')) {
			emojiname = emoji.split(':')[1].split('>')[0];
		}
		else {
			emojiname = emoji;
		}
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
						color: '#e74c3c',
					},
				)],
			},
			);
			return interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incedent Reported',
						description: 'You do not have permission to use this command. This incident has been reported.',
						color: '#e74c3c',
					},
				),
				], ephemeral: true,
			});
		}
		try {
			// extract the channel id from the message link
			const channelId = messageLink.split('/')[5];
			// extract the message id from the message link
			const messageId = messageLink.split('/')[6];
			const roleid = role.replace(/[^0-9.]+/g, '');
			// check if role exists in the guild
			console.log(roleid);
			const rolecheck = global.client.guilds.cache.get(env.discord.guild).roles.cache.get(roleid);
			if (!rolecheck) {
				interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Error',
							description: 'Please enter a valid role',
							color: '#e74c3c',
						},
					)], ephemeral: true,
				});
				return;
			}
			// get the message
			console.log(`roleId: ${roleid}`);
			console.log(`channelId: ${channelId}`);
			console.log(`messageId: ${messageId}`);
			channel = global.client.channels.cache.get(channelId);
			const message = await channel.messages.fetch(messageId);
			// Add to roles table if it doesn't exist
			const db = await mariadb.getConnection();
			await db.query('INSERT INTO roles (id, emoji, message_id) VALUES (?, ?, ?)', [roleid, emojiname, messageId]);
			message.react(emoji).then(() => {
				console.log(`Added ${emojiname} to database`);
				interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Added Role',
							url: messageLink,
							description: `Added role ${role} to message ${messageLink}`,
							color: '#2ecc71',
						},
					),
					], ephemeral: true,
				});
			},
			).catch(err => {
				console.log(err);
				interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Error',
							description: `Error adding role ${role} to message ${messageLink}`,
							color: '#e74c3c',
						},
					),
					], ephemeral: true,
				});
			},
			);
		}
		catch (err) {
			console.log(err);
			interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Error',
						description: 'Invalid data. Please check the message link and try again.',
						color: '#e74c3c',
					},
				),
				], ephemeral: true,
			});
		}
	},
};