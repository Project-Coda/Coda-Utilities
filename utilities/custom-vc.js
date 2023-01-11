const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mariadb = require('../db.js');
const embedcreator = require('../embed.js');
const env = require('../env.js');
async function buttonResponder(interaction) {
	const buttonid = interaction.customId;
	const userchannel = await checkUser(interaction.user.id);
	const userid = interaction.user.id;
	if (buttonid === 'deletechannel') {
		interaction.reply({ content: 'Channel deleted' });
		await deleteChannel(userchannel);
	}
	if (buttonid === 'renamechannel') {
		interaction.reply({ content: 'Please enter the new name' });
		// message collector to collect new name
		const filter = m => m.author.id === interaction.user.id;
		const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });
		collector.on('collect', async m => {
			const newname = String(m.content);
			await renameChannel(userchannel, newname);
			interaction.followUp({ content: 'Channel renamed to ' + newname });
			collector.stop();
		});
	}
	if (buttonid === 'userlimit') {
		interaction.reply({ content: 'Please enter the new user limit' });
		// message collector to collect new user limit
		const filter = m => m.author.id === interaction.user.id;
		const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });
		collector.on('collect', async m => {
			const newlimit = await m.content;
			if (parseInt(newlimit) >= 0 && parseInt(newlimit) <= 99) {
				await changeUserLimit(userchannel, newlimit);
				interaction.followUp({ content: 'User limit changed to ' + newlimit });
			}
			else {
				interaction.followUp({ content: 'Invalid user limit' });
			}
			collector.stop();
		});
	}
	if (buttonid === 'transferownership') {
		interaction.reply({ content: 'Please mention the new owner' });
		// message collector to collect new owner
		const filter = m => m.author.id === interaction.user.id;
		const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });
		collector.on('collect', async m => {
			const newowner = m.mentions.members.first();
			console.log(newowner.user.id);
			if (newowner) {
				await transferOwnership(userid, newowner.user.id, userchannel);
				interaction.followUp({ content: 'Ownership transferred to <@' + newowner.user + '>' });
			}
			else {
				interaction.followUp({ content: 'Invalid user' });
			}
			collector.stop();
		});
	}
	if (buttonid === 'visibility') {
		const status = await changeVisibility(userchannel);
		interaction.reply({ content: 'Visibility changed to ' + status });
	}
}
// Rename Channel
async function renameChannel(channelid, newname) {
	try {
		const channel = global.client.channels.cache.get(channelid);
		channel.setName(newname);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Change Visibility
async function changeVisibility(channelid) {
	try {
		const channel = global.client.channels.cache.get(channelid);
		if (channel.permissionsFor()) {
			channel.permissionOverwrites.edit(env.guildid
		}
		else {
// Change User Limit
async function changeUserLimit(channelid, newlimit) {
	try {
		const channel = global.client.channels.cache.get(channelid);
		channel.setUserLimit(newlimit);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Transfer Ownership
async function transferOwnership(olduser, newuser, channelid) {
	try {
	// set vc perms
		const channel = global.client.channels.cache.get(channelid);
		// set perms
		channel.permissionOverwrites.delete(olduser);
		channel.permissionOverwrites.set([
			{
				id: newuser,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
			},
		],
		);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
	try {
		const db = await mariadb.getConnection();
		await db.query('UPDATE custom_vc SET user_id = ? WHERE channel_id = ?', [newuser, channelid]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Check if user already has a channel
async function checkUser(userid) {
	const db = await mariadb.getConnection();
	const rows = await db.query('SELECT channel_id FROM custom_vc WHERE user_id = ?', [userid]);
	db.end();
	if (rows.length > 0) {
		return rows[0].channel_id;
	}
	else {
		return false;
	}
}
// Get Channels from DB
async function getChannels() {
	db = await mariadb.getConnection();
	rows = await db.query('SELECT channel_id FROM custom_vc');
	channels = [];
	for (row of rows) {
		channels.push(row.channel_id);
	}
	db.end();
	return channels;
}
// Delete Channel
async function deleteChannel(channel_id) {
	try {
		const db = await mariadb.getConnection();
		await db.query('DELETE FROM custom_vc WHERE channel_id = ?', [channel_id]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
	try {
		if (global.client.channels.cache.get(channel_id)){
			await global.client.channels.cache.get(channel_id).delete();
		}

	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Create CustomVC
async function Create(newState) {
	// check to ensure user doesn't already have a channel
	// get member from newState
	const member = newState.member;
	const userid = await member.id;
	const userhaschannel = await checkUser(newState.member.id);
	if (userhaschannel) {
		return member.voice.setChannel(userhaschannel);
	}
	// create channel
	// get category
	const category = newState.guild.channels.cache.get(newState.channelId).parentId;
	guild = await global.client.guilds.cache.get(env.discord.guild);
	userobject = await guild.members.fetch(userid);
	nickname = await userobject.displayName;
	const channel = await member.guild.channels.create({
		name: nickname + '\'s Channel',
		type: ChannelType.GuildVoice,
		bitrate: 96000,
		parent: category,
		// allow user to manage channel
		permissionOverwrites: [
			{
				id: member.id,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
			},
			{
				id: newState.guild.roles.everyone,
				allow: [PermissionFlagsBits.ViewChannel],
			},
		],
	});

	// move member to channel
	member.voice.setChannel(channel);

	// add channel to db
	try {
		const db = await mariadb.getConnection();
		await db.query('INSERT INTO custom_vc (user_id, channel_id) VALUES (?, ?)', [member.id, channel.id]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
	try {
		// send menu embed
		const { embed, row } = await generateMenuEmbed();
		await channel.send({ embeds: [embed], components: [row] });
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Generate Menu Embed
async function generateMenuEmbed() {
	const embed = await embedcreator.setembed(
		{
			title: 'Custom voice channel menu',
			description: 'Click on the buttons below, to change the settings of your custom voice channel.',
		},
	);
	const userlimit = new ButtonBuilder()
		.setCustomId('userlimit')
		.setLabel('User limit')
		.setStyle(ButtonStyle.Primary);
	const visibility = new ButtonBuilder()
		.setCustomId('visibility')
		.setLabel('Visibility')
		.setStyle(ButtonStyle.Success);
	const transferownership = new ButtonBuilder()
		.setCustomId('transferownership')
		.setLabel('Transfer ownership')
		.setStyle(ButtonStyle.Primary);
	const deletechannel = new ButtonBuilder()
		.setCustomId('deletechannel')
		.setLabel('Delete channel')
		.setStyle(ButtonStyle.Danger);
	const renamechannel = new ButtonBuilder()
		.setCustomId('renamechannel')
		.setLabel('Rename channel')
		.setStyle(ButtonStyle.Primary);
	const row = new ActionRowBuilder()
		.addComponents(renamechannel, userlimit, visibility, transferownership, deletechannel);
	return { embed, row };
}
// Destroy CustomVC
async function Cleanup() {
	try {
		// grab channe id's from db
		const channels = await getChannels();
		// loop through channels
		for (const channel_id of channels) {
			// check if channel exists
			const channel = await global.client.channels.cache.get(channel_id);
			if (channel) {
				// check if channel is empty
				if (channel.members.size == 0) {
				// delete channel
					await deleteChannel(channel.id);
				}
			}
			else {
				// delete channel from db
				await deleteChannel(channel_id);
			}
		}
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}


module.exports = { Create, Cleanup, getChannels, checkUser, deleteChannel, buttonResponder };