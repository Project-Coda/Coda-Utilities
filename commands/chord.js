const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { Chord } = require('@tonaljs/tonal');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chord')
		.setDescription('Get chord info')
		.addStringOption(option =>
			option.setName('chord')
				.setDescription('Chord to get info for')
				.setRequired(true),
		),
	async execute(interaction) {
		const chord = interaction.options.get('chord').value;
		const chordInfo = Chord.get(chord);
		if (chordInfo) {
			console.log(chordInfo);
			return interaction.reply({
				embeds: [embedcreator.setembed({
					title: `${chordInfo.name}`,
					description: `**Notes:** ${chordInfo.notes.join(' ')}
					**Intervals:** ${chordInfo.intervals.join(' ')}`,
				})],
			});
		}

	},
};