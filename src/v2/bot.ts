import { CacheType, Client, Events, GatewayIntentBits, Guild, Interaction } from "discord.js";
import { BOT_TOKEN } from "./config";
import { commandDispatcher, setupCommands } from "./commands";
import { MusicQueue } from "./logic/queue";
import { Player } from "./player";

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
bot.once('ready', (_: Client) => {
    console.log(`Logged in as ${bot.user!.tag}`);
});

bot.on('guildCreate', async ({ id, name }: Guild) => {
    console.log(`Joined guild ${name}`);
    await setupCommands(id);
    console.log(`Commands set in ${name}`);
})

const queue = new MusicQueue();
const player = new Player(queue, bot);

bot.on(Events.InteractionCreate, (interaction: Interaction<CacheType>) => {
    try {
        if (!interaction.isChatInputCommand())
            return;

        commandDispatcher({ interaction, bot, queue, player });
    }
    catch (err) {
        console.log(err);
    }
});

bot.login(BOT_TOKEN);
