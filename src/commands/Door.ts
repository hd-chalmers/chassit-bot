import {Command} from "../tools/Command.js";
import HDClient from "../tools/HDClient.js";
import {Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashChoice, SlashOption} from "discordx";
import LoggerFactory from "../tools/LogStyles.js";
import {CommandInteraction} from "discord.js";

/**
 * A class for responding to cmds regarding the chassit door
 */
@Discord()
export default class DoorCMD extends Command{
    readonly alias: string[] = ["door"]
    readonly argDescription: string = ''
    readonly help: string = "Är chassit öppet?";
    readonly name: string = "Door";
    private log = new LoggerFactory(this.name)
    private hdClient = new HDClient('');

    /**
     * A message command '!door' where the bot responds with door status and timestamp
     * @param command
     * @param args
     */
    @SimpleCommand('Door', {aliases: ['door']} )
    async resolve(command: SimpleCommandMessage, args: string[]) {
        this.hdClient.door.then(res => {
            command.message.reply(res.message);
        }, err => {
            this.log.error(err.message)
        })
    }

    /**
     * A slash command for getting the status and timestamp regarding chassit door
     * @param self an argument that decides if the message should be ephemeral
     * @param command the slash command interaction
     */
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
            command.editReply("Det gick inte att hämta statusen från APIn")
        })
    }
}
