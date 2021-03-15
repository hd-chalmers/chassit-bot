import Discord = require('discord.js');
import {Command} from "./tools/Command";
import * as fs from "fs";
import HDClient from "./tools/HDClient";

const client = new Discord.Client();
export let prefix = process.env.COMMAND_PREFIX ? process.env.COMMAND_PREFIX : "!";
export let commands: Map<string, Command> = new Map();
export let hdClient = new HDClient(process.env.API_TOKEN ? process.env.API_TOKEN : "");

process.chdir(__dirname);
client.login(process.env.DISCORD_TOKEN);
loadCommands();

function loadCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command: Command = require(`./commands/${file}`).default;
        command.aliases.forEach((alias: string) => {
            commands.set(alias, command);
        })
        console.log("Imported function " + command.name);
    }
}


client.once('ready', () => {
    console.log('Ready!');
    setInterval(() => {
        hdClient.door.then(res => {
            if (res.status) {
                client.user.setPresence({
                    afk: false,
                    status: "online",
                    activity: {
                        name: prefix+"help",
                        type: "PLAYING",
                        url: "Https://hd.chalmers.se"
                    }
                }).catch(e=> {
                    console.log(e)
                })
            } else {
                client.user.setPresence({
                    afk: true,
                    status: "dnd",
                    activity: {
                        name: prefix+"help",
                        type: "PLAYING",
                        url: "Https://hd.chalmers.se",
                    }
                }).catch(e=> {
                    console.log(e)
                })
            }
        })
    }, 5000)
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }
    let parts: string[] = message.content.substring(prefix.length).trim().split(/ +/);
    let commandName: string = parts[0];
    let args: string[] = parts.slice(1);

    if (!commands.has(commandName)) {
        message.channel.send("<@" + message.author.id + "> I'm sorry, but i dont understand what you mean with \"" + message.content + "\"").then(() => message.react('🤔').catch((e) => console.log(e))).catch((e) => console.log(e))
        return;
    }

    let command: Command = commands.get(commandName);

    if (!command.matches(args.join(" "))) {
        message.channel.send("<@" + message.author.id + "> Invalid command format, see below for the correct format\n " + command.help(prefix)).then(() => message.react('🤔').catch((e) => console.log(e))).catch((e) => console.log(e))
        return;
    }
    command.exec(message, args).catch((e) => console.log(e));
});