import { Client, VoiceBasedChannel } from "discord.js";
import { BotQueue } from "./logic/queue";
import { AudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "ytdl-core";


export class Player {
    players: { [guildId: string]: AudioPlayer | undefined } = {}

    constructor(private queue: BotQueue, private bot: Client) {

    }

    private destroyPlayer(guildId: string) {
        if(this.players[guildId]) {
            this.players[guildId]!.stop();
        }
    }

    private destroyConnection(guildId: string) {
        const voiceConnection = getVoiceConnection(guildId);
        if (voiceConnection) {
            voiceConnection.destroy();
        }
    }

    private initializePlayer(guildId: string) {
        if (!this.players[guildId]) {
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Stop,
                },
            });

            player.on(AudioPlayerStatus.Idle, () => {
                if (!this.queue.isEmpty(guildId)) {
                    this.playMusic(guildId);
                }
                else {
                    this.destroyPlayer(guildId);
                    this.destroyConnection(guildId);
                }
            });

            this.players[guildId] = player;
        }
        return this.players[guildId]!;
    }

    skip(guildId: string) {
        this.destroyPlayer(guildId);
    }

    playMusic(guildId: string) {
        if (this.initializePlayer(guildId).state.status != AudioPlayerStatus.Idle)
            return;

        const { channelId, music } = this.queue.popMusic(guildId);
        if (!channelId || !music)
            return;

        const resource = createAudioResource(ytdl(music.youtube_url, { filter: 'audioonly', highWaterMark: 1 << 25 }));
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
                const player = this.initializePlayer(guildId);
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
