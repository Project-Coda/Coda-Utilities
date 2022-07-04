const { Client, Intents } = require('discord.js');
const env = require('./env.js');
const Keyv = require('keyv');
const keyv = new Keyv(env.discord.db);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
global.client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
client.once('ready', async () => {
	console.log('Ready!');
});
keyv.on('error', err => {
	console.error('Error:', err);
});
keyv.on('connect', () => {
	console.log('Connected to database!');
});
keyv.set('test', 'value');
client.login(env.discord.token);

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

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log(interaction.commandName);
	const commandFile = `./commands/${interaction.commandName}.js`;
	if (!fs.existsSync(commandFile)) return;
	const command = require(commandFile);
	await command.execute(interaction);
});
client.on('messageReactionAdd', async (reaction, user) => {
	if (user.bot) return;
	const message = reaction.message;
	const channel = message.channel;
	const guild = channel.guild;
	const emoji = reaction.emoji.name;
	console.log(`${user.username} reacted with ${emoji} to ${message.url} in ${guild.name}`);
},
);