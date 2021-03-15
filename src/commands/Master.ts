import Discord = require('discord.js');
import {Command} from "../tools/Command.js";
let cmd:Command = new Command("Master", "", "Är chassit öppet?", ["master","whoisyourmaster?"], [], resolve);
export default cmd

export async function resolve(message: Discord.Message, args: string[]) {
    message.channel.send("<@" + message.author.id + "> My only masters are the almighty Sysads!")
}