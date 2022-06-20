import LoggerFactory from "./LogStyles.js";
import fetch from "node-fetch";

/**
 * A class made for accessing HD nowplaying APIs
 */
export default class NowPlayingClient{
    /** The endpoint for the HD API */
    private _endpoint: string = process.env.API_ENDPOINT ?? "https://hd.chalmers.se/api"
    /** The logger for this class */
    private readonly logger: LoggerFactory = new LoggerFactory('nowplaying')

    /**
     * A getter for songdata from the HD nowplaying API
     * @returns {Promise<SongData>} Returns a promise which may return {@link SongData} or null on resolve,
     * or an {@link Error} on reject
     */
    get song(): Promise<Songdata| null>{
        return new Promise((resolve, reject) => {
            fetch(this._endpoint + "/nowplaying").then(res => res.json()).then(res => {
                resolve((res as {nowplaying: Songdata | null}).nowplaying);
            }).catch(err => {
                this.logger.error(err.message)
                reject(err);
            });
        })
    }
}

/**
 * A class that formats the /nowplaying response from HD API
 */
export interface Songdata{
    artist: string,
    title: string
}