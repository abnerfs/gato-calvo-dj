import { VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { getState, setState } from './bot-state';
import ytSearch from 'yt-search';
import yts from 'yt-search';


export const searchYT = async (search: string): Promise<ytSearch.VideoSearchResult | undefined> => {
    return new Promise((resolve, reject) => {
        ytSearch(search, function (err: Error | string | null | undefined, r: yts.SearchResult) {
            if (err)
                reject(err);

            const firstResult = r?.videos[0];
            resolve(firstResult);
        })
    });
}


export const leaveChannel = async (serverId: string, endConnection: boolean) => {
    const state = getState(serverId);

    if(endConnection)
        await state.channelConnection?.dispatcher.end();

    await state.voiceChannel?.leave();

    setState(serverId, {
        playing: false,
        channelConnection: undefined,
        voiceChannel: undefined
    });
}

export const playMusic = async (serverId: string, voiceChannel: VoiceChannel, musicUrl: string) => {
    const connection = await voiceChannel.join();
    setState(serverId, {
        playing: true,
        channelConnection: connection,
        voiceChannel
    });

    connection.play(ytdl(musicUrl, { filter: 'audioonly' }))
        .on('finish', async () => {
            leaveChannel(serverId, false);
        })
        .on('error', error => {
            console.log(error);
        });
}