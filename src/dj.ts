import { Message, VoiceChannel, VoiceConnection } from 'discord.js';
import ytdl from 'ytdl-core';
import { getState, setState } from './bot-state';
import ytSearch, { VideoSearchResult } from 'yt-search';
import { fork } from 'child_process';
import path from 'path';

const searchProcess = fork(path.join(__dirname, 'search'));

export const searchYT = async (search: any): Promise<ytSearch.VideoSearchResult[] | undefined> => {
    return new Promise((resolve, reject) => {
        searchProcess
            .on('message', ({ type, data }: any) => {
                if (type === 'search-success')
                    resolve(data)
                else if (type === 'search-error')
                    reject(data)
            })
            .send(search)
    });
}

export const leaveChannel = async (serverId: string, endConnection: boolean) => {
    const state = getState(serverId);

    if (endConnection)
        await state.channelConnection?.dispatcher.end();

    await state.voiceChannel?.leave();

    setState(serverId, {
        playing: false,
        channelConnection: undefined,
        voiceChannel: undefined,
        queue: []
    });
}

export const skipMusic = async (serverId: string) => {
    const state = getState(serverId);
    await state.channelConnection?.dispatcher.end();
    state.queue.shift();

    setState(serverId, state);
    if (state.queue.length)
        playMusicConnection(serverId, state.channelConnection as VoiceConnection, state.queue[0].url);
}

export const addToQueue = async (serverId: string, music: VideoSearchResult) => {
    const state = getState(serverId);
    state.playing = true;
    state.queue.push(music);
    await setState(serverId, state);
}

const playMusicConnection = (serverId: string, connection: VoiceConnection, musicUrl: string) => {
    connection.play(ytdl(musicUrl, { filter: 'audioonly', highWaterMark: 1 << 25 }))
        .on('finish', async () => {
            const state = getState(serverId);
            state.queue.shift();
            setState(serverId, state);

            if (!state.queue.length) {
                leaveChannel(serverId, false);
            }
            else {
                playMusicConnection(serverId, connection, state.queue[0].url);
            }
        })
        .on('error', error => {
            console.log(error);
        });
}

export const playMusic = async (serverId: string, voiceChannel: VoiceChannel, music: VideoSearchResult, msg: Message) => {
    const state = getState(serverId);
    if (!state.playing) {
        const connection = await voiceChannel.join();
        state.voiceChannel = voiceChannel;
        state.channelConnection = connection;
        setState(serverId, state);
        await playMusicConnection(serverId, connection, music.url);
        msg.reply(`🎵 ${music.title}`);
    }
    else {
        msg.reply(`🎵 ${music.title} adicionada à fila!`);
    }

    await addToQueue(serverId, music);
}