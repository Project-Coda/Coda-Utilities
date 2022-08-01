const { createAudioPlayer, NoSubscriberBehavior, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const embedcreator = require('../embed.js');

// Create Track Class
class Track {
	constructor(name, url, artist, image) {
		this.name = name;
		this.url = url;
		this.artist = artist;
		this.image = image;
	}
}
async function createEmbed(track) {
	embed = embedcreator.setembed ({
		title: `Now Playing: ${track.name}`,
		url: track.url,
		description: `**Artist:** ${track.artist}\n**URL:** ${track.url}`,
		color: 0x19ebfe,
		image: {
			url: track.image,
		},
	});
	return embed;
}
async function joinVC(channel) {
	channel = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	return channel;
}
async function YouTube(player, url, volume, channel) {
	try {
		info = await ytdl.getBasicInfo(url);
		const yt = ytdl(url, {
			filter: 'audioonly',
		});
		const resource = createAudioResource(yt, {
			inlineVolume: true,
		});
		await player.play(resource);
		await channel.subscribe(player);
		if (volume != 1) {
			console.log(`Setting volume to ${volume}`);
			resource.volume.setVolume(volume);
		}
		const track = new Track(info.videoDetails.title, url, info.videoDetails.author.name, info.videoDetails.thumbnails[4].url);
		await NowPlaying(track);
		return track;
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}
async function createPlayer() {
	const player = createAudioPlayer(
		{
			noSubscriberBehavior: NoSubscriberBehavior.Stop,
			noSubscriberBehaviorTimeout: 10000,
		},
	);
	return player;
}
async function NowPlaying(track) {
	console.log(`Now Playing: ${track.name} by ${track.artist}`);
}
module.exports = {
	YouTube,
	createPlayer,
	joinVC,
	createEmbed,
};
