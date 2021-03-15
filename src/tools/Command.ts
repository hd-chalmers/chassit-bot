import Discord = require('discord.js');

export class Command {
    private _name: string
    private _argDescription: string
    private _help: string
    private _alias: string[]
    private _exec: (message: Discord.Message, args: string[]) => Promise<void>
    private _patterns: RegExp[];

    constructor(name: string, argDescription: string, help: string, alias: string[], patterns: RegExp[], exec: (message: Discord.Message, args: string[]) => Promise<void>) {
        this._name = name;
        this._help = help;
        this._alias = alias;
        this._argDescription = argDescription;
        this._patterns = patterns;
        this._exec = exec
    }

    get name(): string {
        return this._name;
    }

    get pattern(): RegExp[] {
        return this._patterns;
    }

    get aliases(): string[] {
        return this._alias;
    }

    get aliasStr(): string {
        let ret: string = "";
        this._alias.forEach((value => {
            if (value != "") {
                ret += value + "|";
            }
        }))
        ret = ret.substr(0, ret.length - 1);
        return ret.trim();
    }

    get argDescription(): string {
        return this._argDescription;
    }

    get exec(): (message: Discord.Message, args: string[]) => Promise<void> {
        return this._exec
    }

    help(prefix: string): string {
        let ret: string = this.name + ": `" + (prefix + " " + this.aliasStr + " " + this.argDescription).trim() + "` - " + this._help;
        return ret;
    }

    matches(args: string): boolean {
        if (this._patterns.length == 0) {
            return true;
        }
        let match: boolean = false;
        this._patterns.every((pattern) => {
            if (args.match(pattern)) {
                match = true;
                return false;
            }
            return true;
        })
        return match;
    }
}