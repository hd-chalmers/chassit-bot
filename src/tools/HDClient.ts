import fetch from "node-fetch";

/** A class made for accessing various HD APIs */
export default class HDClient {
    /** The api token needed for accessing protected api routes */
    private _token: string;
    /** The url used in HD API calls 
     * @defaultvalue "https://hd.chalmers.se/api" 
     */
    private _endpoint: string = process.env.API_ENDPOINT ?? "https://hd.chalmers.se/api"

    /** 
     * Constructor for {@link HDClient} which is used for calls to HD API
     * @param token The API token for proctected API calls
     */
    constructor(token: string) {
        this._token = token;
    }

    /** Makes a API call to /door and formats it to a {@link DoorStatus} object
     * @async 
     * @returns {Promise<DoorStatus>} Returns a promise which may return {@link DoorStatus} on resolve or an {@link Error} on reject
     */
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

/** A class that formats the /door response from HD API */
export class DoorStatus {
    /** The status of door where true, false and null means open, closed and error respectively */
    private readonly _status: boolean | null;
    /** A unixtimestamp of the amount of seconds since the status changed */
    private readonly _duration: number;
    /** A string about how long since the duration since status changed */
    private readonly _duration_str: string;
    /** The timestamp of when the status chnaged */
    private readonly _updated: Date;

    /**
     * Creates a {@link DoorStatus} object which contains door status and timestamp of change
     * @param response A json object which has the properties status, duration, duration_str and updated
     */
    constructor(response: any) {
        this._status = response.status;
        this._duration = response.duration;
        this._duration_str = response.duration_str;
        this._updated = new Date(response.updated);
    }

    /** Generates a string message about door status and when the status changed */
    get message() {
        return `Chassit är ${this.statusTxt} och har varit det i ${this._duration_str} (<t:${(new Date(this._updated).getTime() / 1000) - 3600}:R>)`
    }

    /** Returns a status string based on {@link _status} */
    private get statusTxt(): "öppet" | "stängt" | "okänt"{
        if(this._status === true){
            return 'öppet'
        } else if(this._status === false){
            return 'stängt'
        } else {
            return 'okänt'
        }
    }

    /** The status of door where true, false and null means open, closed and error respectively */
    get status(): boolean | null {
        return this._status;
    }

    /** A unixtimestamp of the amount of seconds since the status changed */
    get duration(): number {
        return this._duration;
    }

    /** A string about how long since the duration since status changed */
    get duration_str(): string {
        return this._duration_str;
    }

    /** The timestamp of when the status chnaged */
    get updated(): Date {
        return this._updated;
    }
}