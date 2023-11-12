export type Music = {
    name: string;
    url: string;
    seconds: number;
}

type State = {
    [guildId: string]: {
        channelId: string,
        musics: Music[]
    }
}

export class BotQueue {
    state: State = {};

    constructor() {

    }

    isEmpty(guildId: string) {
        return !this.state[guildId] || this.state[guildId]!.musics.length == 0;
    }

    queue = (guild: string) => this.state[guild]?.musics || [];

    enqueueMusic(guildId: string, channelId: string, music: Music) {
        if (!this.state[guildId]) {
            this.state[guildId] = {
                channelId,
                musics: [music]
            }
        }
        else {
            this.state[guildId].channelId = channelId;
            this.state[guildId].musics.push(music);
        }
    }

    popMusic(guildId: string) {
        if (this.state[guildId]) {
            return {
                music: this.state[guildId].musics.shift(),
                channelId: this.state[guildId].channelId
            };
        }
        return {};
    }
}
