const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { ban } = require('../utilities/ban.js');
const env = require('../env.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cban')
		.setDescription('Bans a user from the server')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User you want to ban')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Reason for the ban')
				.setRequired(true)),

	async execute(interaction) {
		try {
			// Limit command to Founders and Mods
			if (!(interaction.member.roles.cache.has(env.discord.admin_role) || interaction.member.roles.cache.has(env.discord.mod_role))) {
				global.client.channels.cache.get(env.discord.logs_channel).send({
					embeds: [embedcreator.setembed(
						{
							title: 'Incident Detected',
							description: `${interaction.member.user} tried to use the cban command but did not have the correct role.`,
							color: 0xe74c3c,
						},
					)],
				},
				);
				return interaction.reply({
					embeds: [embedcreator.setembed(
						{
							title: 'Incident Reported',
							description: 'You do not have permission to use this command. This incident has been reported.',
							color: 0xe74c3c,
						},
					),
					], ephemeral: true,
				});
			}
			const user = interaction.options.getUser('user');
			const reason = interaction.options.getString('reason');
			const userID = user.id;
			await ban(userID, reason);
			const embed = await embedcreator.setembed(
				{
					title: 'User Banned',
					description: `User ${user.username} has been banned for ${reason}`,
					color: 0xe74c3c,
				},
			);
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
		catch (err) {
			console.log(err);
			embedcreator.sendError(err);
		}
	},
};