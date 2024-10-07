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
		console.log(`Deleted role id: ${role} from roles table`);

	}
	const queryChannels = 'SELECT channel_id FROM roles';
	const queryChannelsResult = await db.query(queryChannels);
	const channels = await queryChannelsResult.map(channel => channel.channel_id);
	const guildchannels = guild.channels.cache.map(channel => channel.id);
	const channelsToDelete = channels.filter(channel => !guildchannels.includes(channel));
	for (const channel of channelsToDelete) {
		const query = 'DELETE FROM roles WHERE channel_id = ?';
		await db.query(query, [channel]);
		console.log(`Deleted channel id: ${channel} from roles table`);
	}
	const queryMessages = 'SELECT message_id FROM roles';
	const queryMessagesResult = await db.query(queryMessages);
	const messages = await queryMessagesResult.map(message => message.message_id);
	let messagesToDelete = 0;
	for (const message of messages) {
		// check if message exists if it doesn't delete it
		const channel = await db.query('SELECT channel_id FROM roles WHERE message_id = ?', [message]);
		const messageExists = await guild.channels.cache.get(channel[0].channel_id).messages.fetch(message).catch(() => false);
		if (!messageExists) {
			messagesToDelete += 1;
			const query = 'DELETE FROM roles WHERE message_id = ?';
			await db.query(query, [message]);
			console.log(`Deleted message id: ${message} from roles table`);
		}
	}
	// add up all the items that were deleted
	const totalItemsDeleted = rolesToDelete.length + channelsToDelete.length + messagesToDelete;

	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on Role Assign 🧹',
		description: `${totalItemsDeleted} item${totalItemsDeleted !== 1 ? 's were' : ' was'} removed from the database`,
		color: 0xe74c3c,
	});
	if (totalItemsDeleted > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on Role Assign 🧹', embeds: [embed] });
	}
	await db.end();
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
		console.log(`Deleted role id: ${role} from auto_role table`);
	}
	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on Auto Roles 🧹',
		description: `${rolesToDelete.length} role${rolesToDelete.length !== 1 ? 's were' : ' was'} removed from the database`,
		color: 0xe74c3c,
	});
	if (rolesToDelete.length > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on Auto Roles 🧹', embeds: [embed] });
	}
	await db.end();
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
		console.log(`Deleted user id ${user} from notify table`);
	}
	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on Notify',
		description: `${usersToDelete.length} user${usersToDelete.length !== 1 ? 's were' : ' was'} removed from the database`,
		color: 0xe74c3c,
	});
	if (usersToDelete.length > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on Notify 🧹', embeds: [embed] });
	}
	await db.end();
}
async function cleanupDBVC_Logs() {
	const db = await mariadb.getConnection();
	const queryusers = 'SELECT user_id FROM vc_logs';
	const queryusersresult = await db.query(queryusers);
	const users = queryusersresult.map(user => user.user_id);
	const guild = await client.guilds.cache.get(env.discord.guild);
	const guildmembers = guild.members.cache.map(member => member.id);
	const usersToDelete = users.filter(user => !guildmembers.includes(user));
	for (const user of usersToDelete) {
		const query = 'DELETE FROM vc_logs WHERE user_id = ?';
		await db.query(query, [user]);
		console.log(`Deleted user id ${user} from vc_logs table`);
	}
	const embed = embedcreator.setembed({
		title: 'Ran Cleanup on VC Logs',
		description: `${usersToDelete.length} user${usersToDelete.length !== 1 ? 's were' : ' was'} removed from the database`,
		color: 0xe74c3c,
	});
	if (usersToDelete.length > 0) {
		await global.client.channels.cache.get(env.discord.logs_channel).send({ content: '<@&' + env.discord.admin_role + '> Ran Cleanup on VC Logs 🧹', embeds: [embed] });
	}
	await db.end();
}

async function cleanupDB() {
	try {
		await cleanupDBRoles();
		await cleanupDBAutoRoles();
		await cleanupDBNotify();
		await cleanupDBVC_Logs();
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