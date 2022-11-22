const env = require('../env.js');
const fetch = require('node-fetch');
async function getList() {
	file = await fetch(env.utilities.welcomemessagesfile);
	messages = await file.text();
	messages = messages.split(' end');
	return messages;
}

async function getWelcome() {
	const welcomelist = await getList();
	const welcome = welcomelist[Math.floor(Math.random() * (welcomelist.length - 1))];
	return welcome.replace(/\\n/g, '\n');
}

module.exports = { getList, getWelcome };