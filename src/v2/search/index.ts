import { fork } from "child_process";
import path from "path";
import ytSearch from "yt-search";

const searchProcess = fork(path.join(__dirname, 'search-process'));

export const searchYT = async (search: string): Promise<ytSearch.VideoSearchResult | undefined> => {
    return new Promise((resolve, reject) => {
        searchProcess
            .on('message', ({ type, data }: any) => {
                if (type === 'search-success')
                    resolve(data[0])
                else if (type === 'search-error')
                    reject(data)
            })
            .send(search)
    });
}
