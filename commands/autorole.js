const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const autorole = require('../utilities/autorole.js');
const env = require('../env.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('autorole')
		.setDescription('confiugure autoroles')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('adds a role')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('role you want to add')
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
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('lists all autoroles'),
		),
	async execute(interaction) {
		try {
		// ensure user has permission to use this command
			if (!(interaction.member.roles.cache.has(env.discord.admin_role))) {
				try {
					await interaction.reply({
						embeds: [embedcreator.setembed({
							title: 'Incident Reported',
							description: 'You do not have permission to use this command. This incident has been reported.',
							color: 0xe74c3c,
						})],
						ephemeral: true,
					});
					return global.client.channels.cache.get(env.discord.logs_channel).send({
						embeds: [embedcreator.setembed({
							title: 'Incident Detected',
							description: `${interaction.member.user} tried to use the autorole command but did not have the correct role.`,
							color: 0xe74c3c,

						})],
					});
				}
				catch (error) {
					console.log(error);
					embedcreator.sendError(error);
				}
			}
			const subcommand = await interaction.options.getSubcommand();
			if (subcommand === 'add') {
				const role = await interaction.options.getRole('role');
				await autorole.add(role.id);
				return interaction.reply({
					embeds: [embedcreator.setembed({
						title: 'Autorole Added',
						description: `Added ${role} to the autorole list.`,
						color: 0x2ecc71,
					})],
				});
			}
			if (subcommand === 'remove') {
				const role = await interaction.options.getRole('role');
				await autorole.remove(role.id);
				return interaction.reply({
					embeds: [embedcreator.setembed({
						title: 'Autorole Removed',
						description: `Removed ${role} from the autorole list.`,
						color: 0x2ecc71,
					})],
				});

			}
			if (subcommand === 'list') {
				const roles = await autorole.list();
				const roleNames = [];
				for (const role of roles) {
					roleNames.push(`<@&${role}>`);
				}
				return interaction.reply({
					embeds: [embedcreator.setembed({
						title: 'Autoroles',
						description: roleNames.join(', '),
						color: 0x2ecc71,
					})],
				});
			}
		}
		catch (error) {
			console.error(error);
			embedcreator.sendError(error);
		}
	},
};