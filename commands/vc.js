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
		// Limit command to Founders
		if (!interaction.member.roles.cache.has(env.discord.admin_role) || !interaction.member.roles.cache.has(env.discord.mod_role)) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incedent Detected',
						description: `${interaction.member.user} tried to use the vc move command but did not have the Founders role.`,
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
			const subcommand = interaction.options.getSubcommand();
			const userdestination = interaction.options.get('destination').value;
			const destination = userdestination.replace(/[^0-9.]+/g, '');
			console.log(destination);
			if (subcommand === 'move') {
				console.log('move');
				if (interaction.options.get('source')) {
					console.log('source');
					usersource = interaction.options.get('source').value;
					sourceid = usersource.replace(/[^0-9.]+/g, '');
					sourcevc = global.client.channels.cache.get(sourceid);
					destinationvc = global.client.channels.cache.get(destination);
					if (sourcevc && sourcevc.type === 'GUILD_VOICE' && destinationvc && destinationvc.type === 'GUILD_VOICE') {
						sourcevc.members.forEach(member => {
							member.voice.setChannel(destination);
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
					sourcevc = global.client.channels.cache.get(interaction.member.voice.channel.id);
					destinationvc = global.client.channels.cache.get(destination);
					console.log(sourcevc.type);
					if (sourcevc && sourcevc.type === 'GUILD_VOICE' && destinationvc && destinationvc.type === 'GUILD_VOICE') {
						sourcevc.members.forEach(member => {
							member.voice.setChannel(destination);
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

