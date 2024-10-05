const mariadb = require('../db.js');
const embedcreator = require('../embed.js');
async function updateChannel(userid, oldchannel, newchannel) {
	try {
		const db = await mariadb.getConnection();
		const sql = `
		INSERT INTO vc_logs (user_id, previous_channel, new_channel) 
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE 
		previous_channel = VALUES(previous_channel),
		new_channel = VALUES(new_channel)`;
		await db.query(sql, [userid, oldchannel, newchannel]);
		await db.end();
		return;
	}
	catch (err) {
		console.error(err);
		embedcreator.sendError(err);
	}
}
module.exports = {
	updateChannel,
};