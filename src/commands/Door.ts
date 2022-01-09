import {Command} from "../tools/Command.js";
import HDClient from "../tools/HDClient.js";
import {Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashChoice, SlashOption} from "discordx";
import LoggerFactory from "../tools/LogStyles.js";
import {CommandInteraction} from "discord.js";

@Discord()
export default class DoorCMD extends Command{
    readonly alias: string[] = ["door"]
    readonly argDescription: string = ''
    readonly help: string = "Är chassit öppet?";
    readonly name: string = "Door";
    private log = new LoggerFactory(this.name)
    private hdClient = new HDClient('');

    @SimpleCommand('Door', {aliases: ['door']} )
    async resolve(command: SimpleCommandMessage, args: string[]) {
        this.hdClient.door.then(res => {
            console.log(res.message)
            command.message.reply(res.message);
        }, err => {
            this.log.error(err.message)
        })
    }

    @Slash('door', {description: "Är chassit öppet?"})
    async slashResolve(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
            self: string,
        command: CommandInteraction) {
        await command.deferReply({ephemeral: self === 'mig'})
        this.hdClient.door.then(res => {
            command.editReply(res.message)
        }, err => {
            this.log.error(err.message)
        })
    }
}
