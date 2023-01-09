const { ChannelType, PermissionFlagsBits } = require('discord.js');
const mariadb = require('../db.js');
const embedcreator = require('../embed.js');
const env = require('../env.js');
async function Create(newState) {
	console.log(newState);
	// get member from newState
	const member = newState.member;
	// create channel
	// get category
	const category = newState.guild.channels.cache.get(newState.channelId).parentId;
	guild = await global.client.guilds.cache.get(env.discord.guild);
	const userid = await member.id;
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
async function Destroy(oldState) {
	// get member from oldState
	const member = oldState.member;
	// check if member has a custom vc
	try {
		const db = await mariadb.getConnection();
		const channel = await db.query('SELECT * FROM custom_vc WHERE user_id = ?', [member.id]);
		db.end();
		if (channel.length === 0) return;
		// delete channel
		const channelid = channel[0].channel_id;
		const guild = member.guild;
		const channelToDelete = guild.channels.cache.get(channelid);
		// check if channel is empty
		if (channelToDelete.members.size > 0) return;
		channelToDelete.delete();
		// delete channel from db
		const db2 = await mariadb.getConnection();
		await db2.query('DELETE FROM custom_vc WHERE user_id = ?', [member.id]);
		db2.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}

module.exports = { Create, Destroy };