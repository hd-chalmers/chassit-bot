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
    Message,
    MessageActionRow,
    MessageButton, MessageContextMenuInteraction,
    MessageEmbed
} from "discord.js";

/**
 * A class containing commands related to quotes on quote.ravenholdt.se
 */
@Discord()
export default class QuoteCMD extends Command{
    readonly alias: string[] = [];
    readonly argDescription: string = "";
    readonly help: string = "Hämta ett slumpat citat";
    readonly name: string = "Quote";
    private log = new LoggerFactory(this.name)
    /** A hashmap for storing each quote message */
    private quotes = new Map<string, QuoteMatch>()
    /** A hashmap for storing quote candidates from the context menu */
    private addQuotes = new Map<string, AddQouteCache>()

    /**
     * A command accessed with !quote is sued to send a single random quote from the list
     * @param command the message containing the command
     * @param args the arguments after !quote
     */
    @SimpleCommand('quote')
    async resolve(command: SimpleCommandMessage, args: string[]) {
        getRandomQuote(0).then(msg => {
            command.message.reply({embeds: [msg]});
        }, err => this.log.error(err.message))
    }

    /**
     * A slash command with the name quote is used for getting a single quote from the list
     * @param self a parameter for checking if the reply should be ephemeral
     * @param command the slash command request
     */
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

    /**
     * A slash command name quotevote which gets a pari of quotes from the list and then lets the users vote with button clicks
     * @param command
     */
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

        getQuoteMatch().then(qts => {
            embed = new MessageEmbed()
            try {
                embed.addField('1⃣  ' + (qts[0].quote ?? "Empty quote :("), (qts[0].context ?? "Empty context :("))
                    .addField('2⃣  ' + (qts[1].quote ?? "Empty quote :("), (qts[1].context ?? "Empty context :("))
                    .setTimestamp(new Date().getTime() + 2100000)
                    .setFooter({text: 'Röstningen stängs:'})
                    .setTitle('Vilket citat är bäst?')
            }catch (e: any) {
                this.log.error(e.message + '\n' + qts.toString())
                return
            }
            command.editReply({embeds: [embed], components: [row]})
            .then(data => {
                // Save data
                this.quotes.set(data.id, {
                    firstBtn: firstbtn,
                    firstCount: new Set<string>(),
                    firstQuoteID: qts[0].id.toString(),
                    secondBtn: secondbtn,
                    secondCount: new Set<string>(),
                    secondQuoteID: qts[1].id.toString(),
                    msg: data as Message
                })

                // Disabling voting after some time and submit the results
                setTimeout(async () => {
                        const match = this.quotes.get(data.id)!
                        const disRow = new MessageActionRow().addComponents(match.firstBtn.setDisabled(true)).addComponents(match.secondBtn.setDisabled(true))
                        await match.msg.edit({components: [disRow]})
                    
                        submitScores(match.firstQuoteID, match.secondQuoteID, match.firstCount.size, match.secondCount.size)
                            .then(() => {}, (e) => this.log.error(e.toString()))
                            .finally(() => this.quotes.delete(data.id))
                }, 2100000)
            })
        }, err => this.log.error(err.message))
    }

    /**
     * An event handler for when the first vote button is clicked. It saves the users vote to the first quote.
     * @param command the button interaction, user info and message info
     */
    @ButtonComponent('first-btn')
    async voteFirst(command: ButtonInteraction){
        if(!this.quotes.get(command.message.id)){
            await this.log.error("vote failed due to message " + command.message.id + " is not available")
            return
        }
        const data = this.quotes.get(command.message.id)!
        data.firstCount.add(command.user.id)
        data.secondCount.delete(command.user.id)

        data.firstBtn.setLabel(`Rösta första (${data.firstCount.size})`)
        data.secondBtn.setLabel(`Rösta andra (${data.secondCount.size})`)

        // updates message buttons
        command.update({
            components: [new MessageActionRow().addComponents(data.firstBtn).addComponents(data.secondBtn)]
        }).then(() => this.quotes.set(command.message.id, data))
    }

    /**
     * An event handler for when the second vote button is clicked. It saves the users vote to the second quote.
     * @param command the button interaction, user info and message info
     */
    @ButtonComponent('second-btn')
    async voteSecond(command: ButtonInteraction){
        if(!this.quotes.get(command.message.id)){
            await this.log.error("vote failed due to message " + command.message.id + " is not available")
            return
        }

        const data = this.quotes.get(command.message.id)!
        data.firstCount.delete(command.user.id)
        data.secondCount.add(command.user.id)

        data.firstBtn.setLabel(`Rösta första (${data.firstCount.size})`)
        data.secondBtn.setLabel(`Rösta andra (${data.secondCount.size})`)

        // update message buttons
        command.update({
            components: [new MessageActionRow().addComponents(data.firstBtn).addComponents(data.secondBtn)]
        }).then(() => this.quotes.set(command.message.id, data))
    }

    /**
     * Adds a context menu option for saving a message as a quote to the cache.
     * The addquote commands must be executed afterwards.
     * @param command
     */
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

        await command.reply({content: "För att lägga till citatet så är det bara att skriva `/addquote lösenord:[lösenord]`. Citatet tas bort från buffern efter 10 minuter.",
            embeds: [embed], components: [row], ephemeral: true})

    }

    /**
     * A slash command for submitting quotes to the online list either by getting from the cache or writing their own quote
     * @param password the password for submission
     * @param quote an optional argument that contains a quote to be submitted
     * @param command the slash command interaction
     */
    @Slash('addquote', {description: '(Endast /) Lägg till citat till citatlistan från höger click buffern eller ett eget skrivet citat'})
    async addQuote(
        @SlashOption('lösenord', {type: "STRING"})
        password: string,
        @SlashOption('citat', {type: "STRING", required: false})
        quote: string | undefined,
        command: CommandInteraction
    ){
        await command.deferReply({ephemeral: true})


        if(password !== process.env.RAVENHOLDT_PASS){
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

    /**
     * An event handler for removing a quote from the add quote buffer/hashmap
     * @param command the button interaction
     */
    @ButtonComponent('remove-from-buffer')
    async removeBufferedQuote(command: ButtonInteraction){
        this.addQuotes.delete(command.user.id)
        await command.update({content: "Citatet har tagits bort från buffern", components: []})
    }
}

/**
 * An object type for storing the quotes hashmap. It contains the votes,quotes and message data
 */
interface QuoteMatch{
    msg: Message,
    firstBtn: MessageButton,
    secondBtn: MessageButton,
    firstQuoteID: string,
    secondQuoteID: string,
    firstCount: Set<string>,
    secondCount: Set<string>
}

/**
 * An object type for storing in the addQuotes hashmap. It contains the timeout and the quote.
 */
interface AddQouteCache{
    quote: string,
    timeout: NodeJS.Timeout
}