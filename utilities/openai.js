const { Configuration, OpenAIApi } = require('openai');
const env = require('../env.js');
const embedcreator = require('../embed.js');
async function getOpenAI() {
	const configuratuion = new Configuration({
		apiKey: env.utilities.openai,
	});
	const openai = new OpenAIApi(configuratuion);
	return openai;
}
async function createCompletion(prompt) {
	try {
		openai = await getOpenAI();
		response = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: prompt,
			temperature: 0,
			max_tokens: 300,
		},
		)
			.then((response) => {
				return response.data.choices[0].text;
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
module.exports = { getOpenAI, createCompletion };