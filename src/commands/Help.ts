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
      return { name: cmd.name, description: cmd.description, type: cmd.type };
    });

    const pages: MessageEmbed[] = []

    const summary = new MessageEmbed().setFooter({text: 'Page 1 of ' + (commands.length + 1)}).setTitle('Alla kommandon').setDescription('De mesta kommandon kan också skrivas med  **' + (process.env.COMMAND_PREFIX ?? "!") + '**')
    commands.map((cmd) => {
      summary.addField((cmd.type === "CHAT_INPUT" ? '/' : '') + cmd.name, (cmd.type === "CHAT_INPUT" ? cmd.description: 'Höger klicka ett meddelande eller en användare och kolla under "Apps" för att nå kommandot'))
    })

    pages.push(summary)

    pages.push(...commands.map((cmd, i) => {
      return new MessageEmbed()
        .setFooter({ text: `Sida ${i + 2} av ${commands.length + 1}` })
        .setTitle("**Slash kommando info**")
        .addField("Namn", cmd.name)
        .addField("Beskrivning", (cmd.type === "CHAT_INPUT" ? cmd.description: 'Höger klicka ett meddelande eller en användare och kolla under "Apps" för att nå kommandot'));
    }));

    const pagination = new Pagination(interaction, pages, {ephemeral: all !== 'alla', type: "BUTTON"});
    await pagination.send();
  }

  @SimpleCommand('help', {aliases: ['commands', 'all-commands', 'kommandon', 'hjälp']})
  async helpList(command: SimpleCommandMessage){
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { name: cmd.name, description: cmd.description, type: cmd.type };
    });

    const summary = new MessageEmbed().setTitle('Alla kommandon').setDescription('De mesta kommandon kan också skrivas med **' + (process.env.COMMAND_PREFIX ?? "!") + '**')
    commands.map((cmd) => {
      summary.addField((cmd.type === "CHAT_INPUT" ? '/' : '') + cmd.name, (cmd.type === "CHAT_INPUT" ? cmd.description: 'Höger klicka ett meddelande eller en användare och kolla under "Apps" för att nå kommandot'))
    })
    await command.message.reply({embeds: [summary]})
  }
}
