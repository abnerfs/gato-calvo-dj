import { MusicQueue, Music } from './queue';

const guildId = 'guild1';
const channelId = 'channel1';
const added_by = '1203312312312';

describe('BotQueue', () => {
  let botQueue: MusicQueue;

  beforeEach(() => {
    botQueue = new MusicQueue();
  });

  afterEach(() => {
    botQueue.state = {};
  });

  test('should enqueue and dequeue music correctly', () => {
    const music1: Music = { name: 'Song 1', url: 'youtube.com/song1', seconds: 180, added_by };
    const music2: Music = { name: 'Song 2', url: 'youtube.com/song2', seconds: 210, added_by };

    botQueue.add(guildId, channelId, music1);
    expect(botQueue.state[guildId]).toEqual({ channelId: channelId, musics: [music1] });
    botQueue.add(guildId, channelId, music2);
    expect(botQueue.state[guildId]).toEqual({ channelId: channelId, musics: [music1, music2] });

    expect(botQueue.isEmpty(guildId)).toBe(false);

    expect(botQueue.pop(guildId)).toEqual({ music: music1, channelId });
    expect(botQueue.state[guildId]).toEqual({ channelId: channelId, nowPlaying: music1, musics: [music2] });

    expect(botQueue.pop(guildId)).toEqual({ music: music2, channelId });
    expect(botQueue.state[guildId]).toEqual({ channelId: channelId, nowPlaying: music2, musics: [] });

    expect(botQueue.pop(guildId)).toBeUndefined();
    expect(botQueue.state[guildId]).toEqual({ channelId: channelId, nowPlaying: undefined, musics: [] });

    expect(botQueue.isEmpty(guildId)).toBe(true);
  });

  test('should return undefined if the queue is empty', () => {
    const emptyQueueResult = botQueue.pop(guildId);
    expect(emptyQueueResult).toBeUndefined();
  });

  test('should return queue considering music being currently played', () => {
    const music1: Music = { name: 'Song 1', url: 'youtube.com/song1', seconds: 180, added_by };
    const music2: Music = { name: 'Song 2', url: 'youtube.com/song2', seconds: 210, added_by };
    const music3: Music = { name: 'Song 3', url: 'youtube.com/song3', seconds: 210, added_by };

    botQueue.add(guildId, channelId, music1);
    botQueue.add(guildId, channelId, music2);
    botQueue.add(guildId, channelId, music3);

    expect(botQueue.state[guildId]).toEqual({ channelId: channelId, musics: [music1, music2, music3] });
    expect(botQueue.queue(guildId)).toEqual([music1, music2, music3]);

    expect(botQueue.pop(guildId)).toEqual({ music: music1, channelId });
    expect(botQueue.queue(guildId)).toEqual([music1, music2, music3]);

    expect(botQueue.pop(guildId)).toEqual({ music: music2, channelId });
    expect(botQueue.queue(guildId)).toEqual([music2, music3]);

    expect(botQueue.pop(guildId)).toEqual({ music: music3, channelId });
    expect(botQueue.queue(guildId)).toEqual([music3]);

    expect(botQueue.pop(guildId)).toBeUndefined();
    expect(botQueue.queue(guildId)).toEqual([]);
  });

  test('should return undefined if the queue is empty', () => {
    const emptyQueueResult = botQueue.pop(guildId);
    expect(emptyQueueResult).toBeUndefined();
  });

  test('should return an empty array if the queue is not present for a guildId', () => {
    const queue = botQueue.queue(guildId);
    expect(queue).toEqual([]);
  });
});
