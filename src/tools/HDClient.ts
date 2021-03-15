import axios, {AxiosResponse} from "axios";

export default class HDClient {
    private _token: string;
    private _endpoint: string = process.env.API_ENDPOINT ? process.env.API_ENDPOINT : "https://hd.chalmers.se/api"

    constructor(token: string) {
        this._token = token;
    }

    get door(): Promise<DoorStatus> {
        return new Promise((resolve, reject) => {
            axios.get(this._endpoint + "/door").then(res => {
                resolve(new DoorStatus(res));
            }).catch(err => {
                reject(err);
            });
        })
    }
}

export class DoorStatus {
    private readonly _status: boolean;
    private readonly _duration: number;
    private readonly _duration_str: string;
    private readonly _updated: Date;

    constructor(response: AxiosResponse) {
        let data = response.data;
        this._status = data.status;
        this._duration = data.duration;
        this._duration_str = data.duration_str;
        this._updated = new Date(data.updated);
    }

    get message() {
        return "Chassit är " + (this.status ? "Öppet" : "Stängt") + " och har varit det i "
            + this.duration_str.replace("minutes", "minuter")
                .replace("seconds", "sekunder")
                .replace("hours", "timmar")
                .replace("days", "dagar")
                .replace("day", "dag")
                .replace("hour", "timme")
                .replace("minute", "minut")
                .replace("second", "sekund");
    }

    get status(): boolean {
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