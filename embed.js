const env = require('./env.js');
const merge = require('lodash.merge');
var setembed = function(opts){
	var embed = {
		// Discord Embed Template Coda
		title: '',
		description: '',
		color: 0x19ebfe,
		url: '',
		timestamp: `${new Date().toISOString()}`,
		footer: {
			text: 'discord.gg/coda',
			icon_url: `${global.client.guilds.cache.get(env.discord.guild).iconURL({ dynamic: true })}`,
		},
	};
	return merge (embed, opts);
};
var sendError = function(message){
	try {
		var embed = setembed({
			title: 'Error',
			description: `${message}`,
			color: 0xe74c3c,
		});
		global.client.channels.cache.get(env.discord.logs_channel).send({ embeds: [embed] });
	}
	catch (err) {
		console.log(err);
	}
};
var log = function(message){
	var embed = setembed({
		title: 'Log',
		description: `${message}`,
		color: 0x19ebfe,
	});
	global.client.channels.cache.get(env.discord.logs_channel).send({ embeds: [embed] });
};
var alert = function(message){
	var embed = setembed({
		title: '🚨 Alert 🚨',
		description: `${message}`,
		color: 0xe74c3c,
	});
	global.client.channels.cache.get(env.discord.logs_channel).send({ content: '🚨 Critical Alert 🚨' + '\n<@&' + env.discord.admin_role + '> <@&' + env.discord.mod_role + '>', embeds: [embed] });
};
module.exports = { setembed, sendError, log, alert };
