import "reflect-metadata";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import dotenv from 'dotenv'
import LoggerFactory from "./tools/LogStyles.js";
import HDClient from "./tools/HDClient.js";

const log = new LoggerFactory('Bot')

// load envioroment variables from .env file
dotenv.config()

const client = new Client({
  simpleCommand: {
    prefix: process.env.COMMAND_PREFIX ?? "!",
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use global commands only, comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

client.once("ready", async () => {
  // make sure all guilds are in cache
  await client.guilds.fetch();

  // init all application commands
  await client.initApplicationCommands({
    guild: { log: true },
    global: { log: true },
  });

  // init permissions; enabled log to see changes
  await client.initApplicationPermissions(true);

  // uncomment this line to clear all guild commands,
  // useful when moving to global commands from guild commands
  /*  await client.clearApplicationCommands(
     ...client.guilds.cache.map((g) => g.id)
    );*/

  const hdClient = new HDClient('')
  setInterval(() => {
    if(client.user) {
      hdClient.door.then(res => {
            if (res.status) {
              client.user!.setPresence({
                afk: false,
                status: "online",
                activities: [{
                  name: "/help",
                  type: "PLAYING",
                  url: "https://hd.chalmers.se"
                }]
              })
            } else if (res.status === false) {
              client.user!.setPresence({
                afk: true,
                status: "dnd",
                activities: [{
                  name: "/help",
                  type: "PLAYING",
                  url: "https://hd.chalmers.se",
                }]
              })
            } else {
              client.user!.setPresence({
                afk: true,
                status: "idle",
                activities: [{
                  name:  "/help",
                  type: "PLAYING",
                  url: "https://hd.chalmers.se",
                }]
              })
            }
          },
          err => client.user!.setPresence({
            afk: true,
            status: "idle",
            activities: [{
              name: "/help",
              type: "PLAYING",
              url: "https://hd.chalmers.se",
            }]
          }))
    }
  }, 5000)

  log.success("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message).catch(e => log.error(e.message))
});

async function run() {
  // with cjs
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");
  // with ems
  await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");
  client.login(process.env.BOT_TOKEN ?? ""); // provide your bot token
}

run();
