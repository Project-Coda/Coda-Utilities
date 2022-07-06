const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('remove role from database')
		.addStringOption(option =>
			option.setName('role-name')
				.setDescription('@ the role you want to remove')
				.setRequired(true)),
	async execute(interaction) {
		const role = interaction.options.get('role-name').value;
		// Limit command to Founders
		if (!interaction.member.roles.cache.has(env.discord.admin_role)) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incedent Detected',
						description: `${interaction.member.user.tag} tried to use the removerole command but did not have the Founders role.
						Detailed information:
						Role : ${role}`,
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
			const emoji = String(result[0].raw_emoji);
			const channel = String(result[0].channel_id);
			// get the message from the channel
			if (emoji.includes('>')) {
				emojiId = emoji.replace(/[^0-9.]+/g, '');
			}
			else {
				emojiId = emoji;
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
	},
};