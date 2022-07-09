const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
// get users from database and put id's in array
async function getUsers() {
	db = await mariadb.getConnection();
	rows = await db.query('SELECT user_id FROM notify');
	users = [];
	for (row of rows) {
		users.push(row.user_id);
	}
	db.end();
	return users;
}

async function sendNotify(member) {
	const users = await getUsers();
	for (userId of users) {
		console.log(userId);
		const user = await global.client.users.fetch(userId);
		user.send(
			{
				embeds: [ embedcreator.setembed(
					{
						title: 'New Member',
						description: `${member.user} has joined ${global.client.guilds.cache.get(env.discord.guild).name}`,
						color: '#19ebfe',
						image: {
							url: `${member.user.avatarURL({ dynamic: true })}`,
						},
					},
				)],
			},
		);
	}
}
module.exports = { sendNotify, getUsers };