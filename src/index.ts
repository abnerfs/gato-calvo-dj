import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';

type BotState = {
    playing: boolean;
    channel?: string;
}

let botState : any = {

}

const initialSate : BotState = {
    playing: false,
    channel: undefined
}

const getState = (serverId : string) : BotState  => {
    return botState[serverId] || initialSate as BotState;
}

const setState = (serverId: string, state: BotState) => {
    botState[serverId] = state;
}


const token = process.env.BOT_TOKEN;
const BOT_PREFIX = 'dj!';

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

const searchYT = (search : string) : Promise<string> => {
    return new Promise((resolve, reject) => {
        ytSearch(search, function (err: Error, r : any) {
            if (err)
                reject(err);

            const firstResult = r?.videos[0]?.url;
            resolve(firstResult);
        })
    });
}

client.on('message', async (msg: Discord.Message) => {
    const playCommand = `${BOT_PREFIX}play`;
    if(msg.content.startsWith(playCommand)) {
        const musicName = msg.content.replace(playCommand, '').trim();
        if(!musicName) {
            return msg.reply(`Comando ${playCommand} <nome da música>`);
        }

        const voiceChannel = msg.member?.voice.channel;
        if(!voiceChannel) {
            return msg.reply(`Você precisa estar em um canal de voz!`);
        }

        const serverId = msg.guild?.id || '';
        const state = getState(serverId);
        if(state.playing) {
            return msg.reply(`Já existe uma música sendo tocada`);
        }

        const video = await searchYT(musicName);
        if(!video) {
            return msg.reply(`Nenhuma música foi encontrada!`);
        }

        const connection = await voiceChannel.join();
        setState(serverId, {
            playing: true,
            channel: msg.channel.id
        });

        connection.play(ytdl(video, { filter: 'audioonly' }))
            .on('end', async () => {
                await voiceChannel.leave();
                setState(serverId, {
                    playing: false,
                    channel: undefined
                });
            })
            .on('error', error => {
                console.log(error);
            });
    }
});

client.login(token);