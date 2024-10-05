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
	}
	catch (err) {
		console.error(err);
		embedcreator.sendError(err);
	}
	finally {
		if (db) {
			db.end()
				.then(() => console.log('Database connection ended'))
				.catch((err) => {
					if (err) {
						console.error(err);
						embedcreator.sendError(err);
					}
				},
				);
		}
	}
}
module.exports = {
	updateChannel,
};