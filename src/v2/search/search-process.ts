import ytSearch from 'yt-search';
import { SOUNDCLOUD_CLIENT } from '../config';

process.on('message', async ({platform, query}: {platform: string, query: string}) => {
    console.log({platform, query})
    let result = null;

    switch (platform) {
        case "youtube":
            result = await youtube(query);
            break;
        case "soundcloud":
            result = await soundcloud(query);
            break;
   }

   process.send!(result);
})

async function youtube(query: string) {
    return new Promise((resolve, reject) => {
        ytSearch(query, function (err: Error | string | null | undefined, r: ytSearch.SearchResult) {
            if (err)
                reject({ type: 'search-error', data: err })
    
            resolve({ type: 'search-success', data: r?.videos || [] })
        })
    })
}

async function soundcloud(query: string) {
    return SOUNDCLOUD_CLIENT.tracks.searchAlt(query)
        .then(tracks => 
            ({ type: 'search-success', data: tracks || [] }))
        .catch(err => 
            ({ type: 'search-error', data: err }))
}
