const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('notify')
		.setDescription('user join notify list')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('adds a user to the notify list')
				.addUserOption(option =>
					option
						.setName('user-id')
						.setDescription('id of the user you want to add')
						.setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('removes a user from the notify list')
				.addUserOption(option =>
					option
						.setName('user-id')
						.setDescription('id of the user you want to remove')
						.setRequired(true)),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		console.log(subcommand);
		const userinput = interaction.options.get('user-id').value;
		// clean user id
		const userId = userinput.replace(/[^0-9.]+/g, '');
		// get user from discord
		const user = global.client.users.cache.get(userId);
		if (!user) {
			interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Error',
						description: 'Please enter a valid user',
						color: '#e74c3c',
					},
				)], ephemeral: true,
			});
		}
		// Limit command to Founders and Mods
		if (!(interaction.member.roles.cache.has(env.discord.admin_role) || interaction.member.roles.cache.has(env.discord.mod_role))) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incedent Detected',
						description: `${interaction.member.user} tried to use the notify command but did not have the correct role.
                        Detailed information:
                        User ID : ${userId}`,
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
		if (subcommand === 'add') {
			try {
			// check if user in notify table
				const db = await mariadb.getConnection();
				const result = await db.query('SELECT * FROM notify WHERE user_id = ?', [userId]);
				if (result.length > 0) {
					return interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'Error',
								description: `${user} is already in the notify list`,
								color: '#e74c3c',
							},
						)], ephemeral: true,
					});
				}
				// add user to notify table
				await db.query('INSERT INTO notify (user_id, name) VALUES (?, ?)', [userId, user.tag]);
				return interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Success',
							description: `${user} added to notify list`,
							color: '#2ecc71',
						},
					)], ephemeral: true,
				});
			}
			catch (error) {
				console.log(error);
				return interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Error',
							description: 'An error occured while adding the user to the notify list',
							color: '#e74c3c',
						},
					)], ephemeral: true,
				});
			}
		}
		if (subcommand === 'remove') {
			try {
			// check if user in notify table
				const db = await mariadb.getConnection();
				const result = await db.query('SELECT * FROM notify WHERE user_id = ?', [userId]);
				if (result.length === 0) {
					return interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'Error',
								description: 'User is not in the notify list',
								color: '#e74c3c',
							},
						)], ephemeral: true,
					});
				}
				// remove user from notify table
				await db.query('DELETE FROM notify WHERE user_id = ?', [userId]);
				return interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Success',
							description: `${user} removed from notify list`,
							color: '#2ecc71',
						},
					)], ephemeral: true,
				});
			}
			catch (error) {
				console.log(error);
				return interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'Error',
							description: 'An error occured while removing the user from the notify list',
							color: '#e74c3c',
						},
					)], ephemeral: true,
				});
			}
		}
	},

};
