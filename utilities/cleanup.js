const embedcreator = require('../embed.js');
const mariadb = require('../db.js');
const env = require('../env.js');

async function cleanupDBRoles() {
	const db = await mariadb.getConnection();
	const queryroles = 'SELECT id FROM roles';
	const queryrolesresult = await db.query(queryroles);
	const roles = await queryrolesresult.map(role => role.id);
	const guild = await client.guilds.cache.get(env.discord.guild);
	const guildroles = guild.roles.cache.map(role => role.id);
	const rolesToDelete = roles.filter(role => !guildroles.includes(role));
	for (const role of rolesToDelete) {
		const query = 'DELETE FROM roles WHERE id = ?';
		await db.query(query, [role]);
		console.log(`Deleted role from database: ${role}`);
	}
	const queryChannels = 'SELECT channel_id FROM roles';
	const queryChannelsResult = await db.query(queryChannels);
	const channels = await queryChannelsResult.map(channel => channel.channel_id);
	const guildchannels = guild.channels.cache.map(channel => channel.id);
	const channelsToDelete = channels.filter(channel => !guildchannels.includes(channel));
	for (const channel of channelsToDelete) {
		const query = 'DELETE FROM roles WHERE channel_id = ?';
		await db.query(query, [channel]);
		console.log(`Deleted channel from database: ${channel}`);
	}
	const queryMessages = 'SELECT message_id FROM roles';
	const queryMessagesResult = await db.query(queryMessages);
	const messages = await queryMessagesResult.map(message => message.message_id);
	const guildmessages = guild.channels.cache.map(message => message.id);
	const messagesToDelete = messages.filter(message => !guildmessages.includes(message));
	for (const message of messagesToDelete) {
		const query = 'DELETE FROM roles WHERE message_id = ?';
		await db.query(query, [message]);
		console.log(`Deleted message from database: ${message}`);
	}

	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on Role Assign 🧹',
		description:  rolesToDelete.length + ' Items Were Removed From The Database',
		color: 0xe74c3c,
	});
	if (rolesToDelete.length > 0 || channelsToDelete.length > 0 || messagesToDelete.length > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on Role Assign 🧹', embeds: [embed] });
	}

}
async function cleanupDBAutoRoles() {
	const db = await mariadb.getConnection();
	const queryroles = 'SELECT role_id FROM auto_role';
	const queryrolesresult = await db.query(queryroles);
	const roles = await queryrolesresult.map(role => role.role_id);
	const guild = await client.guilds.cache.get(env.discord.guild);
	const guildroles = await guild.roles.cache.map(role => role.id);
	const rolesToDelete = roles.filter(role => !guildroles.includes(role));
	for (const role of rolesToDelete) {
		const query = 'DELETE FROM auto_role WHERE role_id = ?';
		await db.query(query, [role]);
		console.log(`Deleted autorole from database: ${role}`);
	}
	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on Auto Roles 🧹',
		description: rolesToDelete.length + ' Roles Were Removed From The Database',
		color: 0xe74c3c,
	});
	if (rolesToDelete.length > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on Auto Roles 🧹', embeds: [embed] });
	}
}
async function cleanupDBNotify() {
	const db = await mariadb.getConnection();
	const queryusers = 'SELECT user_id FROM notify';
	const queryusersresult = await db.query(queryusers);
	const users = queryusersresult.map(user => user.user_id);
	const guild = await client.guilds.cache.get(env.discord.guild);
	const guildmembers = guild.members.cache.map(member => member.id);
	const usersToDelete = users.filter(user => !guildmembers.includes(user));
	for (const user of usersToDelete) {
		const query = 'DELETE FROM notify WHERE user_id = ?';
		await db.query(query, [user]);
		console.log(`Deleted notify from database: ${user}`);
	}
	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on Notify',
		description: usersToDelete.length + ' Users Were Removed From The Database',
		color: 0xe74c3c,
	});
	if (usersToDelete.length > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on Notify 🧹', embeds: [embed] });
	}
}
async function cleanupDB() {
	try {
		await cleanupDBRoles();
		await cleanupDBAutoRoles();
		await cleanupDBNotify();
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
	}
}

module.exports = {
	cleanupDB,
	cleanupDBRoles,
	cleanupDBAutoRoles,
	cleanupDBNotify,
};