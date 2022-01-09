import {Command} from "../tools/Command.js";
import {getQuoteMatch, getRandomQuote, submitQuote, submitScores} from "../tools/QuoteClient.js";
import LoggerFactory from "../tools/LogStyles.js";
import {
    ButtonComponent,
    ContextMenu,
    Discord,
    SimpleCommand,
    SimpleCommandMessage,
    Slash,
    SlashChoice,
    SlashOption
} from "discordx";
import {
    ButtonInteraction,
    CommandInteraction,
    ContextMenuInteraction, Message,
    MessageActionRow,
    MessageButton, MessageContextMenuInteraction,
    MessageEmbed
} from "discord.js";

@Discord()
export default class QuoteCMD extends Command{
    readonly alias: string[] = [];
    readonly argDescription: string = "";
    readonly help: string = "Hämta ett slumpat citat";
    readonly name: string = "Quote";
    private log = new LoggerFactory(this.name)
    private quotes = new Map<string, QuoteMatch>()
    private addQuotes = new Map<string, AddQouteCache>()

    @SimpleCommand('quote')
    async resolve(command: SimpleCommandMessage, args: string[]) {
        getRandomQuote(0).then(msg => {
            command.message.reply({embeds: [msg]});
        }, err => this.log.error(err.message))
    }

    @Slash('quote', {description: 'Få ett slumpmässigt citat från citat listan'})
    async slashResolve(
        @SlashChoice('migEndast', 'mig')
        @SlashOption('synlighet', {description: 'Lägg till "migEndast" för att ha meddelandet endast synligt till dig.', required: false})
            self: string,
        command: CommandInteraction) {
        await command.deferReply({ephemeral: self === 'mig'})

        getRandomQuote(0).then(msg => {
            command.editReply({embeds: [msg]});
        }, err => this.log.error(err.message))
    }

    @Slash('quotevote', {description: '(Endast /) Rösta mellan två citat från citatlistan.'})
    async startVote(command: CommandInteraction){
        await command.deferReply()
        let embed: MessageEmbed

        // Create the button, giving it the id: "hello-btn"
        const firstbtn = new MessageButton()
            .setLabel("Rösta första (0)")
            .setEmoji("1⃣")
            .setStyle("SECONDARY")
            .setCustomId("first-btn");

        const secondbtn = new MessageButton()
            .setLabel("Rösta andra (0)")
            .setEmoji("2⃣")
            .setStyle("SECONDARY")
            .setCustomId("second-btn");

        // Create a MessageActionRow and add the button to that row.
        const row = new MessageActionRow().addComponents(firstbtn).addComponents(secondbtn);

        setTimeout(() => {
            command.fetchReply().then(data => {
                const match = this.quotes.get(data.id)!
                const disRow = new MessageActionRow().addComponents(match.firstBtn.setDisabled(true)).addComponents(match.secondBtn.setDisabled(true))
                command.editReply({embeds: [embed], components: [disRow]})
                this.log.info("timeout")
                submitScores(match.firstQuoteID, match.secondQuoteID, match.firstCount.size, match.secondCount.size)
                    .then(() => this.quotes.delete(data.id), (e) => this.log.error(e.toString()))
            })
        }, 888000)

        getQuoteMatch().then(msg => {
            embed = new MessageEmbed()
            try {
                embed.addField('1⃣  ' + msg[0].quote, msg[0].context)
                    .addField('2⃣  ' + msg[1].quote, msg[1].context)
                    .setTimestamp(new Date().getTime() + 888000)
                    .setFooter({text: 'Röstningen stängs:'})
                    .setTitle('Vilket citat är bäst?')
            }catch (e: any) {
                this.log.error(e.message + '\n' + msg.toString())
                this.log.error(msg.toString())
                return
            }
            command.editReply({embeds: [embed], components: [row]});
            command.fetchReply().then(data => {
                this.quotes.set(data.id, {
                    firstBtn: firstbtn,
                    firstCount: new Set<string>(),
                    firstQuoteID: msg[0].id,
                    secondBtn: secondbtn,
                    secondCount: new Set<string>(),
                    secondQuoteID: msg[1].id,
                    embed: [embed]
                })
                this.log.info(data.id)
            })
        }, err => this.log.error(err.message))
    }

    @ButtonComponent('first-btn')
    async voteFirst(command: ButtonInteraction){
        this.log.info('voted first ' + command.message.id)
        if(!this.quotes.get(command.message.id)){
            return
        }
        const data = this.quotes.get(command.message.id)!
        data.firstCount.add(command.user.id)
        data.secondCount.delete(command.user.id)
        data.firstBtn.setLabel(`Rösta första (${data.firstCount.size})`)
        data.secondBtn.setLabel(`Rösta andra (${data.secondCount.size})`)
        command.update({
            embeds: data.embed,
            components: [new MessageActionRow().addComponents(data.firstBtn).addComponents(data.secondBtn)]
        }).then(() => this.quotes.set(command.message.id, data))
    }

    @ButtonComponent('second-btn')
    async voteSecond(command: ButtonInteraction){
        this.log.info('voted second ' + command.message.id)
        if(!this.quotes.get(command.message.id)){
            return
        }
        const data = this.quotes.get(command.message.id)!
        data.firstCount.delete(command.user.id)
        data.secondCount.add(command.user.id)
        data.firstBtn.setLabel(`Rösta första (${data.firstCount.size})`)
        data.secondBtn.setLabel(`Rösta andra (${data.secondCount.size})`)
        command.update({
            embeds: data.embed,
            components: [new MessageActionRow().addComponents(data.firstBtn).addComponents(data.secondBtn)]
        }).then(() => this.quotes.set(command.message.id, data))
    }

    @ContextMenu("MESSAGE", "Citera")
    async ctxMenuAddQuote(command: MessageContextMenuInteraction){
        const name = (command as any).targetMessage.member?.nickname ?? command.targetMessage.author.username
        const qoute = `"${command.targetMessage.content}" - ` + name
        const embed = new MessageEmbed()
            .addField(`"${command.targetMessage.content}"`, name)
            .setTitle("Förhandsgranska citat")
        const timeout = setTimeout(() => this.addQuotes.delete(command.user.id), 600000)
        this.addQuotes.set(command.user.id, {quote: qoute, timeout: timeout})
        const btn = new MessageButton().setLabel("Ta bort från buffern").setStyle("SECONDARY").setCustomId("remove-from-buffer")
        const row = new MessageActionRow().addComponents(btn)
        await command.reply({content: "För att lägga till citatet så är det bara att skriva `/addquote lösenord:[lösenord]`. Citatet tas bort från buffern efter 10 minuter.", embeds: [embed], components: [row], ephemeral: true})

    }

    @Slash('addquote', {description: '(Endast /) Lägg till citat till citatlistan från höger click buffern eller ett eget skrivet citat'})
    async addQuote(
        @SlashOption('lösenord', {type: "STRING"})
        password: string,
        @SlashOption('citat', {type: "STRING", required: false})
        quote: string | undefined,
        command: CommandInteraction
    ){
        await command.deferReply({ephemeral: true})

        if(password !== 'password'){
            await command.editReply({content: "Lösenordet var felaktig, försök igen"})
            return
        }

        let target: string
        if(quote){
            target = quote
        } else {
            const data = this.addQuotes.get(command.user.id)
            if(!data){
                await command.editReply({content: "Det fanns inget i bufferten, lägg till citat parametern eller höger klicka ett meddelande"})
                return
            }
            target = data.quote
            clearTimeout(data.timeout)
            this.addQuotes.delete(command.user.id)
        }


        submitQuote(target).then(async () => {
            const btn = new MessageButton().setLabel("Se uppladdade citat").setStyle("LINK").setURL("https://quote.ravenholdt.se/submit")
            const row = new MessageActionRow().addComponents(btn)
            await command.editReply({content: `Citatet \`${target}\` har nu skickats till citat listan`, components: [row]})
        }, e => {
            this.log.error(e.toString())
            command.editReply({content: "Något gick fel när citatet skickades"})
        })

    }

    @ButtonComponent('remove-from-buffer')
    async removeBufferedQuote(command: ButtonInteraction){
        this.addQuotes.delete(command.user.id)
        await command.update({content: "Citatet har tagits bort från buffern", components: []})
    }
}

interface QuoteMatch{
    embed: MessageEmbed[]
    firstBtn: MessageButton,
    secondBtn: MessageButton,
    firstQuoteID: string,
    secondQuoteID: string,
    firstCount: Set<string>,
    secondCount: Set<string>
}

interface AddQouteCache{
    quote: string,
    timeout: NodeJS.Timeout
}