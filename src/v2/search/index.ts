import { fork } from "child_process";
import path from "path";
import { VideoSearchResult } from "yt-search";
import { SoundcloudTrackV2 } from "soundcloud.ts";

const searchProcess = fork(path.join(__dirname, 'search-process'));

export const searchYT = async (query: string): Promise<VideoSearchResult | undefined> => {
    return new Promise((resolve, reject) => {
        searchProcess
            .on('message', ({ type, data }: any) => {
                if (type === 'search-success')
                    resolve(data[0])
                else if (type === 'search-error')
                    reject(data)
            })
            .send({platform: "youtube", query})
    });
}

export const searchSC = async(query: string): Promise<SoundcloudTrackV2 | undefined> => {
    return new Promise((resolve, reject) => {
        searchProcess
            .on('message', ({type, data}: any) => {
                if (type === 'search-success')
                    resolve(data[0])
                
                reject(data)
            })
            .send({platform: "soundcloud", query})
    })
}
