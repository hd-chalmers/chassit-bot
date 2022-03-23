import {Command} from "../tools/Command.js";
import LoggerFactory from "../tools/LogStyles.js";
import {
    ArgsOf,
    Client,
    Discord,
    Guard,
    On,
    SimpleCommand,
    SimpleCommandMessage,
    Slash,
    SlashChoice,
    SlashGroup, SlashOption
} from "discordx";
import {CommandInteraction, Message, MessageEmbed} from "discord.js";
import * as fs from "fs";

/**
 * A class for handling commands and events regarding the 'bättre förr' counter
 */
@Discord()
@SlashGroup("battreforr", "Ju längre förr ju bättre är det. Få statistik eller öka bättre förr räkningen.")
export default class BattreForrCMD extends Command{
    readonly alias: string[] = [];
    readonly argDescription: string = "";
    readonly help: string = "";
    readonly name: string = "Bättre Förr";
    private log = new LoggerFactory(this.name)

    /**
     * A message listener that checks each message if it contains 'bättre förr' and increments the counter
     * @param message the message to be checked
     * @param client the bot client
     */
    @On("messageCreate", {})
    async addCount([message]: [Message], client: Client){

        if(!message.author.bot && message.content.toLocaleLowerCase().includes("bättre förr")){
            await this.incrementInFile()

            await message.react('❗')
        }
    }

    /**
     * A slash command for showing the bättre förr stats
     * @param self an argument deciding if the message should be ephemeral
     * @param command the slash command interaction
     */
    @Slash('stats', {description: 'Få statistik om hur många gånger bättre förr har sagts'})
    async statsCMD(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {type: 'STRING', description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
            self: string,
        command: CommandInteraction
    ){
        await command.deferReply({ephemeral: self === 'mig'})

        const json = await this.readFile()

            const embed = new MessageEmbed()
                .setTitle("Bättre Förr statistik")
                .addField("Antal gånger", json.allTime.toString())
                .addField("Antal gånger denna månaden", json.thisMonth.toString())
                .setTimestamp(new Date())
            await command.editReply({embeds: [embed]})
    }

    /**
     * A message command as '!battreforr' for showing a statistics embed
     * @param command the message with the command
     */
    @SimpleCommand('battreforr', {aliases: ['bättreförr', 'bättreFörr', 'BättreFörr']})
    async statsTxt(command: SimpleCommandMessage){
            const json = await this.readFile()

            const embed = new MessageEmbed()
                .setTitle("Bättre Förr statistik")
                .addField("Antal gånger", json.allTime.toString())
                .addField("Antal gånger denna månaden", json.thisMonth.toString())
                .setTimestamp(new Date())
            await command.message.reply({embeds: [embed]})
    }


    /**
     * A command for anonymously pinging the 'sittande' role and incrementing the counter
     * @param command the command interaction
     */
    @Slash('ping', {description: "Skicka `Bättre förr` till sittande"})
    async pingCMD(command: CommandInteraction) {
        await command.reply({content: "Pingar sittande...", ephemeral: true})

        await this.incrementInFile()

        await command.followUp({content: "<@&402465299414253568> Bättre Förr!", ephemeral: false})
    }

    /**
     * A slash command for simply incrementing the counter
     * @param self an argument that decides if the message should be ephemeral
     * @param command the slash command interaction
     */
    @Slash('inkrementera', {description: 'Öka bättre förr räknaren'})
    async increment(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {type: 'STRING', description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
        self: string,
        command: CommandInteraction
    ){
        await command.deferReply({ephemeral: self === 'mig'})

        let json = await this.incrementInFile()

        await command.editReply({content: `Bättre förr! (${json.thisMonth} gånger denna månaden)`})
    }

    /**
     * A helper method for reading the data/BattreForrCount.json and parsing it into an object
     * @return BFCount A promise when resolved returns an object containing all-time count, month counr and timestamp
     * @private
     */
    private async readFile(): Promise<BFCount>{
        return new Promise<BFCount>((resolve, reject) => {
            fs.readFile("./data/BattreForrCount.json", "utf-8", async (err, data) => {
                if (err){
                    reject(err)
                    return
                }

                let json: BFCount
                if(data){
                    json = JSON.parse(data)
                    // if there's a new month then reset the monthly counter
                    if(new Date(json.timestamp).getMonth() !== new Date().getMonth()){
                        json.thisMonth = 0
                        json.timestamp = new Date().toISOString()
                    }
                    // create a new object if the file is missing
                } else {
                    json = {
                        allTime: 0,
                        thisMonth: 0,
                        timestamp: new Date().toISOString()
                    }
                }
                resolve(json)
            })
        })
    }

    /**
     * A method that reads the json file, increments the values and writes to the json file
     * @param amount an optional parameter for the amount that should be added to the counters, defaults to 1
     * @private
     * @return BFCount returns a promise that contains a BFCount object, it rejects when the write fails
     * @see readFile
     */
    private async incrementInFile(amount?: number): Promise<BFCount>{
        const json = await this.readFile()

        json.allTime += amount ?? 1
        json.thisMonth += amount ?? 1

        return new Promise((resolve, reject) => {
            fs.writeFile("./data/BattreForrCount.json", JSON.stringify(json), {encoding: "utf-8"}, (err) => {
                if(err){
                    this.log.error(err.message)
                    reject(err)
                } else {
                    resolve(json)
                }
            })
        })
    }
}

/**
 * An object of counters and a timestamp
 */
interface BFCount{
    allTime: number,
    thisMonth: number,
    timestamp: string
}