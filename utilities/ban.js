const mariadb = require('../db.js');
const embedcreator = require('../embed.js');
const env = require('../env.js');
async function ban(userID, message) {
	try {
		// if the user has 3 strikes, delete them from the database and ban them
		db = await mariadb.getConnection();
		await db.query('DELETE FROM coda_strikes WHERE user_id = ?', [userID]);
		db.end();
	}
	catch (err) {
		console.log(err);
	}
	// ban the user
	const user = await global.client.users.fetch(userID);
	try {
		embed = await embedcreator.setembed(
			{
				title: 'You have been banned from the server',
				description: `If you believe this is in error, fill out the fourm out at: ${env.discord.forum}`,
				color: 0xe74c3c,
			},
		);
		await user.send({ embeds: [embed] });
	}
	catch (err) {
		console.log(err);
	}
	const guild = await global.client.guilds.fetch(env.discord.guild);
	const member = await guild.members.fetch(userID);
	await member.ban({ deleteMessageSeconds: 604800, reason: message });
}
module.exports = {
	ban,
};