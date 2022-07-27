const env = require('../env.js');
const fetch = require('node-fetch');
async function getList() {
	console.log('Getting list of prompts...');
	file = await fetch(env.utilities.promptfile);
	prompts = await file.text();
	prompts = prompts.split('\n');
	return prompts;
}

async function getPrompt() {
	const prompts = await getList();
	const prompt = prompts[Math.floor(Math.random() * prompts.length)];
	return prompt;
}

module.exports = { getList, getPrompt };