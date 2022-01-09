import { CommandInteraction, MessageEmbed } from "discord.js";
import {Discord, MetadataStorage, SimpleCommand, SimpleCommandMessage, Slash, SlashChoice, SlashOption} from "discordx";
import { Pagination } from "@discordx/pagination";

@Discord()
export abstract class HelpCMD {
  // example: pagination for all slash command
  @Slash("help", { description: "Få en beskrivning om alla kommandon" })
  async pages(
      @SlashChoice('alla', 'alla')
      @SlashOption('synlighet', {description: 'Lägg till "alla" för att ha meddelandet synligt till alla.', required: false})
          all: string,
      interaction: CommandInteraction
  ): Promise<void> {
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { name: cmd.name, description: cmd.description };
    });

    const pages: MessageEmbed[] = []

    const summary = new MessageEmbed().setFooter({text: 'Page 1 of ' + (commands.length + 1)}).setTitle('Alla kommandon').setDescription('De mesta kommandon kan också skrivas med `!`')
    commands.map((cmd) => {
      summary.addField('/'+cmd.name, cmd.description)
    })

    pages.push(summary)

    pages.push(...commands.map((cmd, i) => {
      return new MessageEmbed()
        .setFooter({ text: `Page ${i + 2} of ${commands.length + 1}` })
        .setTitle("**Slash kommando info**")
        .addField("Namn", cmd.name)
        .addField("Beskrivning", cmd.description);
    }));

    const pagination = new Pagination(interaction, pages, {ephemeral: all !== 'alla', type: "BUTTON"});
    await pagination.send();
  }

  @SimpleCommand('help', {aliases: ['commands', 'all-commands', 'kommandon', 'hjälp']})
  async helpList(command: SimpleCommandMessage){
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { name: cmd.name, description: cmd.description };
    });

    const summary = new MessageEmbed().setTitle('Alla kommandon').setDescription('Alla kommandon kan också skrivas med `' + process.env.COMMAND_PREFIX ?? "!" + '`')
    commands.map((cmd) => {
      summary.addField('/'+cmd.name, cmd.description)
    })
    await command.message.reply({embeds: [summary]})
  }
}
