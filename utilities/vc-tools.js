const env = require('../env.js');
const embedcreator = require('../embed.js');
const mariadb = require('../db.js');
async function getMaxBitrate() {
	// get max bitrate from discord
	const guild = await global.client.guilds.cache.get(env.discord.guild);
	const maxbitrate = await guild.premiumTier;
	// convert to bitrate
	if (maxbitrate === 0) {
		return 96000;
	}
	if (maxbitrate === 1) {
		return 128000;
	}
	if (maxbitrate === 2) {
		return 256000;
	}
	if (maxbitrate === 3) {
		return 384000;
	}
}
// Set bitrate of each channel to max bitrate
async function setBitrate() {
	try {
		const guild = await global.client.guilds.cache.get(env.discord.guild);
		const maxbitrate = await getMaxBitrate();
		const channels = await guild.channels.cache.filter(channel => channel.type === 2 && channel.bitrate !== maxbitrate);
		await channels.forEach(async channel => {
			await channel.setBitrate(maxbitrate);
			bitrate = maxbitrate / 1000;
			embedcreator.log(`Set bitrate of ${channel} to ${bitrate}kbps`);
		});
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
async function getParentChannel(channelid) {
	try {
		const channel = await global.client.channels.cache.get(channelid);
		if (channel.parentId) {
			return channel.parentId;
		}
		else {
			return null;
		}
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
async function returnUserToPreviousChannel(userid) {
	try {
		const db = await mariadb.getConnection();
		const sql = 'SELECT previous_channel FROM vc_logs WHERE user_id = ?';
		const previouschannel = await db.query(sql, [userid]).then(result => result[0].previous_channel) || null;
		await db.end();
		const guild = await global.client.guilds.cache.get(env.discord.guild);
		const member = await guild.members.cache.get(userid);
		if (!previouschannel) {
			return await member.voice.setChannel(null);
		}
		else {
			const channel = await guild.channels.cache.get(previouschannel);
			await member.voice.setChannel(channel);
		}
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
module.exports = {
	getMaxBitrate,
	setBitrate,
	getParentChannel,
	returnUserToPreviousChannel,
};