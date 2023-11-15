export type MusicResult = {
    name: string;
    url: string;
    seconds: number;
}

export type Music = MusicResult & {
    added_by: string
}

type State = {
    [guildId: string]: {
        channelId: string,
        nowPlaying?: Music,
        musics: Music[]
    }
}

export class MusicQueue {
    state: State = {};

    constructor() {

    }

    isEmpty(guildId: string) {
        return !this.state[guildId] || this.state[guildId]!.musics.length == 0;
    }

    queue = (guild: string): Music[] => {
        const state = this.state[guild];
        if (!state)
            return [];

        if (state.nowPlaying)
            return [state.nowPlaying, ...state.musics]

        return state.musics;
    }

    add(guildId: string, channelId: string, music: Music) {
        if (!this.state[guildId])
            this.state[guildId] = {
                channelId,
                musics: []
            }

        let state = { ...this.state[guildId] };
        state.channelId = channelId;
        state.musics.push(music);
        Object.assign(this.state[guildId], state);
    }

    pop(guildId: string): { music: Music, channelId: string } | undefined {
        if (!this.state[guildId])
            return;

        const state = this.state[guildId];
        const music = state.musics[0];
        Object.assign(state, {
            nowPlaying: music,
            musics: state.musics.slice(1)
        });

        if (!music)
            return;

        return {
            music: music,
            channelId: state.channelId
        };
    }
}
