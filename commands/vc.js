const { SlashCommandBuilder } = require('@discordjs/builders');
const env = require('../env.js');
const embedcreator = require('../embed.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('vc')
		.setDescription('Allows you to bulk move people to a voice channel')
		.addSubcommand(subcommand =>
			subcommand
				.setName('move')
				.setDescription('Move a group of users to a voice channel')
				.addChannelOption(option =>
					option
						.setName('destination')
						.setDescription('The name of the voice channel to move the users to')
						.setRequired(true))
				.addChannelOption(option =>
					option
						.setName('source')
						.setDescription('The name of the voice channel to move the users from')
						.setRequired(false)),
		),
	async execute(interaction) {
		// Limit command to Founders and Mods
		if (!(interaction.member.roles.cache.has(env.discord.admin_role) || interaction.member.roles.cache.has(env.discord.mod_role))) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incident Detected',
						description: `${interaction.member.user} tried to use the vc move command but did not have the correct role.`,
						color: '#e74c3c',
					},
				)],
			},
			);
			return interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incident Reported',
						description: 'You do not have permission to use this command. This incident has been reported.',
						color: '#e74c3c',
					},
				),
				], ephemeral: true,
			});
		}
		try {
			const people = [];
			const subcommand = interaction.options.getSubcommand();
			const userdestination = interaction.options.get('destination').value;
			const destination = userdestination.replace(/[^0-9.]+/g, '');
			const destinationvc = global.client.channels.cache.get(destination);
			console.log(destination);
			if (subcommand === 'move') {
				console.log('move');
				if (interaction.options.get('source')) {
					console.log('source');
					var usersource = interaction.options.get('source').value;
					var sourceid = usersource.replace(/[^0-9.]+/g, '');
					var sourcevc = await global.client.channels.cache.get(sourceid);
					if (sourcevc && sourcevc.type === 'GUILD_VOICE' && destinationvc && destinationvc.type === 'GUILD_VOICE') {
						await sourcevc.members.forEach(member => {
							member.voice.setChannel(destination);
							people.push(member);
						});
						return interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Success',
									description: `Successfully moved ${people} from ${sourcevc} to ${destinationvc}`,
									color: '#19ebfe',
								},
							)],
							ephemeral: true,
						});
					}
					else {
						interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Error',
									description: 'Invalid voice channel',
									color: '#e74c3c',
								},
							)],
							ephemeral: true,
						});
					}
				}
				else {
					var sourcevcauto = await global.client.channels.cache.get(interaction.member.voice.channel.id);
					if (sourcevcauto && sourcevcauto.type === 'GUILD_VOICE' && destinationvc && destinationvc.type === 'GUILD_VOICE') {
						await sourcevcauto.members.forEach(member => {
							member.voice.setChannel(destination);
							people.push(member);
						});
						return interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Success',
									description: `Successfully moved ${people} from ${sourcevcauto} to ${destinationvc}`,
									color: '#19ebfe',
								},
							)],
							ephemeral: true,
						});
					}
					else {
						interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Error',
									description: 'Invalid voice channel',
									color: '#e74c3c',
								},
							)],
							ephemeral: true,
						});
					}
				}
			}
		}
		catch (error) {
			console.log(error);
			embedcreator.sendError(error);
			interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Error',
						description: 'vc move has crashed. Please report this to the bot owner.',
						color: '#e74c3c',
					},
				)],
				ephemeral: true,
			});
		}
	},
};

