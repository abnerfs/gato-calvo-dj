# Gato Calvo DJ
Prove of concept discord bot to listen to music alongside your friends, made for learning purposes, feel free to use it anyway you like.

![_193bb449-216d-494f-ba62-a9463c93e589](https://github.com/abnerfs/bot-musica-poc/assets/14078661/8b19256c-018f-4b6a-bf60-c883fcd3d441)

# Commands
- **/play <query>** - Searchs for a music and play it, adds it to a queue if there is already a music playing in the server
- **/skip** - Skips the music being currently played
- **/queue** - Displays musics currently in the player's queue (including the one being played right now)

# How it works
It uses [youtubedl](https://github.com/ytdl-org/youtube-dl) under the hood so in theory any provider supported by youtubedl could be implemented

# TODO
- [ ] Music recommendation, when music ends if queue is empty play similar musics
- [ ] Be able to add entire playlists to the queue (from youtube)
- [ ] Add music by link
- [ ] Spotify integration (single tracks/playlists)
- [ ] Search for musics from soundcloud
