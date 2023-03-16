const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const autorole = require('../utilities/autorole.js');
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
	},
};