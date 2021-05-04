import { VoiceChannel, VoiceConnection } from "discord.js";
import { VideoSearchResult } from "yt-search";

type BotState = {
    playing: boolean;
    voiceChannel: VoiceChannel | undefined
    channelConnection: VoiceConnection | undefined;
    queue: VideoSearchResult[]
}

let botState: any = {

}


const initialSate: BotState = {
    playing: false,
    channelConnection: undefined,
    voiceChannel: undefined,
    queue: []
}

export const getState = (serverId: string): BotState => {
    return botState[serverId] || initialSate as BotState;
}

export const setState = (serverId: string, state: BotState) => {
    botState[serverId] = state;
}
