const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('role assign')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('adds a role')
				.addStringOption(option =>
					option.setName('message-link')
						.setDescription('link to the message you want to add the role to')
						.setRequired(true))
				.addRoleOption(option =>
					option.setName('role-name')
						.setDescription('name of the role you want to add')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('emoji')
						.setDescription('emoji you want to use to represent the role')
						.setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('removes a role')
				.addRoleOption(option =>
					option.setName('role-name')
						.setDescription('name of the role you want to remove')
						.setRequired(true)),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const role = interaction.options.get('role-name').value;
		console.log(subcommand);
		if (subcommand === 'add') {
			messageLink = interaction.options.get('message-link').value;
			emoji = interaction.options.get('emoji').value;
		}
		// Limit command to Founders
		if (!interaction.member.roles.cache.has(env.discord.admin_role)) {
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
		// if subcommand is add
		if (subcommand === 'add') {
			try {
			// cleanup emoji
				if (emoji.includes('>')) {
					emojiname = emoji.split(':')[1].split('>')[0];
				}
				else {
					emojiname = emoji;
				}
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
				const channel = global.client.channels.cache.get(channelId);
				const message = await channel.messages.fetch(messageId);
				// Add to roles table if it doesn't exist
				const db = await mariadb.getConnection();
				await db.query('INSERT INTO roles (id, emoji, raw_emoji, message_id, channel_id) VALUES (?, ?, ?, ?, ?)', [roleid, emojiname, emoji, messageId, channelId]);
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
							description: `${err.text}`,
							color: '#e74c3c',
						},
					),
					], ephemeral: true,
				});
			}
		}
		// if subcommand is remove
		if (subcommand === 'remove') {
			try {
				const roleid = role.replace(/[^0-9.]+/g, '');
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
				console.log(`roleId: ${roleid}`);
				const db = await mariadb.getConnection();
				// get messige id from the role database
				const result = await db.query('SELECT * FROM roles WHERE id = ?', [roleid]);
				if (result.length === 0) {
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
				const messageId = String(result[0].message_id);
				const raw_emoji = String(result[0].raw_emoji);
				const channel = String(result[0].channel_id);
				// get the message from the channel
				if (raw_emoji.includes('>')) {
					emojiId = raw_emoji.replace(/[^0-9.]+/g, '');
				}
				else {
					emojiId = raw_emoji;
				}
				const message = await global.client.channels.cache.get(channel).messages.fetch(messageId);
				// remove the role from the message
				// remove the role from the table roles if it exists
				await db.query('DELETE FROM roles WHERE id = ?', [roleid]);
				// lookup emoji id in guild
				message.reactions.cache.get(emojiId).remove().then(() => {
					console.log(`Removed ${role} from database`);
					interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'Added Role',
								description: `Removed ${role} from the database`,
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
								description: `Error removing ${role} from the database`,
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
							description: `${err.text}`,
							color: '#e74c3c',
						},
					),
					], ephemeral: true,
				});
			}
		}
	},
};