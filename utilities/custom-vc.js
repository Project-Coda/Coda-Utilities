const { ChannelType, PermissionFlagsBits } = require('discord.js');
const mariadb = require('../db.js');
const embedcreator = require('../embed.js');
const env = require('../env.js');
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


module.exports = { Create, Cleanup };