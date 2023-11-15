import { Client, VoiceBasedChannel } from "discord.js";
import { MusicQueue } from "./logic/queue";
import { AudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";


export class Player {
    players: { [guildId: string]: AudioPlayer | undefined } = {}

    constructor(private queue: MusicQueue, private bot: Client) {

    }

    private destroy(guildId: string) {
        if (this.players[guildId]) {
            this.players[guildId]!.stop();
        }
        const voiceConnection = getVoiceConnection(guildId);
        if (voiceConnection) {
            voiceConnection.destroy();
        }
    }

    private playerIdleHandler =
        (guildId: string) =>
            () => {
                if (!this.queue.isEmpty(guildId)) {
                    this.playMusic(guildId);
                }
                else {
                    this.destroy(guildId);
                }
            }

    private getExistingOrNewPlayer(guildId: string) {
        if (this.players[guildId])
            return this.players[guildId]!;

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop,
            },
        });

        player.on(AudioPlayerStatus.Idle, this.playerIdleHandler(guildId));
        this.players[guildId] = player;
        return player;
    }

    skip(guildId: string) {
        this.destroy(guildId);
    }

    playMusic(guildId: string) {
        if (this.getExistingOrNewPlayer(guildId).state.status != AudioPlayerStatus.Idle)
            return;

        const popResult = this.queue.pop(guildId);
        if (!popResult)
            return;

        const { channelId, music } = popResult;

        const song = ytdl(music.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
        const resource = createAudioResource(song);
        
        const rawChannel = this.bot.guilds.cache.get(guildId)!.channels.cache.get(channelId)!;

        if (rawChannel.isVoiceBased()) {
            const channel: VoiceBasedChannel = rawChannel;
            const connection = joinVoiceChannel({
                channelId: channelId,
                guildId: guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfMute: false
            });

            const readyCallBack = () => {
                const player = this.getExistingOrNewPlayer(guildId);
                connection.subscribe(player);
                player.play(resource);
            }

            if (connection.state.status == VoiceConnectionStatus.Ready)
                readyCallBack();
            else {
                connection.once(VoiceConnectionStatus.Ready, readyCallBack);
            }
        }
        return true;
    }
}
