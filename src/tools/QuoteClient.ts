import axios from "axios";
import {MessageEmbed} from "discord.js";

export async function getRandomQuote(threshHold: number): Promise<MessageEmbed> {
    let ret: MessageEmbed = new MessageEmbed();
    let url: string = "https://quote.ravenholdt.se/api/random.php"
    let promise: Promise<MessageEmbed>;
    await axios.get(url).then(res => {
        promise = new Promise((resolve) => {
            ret.addField(res.data.quote, res.data.context)
            ret.setFooter("Rating: " + res.data.rating);
            resolve(ret);
        });
    });
    return ret;
}