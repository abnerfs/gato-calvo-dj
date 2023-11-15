require('dotenv/config');
import Soundcloud from 'soundcloud.ts';

const BOT_TOKEN: string = process.env.BOT_TOKEN!;
if (!BOT_TOKEN)
    throw new Error('Invalid BOT_TOKEN');

const BOT_CLIENT_ID: string = process.env.BOT_CLIENT_ID!;
if (!BOT_CLIENT_ID)
    throw new Error('Invalid BOT_CLIENT_ID');

const SOUNDCLOUD_CLIENT = new Soundcloud();

export {
    BOT_TOKEN,
    BOT_CLIENT_ID,
    SOUNDCLOUD_CLIENT
}
