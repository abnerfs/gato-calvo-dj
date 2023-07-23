import { BotQueue, Music } from './queue';

describe('BotQueue', () => {
  let botQueue: BotQueue;

  beforeEach(() => {
    botQueue = new BotQueue();
  });

  afterEach(() => {
    botQueue.state = {};
  });

  test('should enqueue and dequeue music correctly', () => {
    const guildId = 'guild1';
    const channelId = 'channel1';
    const music1: Music = { name: 'Song 1', youtube_url: 'youtube.com/song1', seconds: 180 };
    const music2: Music = { name: 'Song 2', youtube_url: 'youtube.com/song2', seconds: 210 };

    botQueue.enqueueMusic(guildId, channelId, music1);
    botQueue.enqueueMusic(guildId, channelId, music2);

    expect(botQueue.isEmpty(guildId)).toBe(false);

    const dequeuedMusic1 = botQueue.popMusic(guildId);
    expect(dequeuedMusic1).toEqual({ music: music1, channelId });

    const dequeuedMusic2 = botQueue.popMusic(guildId);
    expect(dequeuedMusic2).toEqual({ music: music2, channelId });

    expect(botQueue.isEmpty(guildId)).toBe(true);
  });

  test('should return an empty object if the queue is empty', () => {
    const guildId = 'guild2';
    const emptyQueueResult = botQueue.popMusic(guildId);
    expect(emptyQueueResult).toEqual({});
  });

  test('should return an empty array if the queue is not present for a guildId', () => {
    const guildId = 'non_existent_guild';
    const queue = botQueue.queue(guildId);
    expect(queue).toEqual([]);
  });
});