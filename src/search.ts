import ytSearch from 'yt-search';

process.on('message', async (search) => {
    ytSearch(search, function (err: Error | string | null | undefined, r: ytSearch.SearchResult) {
        if (err)
            process.send!({ type: 'search-error', data: err })

        const firstResult = r?.videos[0];
        process.send!({ type: 'search-success', data: firstResult })
    })
})
