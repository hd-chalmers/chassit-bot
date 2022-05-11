import {MessageEmbed} from "discord.js";
import fetch from "node-fetch";
import {FormData} from "formdata-node";

/**
 * Obtain a random quote from quote.ravenholdt.se and format it to message embed
 * @param threshHold the minimum rating allowed for fetched quotes
 * @return MessageEmbed
 * @async
 */
export async function getRandomQuote(threshHold: number): Promise<MessageEmbed> {
    let url: string = "https://quote.ravenholdt.se/api/random.php"
    let ret: MessageEmbed
    let promise: Promise<MessageEmbed> =new Promise((resolve, reject) => {
    fetch(url).then(res => res.json()).then(async (res: any) => {
        try{
            ret = new MessageEmbed({
                description: "",
                fields: [
                    {name: (await convertHTMLToMD(res.quote)) ?? "empty quote :(", value: (await convertHTMLToMD(res.context)) ?? "empty context :("}
                ],
                footer: {text: "Rating: " + res.rating}
            })
        } catch (e) {
            reject(e)
            return
        }
        resolve(ret);
        }).catch(err => reject(err))
    });
    return promise;
}

/**
 * Get a pair of quotes from quote.ravenholdt.se to be used for a quote vote
 * @return A {@link quoteType}[] if promise resolves
 * @async
 */
export async function getQuoteMatch(): Promise<quoteType[]>{
    const url: string = "https://quote.ravenholdt.se/api/update.php"
    return new Promise<any>((resolve, reject) => {
        fetch(url, {
            method: "POST",
            body: JSON.stringify({ action: "start" })
        }).then(res => res.json()).then(async (res: any) => {
            res[0].quote = await convertHTMLToMD(res[0].quote)
            res[0].context = await convertHTMLToMD(res[0].context)
            res[1].quote = await convertHTMLToMD(res[1].quote)
            res[1].context = await convertHTMLToMD(res[1].context)

            resolve(res)
        }).catch(e => reject(e))
    })
}

/**
 * Submit a match between two quotes in order to change their ranking on quote.ravenholdt.se
 * @param id1 id of the first quote
 * @param id2 id of the second quote
 * @param score1 amount of votes for the first quote
 * @param score2 amount of votes for the second quote
 */
export async function submitScores(id1: string, id2: string, score1: number, score2: number): Promise<void>{
    const url: string = "https://quote.ravenholdt.se/api/update.php"
    const body = JSON.stringify({
        action: 'change',
        id1: id1,
        id2: id2,
        score1: score1,
        score2: score2,
        swipe: false
    })

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            body: body
        }).then(res => {
            if(res.ok){
                resolve()
            } else {
                reject('Http code ' + res.status)
            }
        }).catch(e => reject(e))
    })

}

/**
 * converts html format tags to discord markdown
 * @param str the string containing html tags
 * @return A string formatted to discord markdown
 * @async
 */
export async function convertHTMLToMD(str:string): Promise<string | null>{
    return new Promise(resolve => {
        const s = str.replace('<br>', '\n')
            .replaceAll('</br>', '\n')
            .replaceAll('<i>', '*')
            .replaceAll('</i>', '*')
            .replaceAll('<b>', '**')
            .replaceAll('</b>', '**')
            .replaceAll('<em>', '**')
            .replaceAll('</em>', '**')
            .replaceAll('<strong>', '**')
            .replaceAll('</strong>', '**')
            .replaceAll('<del>', '~~')
            .replaceAll('</del>', '~~')
            .replaceAll('<ins>', '__')
            .replaceAll('</ins>', '__')
            .trim()

        if(s === ''){
            resolve(null)
            return
        }

        resolve(s)
    })
}

/**
 * Submit a new quote to quote.ravenholdt.se
 * @param quote A quote in the format: "quote" - Speaker, context
 */
export async function submitQuote(quote: string): Promise<void>{
    const url = "https://quote.ravenholdt.se/submit/"
    const data = new FormData() as any
    data.append("quote", quote)
    data.append("pass", process.env.RAVENHOLDT_PASS)

    return new Promise((async (resolve, reject) => {
        fetch(url, {
            method: "POST",
            body: data
        }).then(res => {
            if(res.ok){
                resolve()
            } else {
                reject("Http code " + res.status)
            }
        }).catch(e => reject(e))
    }))
}

/** A type used for quote.ravenholdt.se responses */
interface quoteType {
    /** quote id */
    id: number,
    /** the quote */
    quote: string,
    /** the speaker and context */
    context: string,
    /** total ranking points from votes */
    rating: number,
    /** amount of matches the quote has encountered */
    matches: number
}