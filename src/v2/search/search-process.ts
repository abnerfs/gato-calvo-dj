import ytSearch from 'yt-search';
import { SOUNDCLOUD_CLIENT } from '../config';

process.on('message', async ({platform, query}: {platform: string, query: string}) => {
    let result = null;

    switch (platform) {
        case "youtube":
            result = youtube(query);
            break;
        case "soundcloud":
            result = await soundcloud(query);
            break;
   }

   process.send!(result);
})

function youtube(query: string) {
    ytSearch(query, function (err: Error | string | null | undefined, r: ytSearch.SearchResult) {
        if (err)
            return { type: 'search-error', data: err }

        return { type: 'search-success', data: r?.videos || [] }
    })
}

async function soundcloud(query: string) {
    return SOUNDCLOUD_CLIENT.tracks.searchAlt(query)
        .then(tracks => 
            ({ type: 'search-success', data: tracks || [] }))
        .catch(err => 
            ({ type: 'search-error', data: err }))
}
