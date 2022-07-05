const env = require('./env.js');
const merge = require('lodash.merge');
var setembed = function(opts){
	var embed = {
		// Discord Embed Template Coda
		color: 0x00ff00,
		title: '',
		description: '',
		url: '',
		timestamp: `${new Date()}`,
		footer: {
			text: 'discord.gg/coda',
			icon_url: `${global.client.guilds.cache.get(env.discord.guild).iconURL({ dynamic: true })}`,
		},
	};
	return merge (embed, opts);
};
module.exports = { setembed };