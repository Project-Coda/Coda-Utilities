const embedcreator = require('../embed.js');
const env = require('../env.js');
const { ban } = require('./ban.js');
const mariadb = require('../db.js');
async function checkMention(message) {
	try {
		if (message.member.roles.cache.has(env.discord.admin_role) || message.member.roles.cache.has(env.discord.mod_role)) return;
		if (message.content.includes('@everyone') || message.content.includes('@here')) {
			// increment the user's strikes
			const reason = 'Mention Spam';
			const strikes = await incrementStrikes(message.author.id, reason);
			await embedcreator.mentionAlert(message, strikes);
			const embed = await embedcreator.setembed(
					{
						title: 'Unauthorized Mention Detected',
						description: 'You have attempted to mention everyone or here that behavior is not allowed.',
						color: 0xe74c3c,
						fields: [{
							name: 'Strike',
							value: strikes,
						},
						],
					},
				),
				reply = await message.reply({ embeds: [embed], ephemeral: true });
			await message.delete();
			// wait 5 seconds then delete the reply
			setTimeout(() => {
				reply.delete();
			}
			, 5000);
		}
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
	}
}
async function incrementStrikes(userID, reason) {
	try {
		try {
		// get the user's current strikes
			db = await mariadb.getConnection();
			strikes = await db.query('SELECT strikes FROM coda_strikes WHERE user_id = ?', [userID]);
			db.end();
		}
		catch (err) {
			console.log(err);
			embedcreator.sendError(err);
		}
		// if the user has no strikes, add them to the database
		if (strikes[0] == undefined) {
			newStrikes = 1;
			db = await mariadb.getConnection();
			await db.query('INSERT INTO coda_strikes (user_id, strikes) VALUES (?, ?)', [userID, newStrikes]);
			db.end();
		}
		else {
			// add one to coda strikes for user
			newStrikes = strikes[0].strikes + 1;
			// update the user's strikes
			console.log(newStrikes);
			db = await mariadb.getConnection();
			await db.query('UPDATE coda_strikes SET strikes = ? WHERE user_id = ?', [newStrikes, userID]);
			db.end();

		}
		if (newStrikes >= 3) {
			await ban(userID, reason);
		}
		// return the new strike count
		return newStrikes;
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
	}
}
module.exports = {
	checkMention,
	incrementStrikes,
};