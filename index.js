const { Client, Intents } = require('discord.js');
const env = require('./env.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const mariadb = require('./db.js');
global.client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
global.client.login(env.discord.token);
global.client.once('ready', async () => {
	console.log('Ready!');
});

(async () => {
	db = await mariadb.getConnection();
	// drop table if it exists
	// only for testing
	// await db.query('DROP TABLE IF EXISTS roles');
	// create roles table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS roles (id BIGINT PRIMARY KEY, emoji VARCHAR(255), raw_emoji VARCHAR(255), message_id BIGINT, channel_id BIGINT)');
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
	}
})();

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
	if (reaction.message.partial) await reaction.message.fetch();
	const message = reaction.message;
	const channel = message.channel;
	const guild = channel.guild;
	const emoji = reaction.emoji.name;
	// query db for role
	const role = await db.query('SELECT * FROM roles WHERE emoji = ? AND message_id = ?', [emoji, message.id]);
	if (role.length === 0) return;
	const roleId = String(role[0].id);
	const member = guild.members.cache.get(user.id);
	if (member) {
		member.roles.add(roleId);
	}
	console.log(`${user.username} reacted to ${roleId} in ${guild.name}`);
},
);
global.client.on('messageReactionRemove', async (reaction, user) => {
	if (user.bot) return;
	if (reaction.message.partial) await reaction.message.fetch();
	const message = reaction.message;
	const channel = message.channel;
	const guild = channel.guild;
	const emoji = reaction.emoji.name;
	// query db for role
	const role = await db.query('SELECT * FROM roles WHERE emoji = ? AND message_id = ?', [emoji, message.id]);
	if (role.length === 0) return;
	const roleId = String(role[0].id);
	const member = guild.members.cache.get(user.id);
	const roleName = guild.roles.cache.get(roleId).name;
	if (member) {
		member.roles.remove(roleId);
	}
	console.log(`${user.username} un-reacted to ${roleName} in ${guild.name}`);
},
);