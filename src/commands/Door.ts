import Discord = require('discord.js');
import {Command} from "../tools/Command.js";
import {hdClient} from "../bot";
let cmd:Command = new Command("Door", "", "Är chassit öppet?", ["door"], [], resolve);
export default cmd

export async function resolve(message: Discord.Message, args: string[]) {
    hdClient.door.then(res => {
        message.channel.send("<@" + message.author.id + "> "+res.message);
    })
}