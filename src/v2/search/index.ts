import { fork } from "child_process";
import path from "path";
import { VideoSearchResult } from "yt-search";
import { SoundcloudTrackV2 } from "soundcloud.ts";
import { MusicResult } from "../logic/queue";

const searchProcess = fork(path.join(__dirname, 'search-process'));

export const searchYT = async (query: string): Promise<MusicResult | undefined> => {
    return new Promise((resolve, reject) => {
        searchProcess
            .on('message', ({ type, data }: any) => {
                if (type === 'search-success') {
                    const { title, url, duration }: VideoSearchResult = data[0];
                    resolve({
                        name: title,
                        url: url,
                        seconds: duration.seconds
                    })
                }
                else if (type === 'search-error')
                    reject(data)
            })
            .send({ platform: "youtube", query })
    });
}

export const searchSC = async (query: string): Promise<MusicResult | undefined> => {
    return new Promise((resolve, reject) => {
        searchProcess
            .on('message', ({ type, data }: any) => {
                if (type === 'search-success') {
                    const { title, permalink_url, full_duration }: SoundcloudTrackV2 = data[0];
                    resolve({
                        name: title,
                        url: permalink_url,
                        seconds: full_duration,
                    })
                }
                else
                    reject(data)
            })
            .send({ platform: "soundcloud", query })
    })
}
