const { OpenAI } = require('openai');
const env = require('../env.js');
const embedcreator = require('../embed.js');

const openai = new OpenAI({
	apiKey: env.utilities.openai,
});

async function createCompletion(prompt) {
	try {
		response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: String(prompt) }],
			max_tokens: 300,
		},
		)
			.then((response) => {
				return response.choices[0].message.content;
			},
			)
			.catch((err) => {
				console.log(err);
				embedcreator.sendError(err);
				return err;
			},
			);
		return response;
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
		return err;
	}
}

async function GenerateImage(prompt) {
	try {
		response = await openai.createImage({
			prompt: String(prompt),
			n: 1,
			size: '1024x1024',
		},
		)
			.then((response) => {
				return response.data.data[0].url;
			},
			)
			.catch((err) => {
				console.log(err);
				embedcreator.sendError(err);
				return err;
			},
			);
		return response;
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
	}
}

module.exports = { createCompletion, GenerateImage };