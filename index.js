const { Client, Intents } = require('discord.js');
const env = require('./env.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const mariadb = require('./db.js');
const greet = require('./utilities/greet.js');
const embedcreator = require('./embed.js');
const emojiUnicode = require('emoji-unicode');
const botgate = require('./utilities/botgate.js');
global.client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
global.client.login(env.discord.token);
global.client.once('ready', async () => {
	console.log('Ready!');
	// get the number of users in the server
	const guild = global.client.guilds.cache.get(env.discord.guild);
	const members = await guild.members.fetch();
	// set the client's presence
	global.client.user.setActivity(`${members.size} members`, { type: 'WATCHING' });
});

(async () => {
	db = await mariadb.getConnection();
	// drop table if it exists
	// only for testing
	// await db.query('DROP TABLE IF EXISTS roles');
	// create roles table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS roles (id VARCHAR(255) PRIMARY KEY, emoji VARCHAR(255), raw_emoji VARCHAR(255), message_id VARCHAR(255), channel_id VARCHAR(255)) COLLATE utf8mb4_general_ci CHARSET utf8mb4;');
	// create notify table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS notify (user_id VARCHAR(255) PRIMARY KEY, name VARCHAR(255))');
	// create settings table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS settings (setting VARCHAR(255) PRIMARY KEY, value BOOLEAN)');
	db.end();
}
)();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = env.discord.client_id;
const guildId = env.discord.guild;

for (const file of commandFiles) {
	console.log(`Loading command ${file}...`);
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(env.discord.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
})();

global.client.on('guildMemberAdd', async member => {
	// check if member is a bot
	if (member.user.bot) {
		botgatestatus = await botgate.status();
		console.log(`${member.user.tag} is a bot.`);
		if (botgatestatus === true) {
			console.log('Botgate is enabled.');
			console.log('Kicking bot...');
			member.kick('Botgate is enabled.');
			console.log('Kicked bot.');
			return greet.sendKickAlert(member);
		}
		else {
			console.log('Botgate is disabled.');
		}

	}
	const guild = global.client.guilds.cache.get(env.discord.guild);

	greet.sendNotify(member);
	// Update presence
	const members = await guild.members.fetch();
	global.client.user.setActivity(`${members.size} members`, { type: 'WATCHING' });
},
);

global.client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log(interaction.commandName);
	const commandFile = `./commands/${interaction.commandName}.js`;
	if (!fs.existsSync(commandFile)) return;
	const command = require(commandFile);
	await command.execute(interaction);
});
global.client.on('messageReactionAdd', async (reaction, user) => {
	if (user.bot) return;
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			embedcreator.sendError(error);
			return;
		}
	}
	const message = reaction.message;
	const channel = message.channel;
	const guild = channel.guild;
	console.log(reaction.emoji);
	if (reaction.emoji.id) {
		emoji = reaction.emoji.name;
	}
	else {
		emoji = emojiUnicode(reaction.emoji.name);
	}
	console.log(emoji);
	// query db for role
	try {
		db = await mariadb.getConnection();
		const role = await db.query('SELECT * FROM roles WHERE emoji = ? AND message_id = ?', [emoji, message.id]);
		db.end();
		const roleId = String(role[0].id);
		console.log(role);
		console.log(roleId);
		const roleName = await guild.roles.cache.get(roleId).name;
		const member = guild.members.cache.get(user.id);
		if (member) {
			try {
				member.roles.add(roleId);
			}
			catch (error) {
				console.error(error);
				embedcreator.sendError(error);
			}
		}
		console.log(`${user.username} reacted to ${roleName} in ${guild.name} with ${emoji}`);
		embedcreator.log(`${user} reacted to ${roleName} in ${guild.name} with ${reaction.emoji}`);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
},
);
global.client.on('messageReactionRemove', async (reaction, user) => {
	if (user.bot) return;
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			embedcreator.sendError(error);
			return;
		}
	}
	try {
		const message = reaction.message;
		const channel = message.channel;
		const guild = channel.guild;
		console.log(reaction.emoji);
		if (reaction.emoji.id) {
			emoji = reaction.emoji.name;
		}
		else {
			emoji = emojiUnicode(reaction.emoji.name);
		}
		console.log(emoji);
		// query db for role
		db = await mariadb.getConnection();
		const role = await db.query('SELECT * FROM roles WHERE emoji = ? AND message_id = ?', [emoji, message.id]);
		db.end();
		if (role.length === 0) return;
		const roleId = String(role[0].id);
		const member = guild.members.cache.get(user.id);
		const roleName = guild.roles.cache.get(roleId).name;
		if (member) {
			try {
				member.roles.remove(roleId);
			}
			catch (error) {
				console.error(error);
			}
		}

		console.log(`${user.username} un-reacted to ${roleName} in ${guild.name} with ${emoji}`);
		embedcreator.log(`${user} un-reacted to ${roleName} in ${guild.name} with ${reaction.emoji}`);
	}
	catch (error) {
		console.error(error);
		// send error to discord
		embedcreator.sendError(error);
	}
},
);
process.on('unhandledRejection', error => {
	console.error(error);
	// send error to discord
	embedcreator.sendError(error);
},
);