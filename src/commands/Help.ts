import Discord = require('discord.js');
import {Command} from "../tools/Command.js";
import {commands, prefix} from "../bot";
let cmd:Command = new Command("Help", "", "Shows this help message", ["help"], [], getHelp);
export default cmd

export async function getHelp(message: Discord.Message, args: string[]) {
    let msg: string = "<@" + message.author.id + ">\n";
    let handled: Map<string, Command> = new Map<string, Command>()
    msg += "The bots status will reflect the door status (Online=open, DND=closed)\n"
    msg += "The following commands are currently supported:\n";
    commands.forEach((command: Command) => {
        if (!handled.has(command.name) && command.name != cmd.name) {
            msg += "\t* " + command.help(prefix).trim() + "\n";
            handled.set(command.name, command)
        }
    });
    msg += "\t* " + cmd.help(prefix).trim() + "\n";
    handled.set(cmd.name, cmd)
    message.channel.send(msg).then(() => message.react('✅').catch((e) => console.log(e))).catch((e) => console.log(e))
}