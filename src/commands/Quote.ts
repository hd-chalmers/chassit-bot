import Discord = require('discord.js');
import {Command} from "../tools/Command.js";
import {hdClient} from "../bot";
import {getRandomQuote} from "../tools/QuoteClient";

let cmd: Command = new Command("Quote", "", "Hämta ett slumpat citat", ["quote"], [], resolve);
export default cmd

export async function resolve(message: Discord.Message, args: string[]) {
    getRandomQuote(0).then(msg => {
        message.channel.send(msg);
    })
}