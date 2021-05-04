import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import { getState } from './bot-state';
import { leaveChannel, playMusic, searchYT } from './dj';

const token = process.env.BOT_TOKEN;
const BOT_PREFIX = 'dj!';

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});


const playCommand = `${BOT_PREFIX}play`;
const stopCommand = `${BOT_PREFIX}stop`;

const getServerId = (msg: Discord.Message) => msg.guild?.id || '';
const getVoiceChannel = (msg: Discord.Message) => msg.member?.voice.channel;


const commandPlay = async (msg: Discord.Message) => {
    const musicName = msg.content.replace(playCommand, '').trim();
    if (!musicName) {
        return msg.reply(`Comando ${playCommand} <nome da música>`);
    }

    const voiceChannel = getVoiceChannel(msg);
    if (!voiceChannel) {
        return msg.reply(`Você precisa estar em um canal de voz!`);
    }

    const serverId = getServerId(msg);
    const music = await searchYT(musicName);
    if (!music) {
        return msg.reply(`Música não encontrada`);
    }

    return playMusic(serverId, voiceChannel, music, msg);
}

const commandStop = async (msg: Discord.Message) => {
    const serverId = getServerId(msg);
    const state = getState(serverId);
    if (!state.playing)
        return msg.reply('Nenhuma música sendo tocada');

    return await leaveChannel(serverId, true);
}



client.on('message', async (msg: Discord.Message) => {
    if (msg.content.startsWith(playCommand)) {
        await commandPlay(msg);
    }
    else if (msg.content.startsWith(stopCommand)) {
        await commandStop(msg);
    }
});

client.login(token);