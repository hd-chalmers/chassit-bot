import {CommandInteraction, MessageEmbed} from "discord.js";
import {Discord, MetadataStorage, SimpleCommand, SimpleCommandMessage, Slash, SlashChoice, SlashOption} from "discordx";
import {Pagination, PaginationType} from "@discordx/pagination";

/**
 * A class for handling all the help commands
 */
@Discord()
export abstract class HelpCMD {

  /**
   * A slash command for obtaining a list of commands and pagination for individual commands
   * @param all an argument to determine if the message shouldn't be ephemeral
   * @param interaction the slash command interaction
   */
  @Slash("help", { description: "Få en beskrivning om alla kommandon" })
  async pages(
      @SlashChoice('alla')
      @SlashOption('synlighet', {description: 'Lägg till "alla" för att ha meddelandet synligt till alla.', required: false})
          all: string,
      interaction: CommandInteraction
  ): Promise<void> {

    // get the slash commands
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { name: cmd.name, description: cmd.description, type: cmd.type };
    });

    const pages: MessageEmbed[] = []

    // create the summary embed
    const summary = new MessageEmbed().setFooter({text: 'Page 1 of ' + (commands.length + 1)}).setTitle('Alla kommandon').setDescription('De mesta kommandon kan också skrivas med  **' + (process.env.COMMAND_PREFIX ?? "!") + '**')
    commands.map((cmd) => {
      summary.addField((cmd.type === "CHAT_INPUT" ? '/' : '') + cmd.name, (cmd.type === "CHAT_INPUT" ? cmd.description: 'Höger klicka ett meddelande eller en användare och kolla under "Apps" för att nå kommandot'))
    })

    pages.push(summary)

    // create an embed for each command
    pages.push(...commands.map((cmd, i) => {
      return new MessageEmbed()
        .setFooter({ text: `Sida ${i + 2} av ${commands.length + 1}` })
        .setTitle("**Slash kommando info**")
        .addField("Namn", cmd.name)
        .addField("Beskrivning", (cmd.type === "CHAT_INPUT" ? cmd.description: 'Höger klicka ett meddelande eller en användare och kolla under "Apps" för att nå kommandot'));
    }));

    const pagination = new Pagination(interaction, pages, {type: PaginationType.Button, ephemeral: all !== 'alla'});
    await pagination.send();
  }

  /**
   * A message command where !help is sent to get a command list
   * @param command the message with the command
   */
  @SimpleCommand('help', {aliases: ['commands', 'all-commands', 'kommandon', 'hjälp']})
  async helpList(command: SimpleCommandMessage){

    // get the slash commands
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { name: cmd.name, description: cmd.description, type: cmd.type };
    });

    // create the embed
    const summary = new MessageEmbed().setTitle('Alla kommandon').setDescription('De mesta kommandon kan också skrivas med **' + (process.env.COMMAND_PREFIX ?? "!") + '**')
    commands.map((cmd) => {
      summary.addField((cmd.type === "CHAT_INPUT" ? '/' : '') + cmd.name, (cmd.type === "CHAT_INPUT" ? cmd.description: 'Höger klicka ett meddelande eller en användare och kolla under "Apps" för att nå kommandot'))
    })

    await command.message.reply({embeds: [summary]})
  }
}
