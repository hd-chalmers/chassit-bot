import {MessageEmbed} from "discord.js";
import fetch from "node-fetch";
import {FormData} from "formdata-node";

export async function getRandomQuote(threshHold: number): Promise<MessageEmbed> {
    let url: string = "https://quote.ravenholdt.se/api/random.php"
    let ret: MessageEmbed
    let promise: Promise<MessageEmbed> =new Promise((resolve, reject) => {
    fetch(url).then(res => res.json()).then(async (res: any) => {
        try{
            ret = new MessageEmbed({
                description: "",
                fields: [
                    {name: await convertHTMLToMD(res.quote), value: await convertHTMLToMD(res.context)}
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

export async function getQuoteMatch(){
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

    console.log(body)
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

export async function convertHTMLToMD(str:string): Promise<string>{
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

        resolve(s)
    })
}

export async function submitQuote(quote: string): Promise<void>{
    const url = "https://quote.ravenholdt.se/submit/"
    const data = new FormData() as any
    data.append("quote", quote)
    data.append("pass", "password")

    return new Promise(((resolve, reject) => {
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

interface quoteType {
    id: number,
    quote: string,
    context: string,
    rating: number,
    matches: number
}