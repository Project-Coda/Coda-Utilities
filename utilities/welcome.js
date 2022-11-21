const env = require('../env.js');
const fetch = require('node-fetch');
async function getList() {
	file = await fetch(env.utilities.welcomemessagesfile);
	messages = await file.text();
	messages = messages.split('\n');
	return messages;
}

async function getWelcome() {
	const welcomelist = await getList();
	const welcome = welcomelist[Math.floor(Math.random() * welcomelist.length)];
	return welcome;
}

module.exports = { getList, getWelcome };