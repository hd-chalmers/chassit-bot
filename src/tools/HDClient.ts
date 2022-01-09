import fetch from "node-fetch";

export default class HDClient {
    private _token: string;
    private _endpoint: string = process.env.API_ENDPOINT ? process.env.API_ENDPOINT : "https://hd.chalmers.se/api"

    constructor(token: string) {
        this._token = token;
    }

    get door(): Promise<DoorStatus> {
        return new Promise((resolve, reject) => {
            fetch(this._endpoint + "/door").then(res => res.json()).then(res => {
                resolve(new DoorStatus(res));
            }).catch(err => {
                reject(err);
            });
        })
    }
}

export class DoorStatus {
    private readonly _status: boolean | null;
    private readonly _duration: number;
    private readonly _duration_str: string;
    private readonly _updated: Date;

    constructor(response: any) {
        this._status = response.status;
        this._duration = response.duration;
        this._duration_str = response.duration_str;
        this._updated = new Date(response.updated);
    }

    get message() {
        return `Chassit är ${this.statusTxt} och har varit det i ${this._duration_str} (<t:${new Date(this._updated).getTime() / 1000}:R>)`
    }

    private get statusTxt(): "öppet" | "stängt" | "okänt"{
        if(this._status === true){
            return 'öppet'
        } else if(this._status === false){
            return 'stängt'
        } else {
            return 'okänt'
        }
    }

    get status(): boolean | null {
        return this._status;
    }

    get duration(): number {
        return this._duration;
    }

    get duration_str(): string {
        return this._duration_str;
    }

    get updated(): Date {
        return this._updated;
    }
}