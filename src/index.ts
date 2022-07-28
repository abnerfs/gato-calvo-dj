import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import { getState } from './bot-state';
import { addToQueue, leaveChannel, playMusic, searchYT, skipMusic } from './dj';
import { embedFactory } from './messages';

const token = process.env.BOT_TOKEN;
const BOT_PREFIX = process.env.BOT_PREFIX || '.';
export const BOT_NAME = 'Bot de música'

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});


const playCommand = `${BOT_PREFIX}play`;
const stopCommand = `${BOT_PREFIX}stop`;
const queueCommand = `${BOT_PREFIX}queue`;
const skipCommand = `${BOT_PREFIX}skip`;

const getServerId = (msg: Discord.Message) => msg.guild?.id || '';
const getVoiceChannel = (msg: Discord.Message) => msg.member?.voice.channel;


const parseSearch = (search: string): any => {
    if (search.indexOf('list=') > -1) {
        const listId = search.split('list=')[1];
        if (listId)
            return {
                listId
            }
    }
    return search
}

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
    const search = parseSearch(musicName);
    let results = (await searchYT(search))?.map(x => {
        if (!x.url)
            x.url = x.url || `https://www.youtube.com/watch?v=${x.videoId}`;
        return x
    });

    if (!results?.length) {
        return msg.reply(`Música não encontrada`);
    }

    if (!search.listId) {
        results = results.slice(0, 1)
    }

    await playMusic(serverId, voiceChannel, results[0], msg);
    for (const music of results.slice(1)) {
        addToQueue(serverId, music);
    }
}

const commandStop = async (msg: Discord.Message) => {
    const serverId = getServerId(msg);
    const state = getState(serverId);
    if (!state.playing)
        return msg.reply('Nenhuma música sendo tocada');

    return await leaveChannel(serverId, true);
}

const commandSkip = async (msg: Discord.Message) => {
    const serverId = getServerId(msg);
    const state = getState(serverId);
    if (!state.playing)
        return msg.reply('Nenhuma música sendo tocada');

    return await skipMusic(serverId);
}

const commandQueue = async (msg: Discord.Message) => {
    const serverId = getServerId(msg);
    const state = getState(serverId);
    if (!state.queue.length)
        return msg.reply('Nenhuma música sendo tocada');

    let i = 1;

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds / 60 - (hours * 60)));
        const seconds = totalSeconds - (hours * 3600) - (minutes * 60);

        return {
            hours,
            minutes,
            seconds
        }
    }

    const hourPartPad = (amount: number) => {
        return amount.toString().padStart(2, '0');
    }

    let queue = state.queue.map(x => {
        const duration = formatDuration(x.duration.seconds);

        return `[${i++} - ${x.title} - ${hourPartPad(duration.hours)}:${hourPartPad(duration.minutes)}:${hourPartPad(duration.seconds)} ](${x.url}) `
    })
        .slice(0, 10)
        .join('\r\n');;

    const embed = embedFactory({
        author: {
            author: client.user?.username || ''
        },
        description: queue
    })
    return msg.reply(embed);
}


client.on('message', async (msg: Discord.Message) => {
    try {
        if (msg.content.startsWith(playCommand)) {
            await commandPlay(msg);
        }
        else if (msg.content.startsWith(stopCommand)) {
            await commandStop(msg);
        }
        else if (msg.content.startsWith(queueCommand)) {
            await commandQueue(msg);
        }
        else if (msg.content.startsWith(skipCommand)) {
            await commandSkip(msg);
        }
    }
    catch (err) {
        console.log(err);
    }
});

client.login(token);