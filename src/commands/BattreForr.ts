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

@Discord()
@SlashGroup("battreforr", "Ju längre förr ju bättre är det. Få statistik eller öka bättre förr räkningen.")
export default class BattreForrCMD extends Command{
    readonly alias: string[] = [];
    readonly argDescription: string = "";
    readonly help: string = "";
    readonly name: string = "Bättre Förr";
    private log = new LoggerFactory(this.name)

    @On("messageCreate", {})
    async addCount([message]: [Message], client: Client){
        if(!message.author.bot && message.content.toLocaleLowerCase().includes("bättre förr")){
            fs.readFile("./data/BattreForrCount.json", "utf-8", async (err, data) => {
                let json: BFCount
                if(data){
                    json = JSON.parse(data)
                    if(new Date(json.timestamp).getMonth() !== new Date().getMonth()){
                        json.thisMonth = 0
                        json.timestamp = new Date().toISOString()
                    }
                } else {
                    json = {
                        allTime: 0,
                        thisMonth: 0,
                        timestamp: new Date().toISOString()
                    }
                }

                json.allTime += 1
                json.thisMonth += 1

                await message.reply({content: `Bättre förr! (${json.thisMonth} gången denna månaden)`, allowedMentions: {repliedUser: false}})

                fs.writeFile("./data/BattreForrCount.json", JSON.stringify(json), {encoding: "utf-8"}, (err) => {
                    if(err){
                        this.log.error(err.message)
                    }
                })
            })

        }
    }

    @Slash('stats', {description: 'Få statistik om hur många gånger bättre förr har sagts'})
    async statsCMD(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {type: 'STRING', description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
            self: string,
        command: CommandInteraction
    ){
        await command.deferReply({ephemeral: self === 'mig'})

        fs.readFile("./data/BattreForrCount.json", "utf-8", async (err, data) => {
            let json: BFCount
            if (data) {
                json = JSON.parse(data)
                if (new Date(json.timestamp).getMonth() !== new Date().getMonth()) {
                    json.thisMonth = 0
                    json.timestamp = new Date().toISOString()

                    fs.writeFile("./data/BattreForrCount.json", JSON.stringify(json), {encoding: "utf-8"}, (err) => {
                        if(err){
                            this.log.error(err.message)
                        }
                    })
                }
            } else {
                json = {
                    allTime: 0,
                    thisMonth: 0,
                    timestamp: new Date().toISOString()
                }
            }

            const embed = new MessageEmbed()
                .setTitle("Bättre Förr statistik")
                .addField("Antal gånger", json.allTime.toString())
                .addField("Antal gånger denna månaden", json.thisMonth.toString())
                .setTimestamp(new Date())
            await command.editReply({embeds: [embed]})
        })
    }

    @SimpleCommand('battreforr', {aliases: ['bättreförr', 'bättreFörr', 'BättreFörr']})
    async statsTxt(command: SimpleCommandMessage){

        fs.readFile("./data/BattreForrCount.json", "utf-8", async (err, data) => {
            let json: BFCount
            if (data) {
                json = JSON.parse(data)
                if (new Date(json.timestamp).getMonth() !== new Date().getMonth()) {
                    json.thisMonth = 0
                    json.timestamp = new Date().toISOString()

                    fs.writeFile("./data/BattreForrCount.json", JSON.stringify(json), {encoding: "utf-8"}, (err) => {
                        if(err){
                            this.log.error(err.message)
                        }
                    })
                }
            } else {
                json = {
                    allTime: 0,
                    thisMonth: 0,
                    timestamp: new Date().toISOString()
                }
            }

            const embed = new MessageEmbed()
                .setTitle("Bättre Förr statistik")
                .addField("Antal gånger", json.allTime.toString())
                .addField("Antal gånger denna månaden", json.thisMonth.toString())
                .setTimestamp(new Date())
            await command.message.reply({embeds: [embed]})
        })
    }



    @Slash('ping', {description: "Skicka `Bättre förr` till sittande"})
    async pingCMD(command: CommandInteraction) {
        await command.reply({content: "Pingar sittande...", ephemeral: true})

        fs.readFile("./data/BattreForrCount.json", "utf-8", async (err, data) => {
            let json: BFCount
            if (data) {
                json = JSON.parse(data)
                if (new Date(json.timestamp).getMonth() !== new Date().getMonth()) {
                    json.thisMonth = 0
                    json.timestamp = new Date().toISOString()
                }
            } else {
                json = {
                    allTime: 0,
                    thisMonth: 0,
                    timestamp: new Date().toISOString()
                }
            }

            json.allTime += 1
            json.thisMonth += 1

            fs.writeFile("./data/BattreForrCount.json", JSON.stringify(json), {encoding: "utf-8"}, (err) => {
                if(err){
                    this.log.error(err.message)
                }
            })
        })

        await command.followUp({content: "<@&402465299414253568> Bättre Förr!", ephemeral: false})
    }

    @Slash('inkrementera', {description: 'Öka bättre förr räknaren'})
    async increment(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {type: 'STRING', description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
        self: string,
        command: CommandInteraction
    ){
        fs.readFile("./data/BattreForrCount.json", "utf-8", async (err, data) => {
            let json: BFCount
            if(data){
                json = JSON.parse(data)
                if(new Date(json.timestamp).getMonth() !== new Date().getMonth()){
                    json.thisMonth = 0
                    json.timestamp = new Date().toISOString()
                }
            } else {
                json = {
                    allTime: 0,
                    thisMonth: 0,
                    timestamp: new Date().toISOString()
                }
            }

            json.allTime += 1
            json.thisMonth += 1

            await command.reply({content: `Bättre förr! (${json.thisMonth} gången denna månaden)`, ephemeral: self === 'mig'})

            fs.writeFile("./data/BattreForrCount.json", JSON.stringify(json), {encoding: "utf-8"}, (err) => {
                if(err){
                    this.log.error(err.message)
                }
            })
        })
    }
}

interface BFCount{
    allTime: number,
    thisMonth: number,
    timestamp: string
}