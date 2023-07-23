require('dotenv/config');

const BOT_TOKEN: string = process.env.BOT_TOKEN!;
if (!BOT_TOKEN)
    throw new Error('Invalid BOT_TOKEN');

const BOT_CLIENT_ID: string = process.env.BOT_CLIENT_ID!;
if (!BOT_CLIENT_ID)
    throw new Error('Invalid BOT_CLIENT_ID');

export {
    BOT_TOKEN,
    BOT_CLIENT_ID
}
