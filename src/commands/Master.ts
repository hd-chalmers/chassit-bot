import {Command} from "../tools/Command.js";
import {Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashChoice, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";

@Discord()
export default class MasterCMD extends Command{
    readonly alias: string[] = ["master","whoisyourmaster?"]
    readonly argDescription: string = ""
    readonly help: string = "Vem är mästaren?"
    readonly name: string = "Master"

    @SimpleCommand('master', {aliases: ["whoisyourmaster?"]})
    async resolve(command: SimpleCommandMessage){
        await command.message.reply('My only masters are the almighty Sysads!... or those that actually do stuff.')
    }

    @Slash("whoisyourmaster", {description: 'Vem är mästaren?'})
    async slashResolve(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
            self: string,
        command: CommandInteraction){
        await command.reply({content: 'My only masters are the almighty Sysads!... or those that actually do stuff.', ephemeral: self === 'mig'})
    }
}