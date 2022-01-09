import LoggerFactory from "./LogStyles.js";

export abstract class Command {
    readonly abstract name: string
    readonly abstract argDescription: string
    readonly abstract help: string
    readonly abstract alias: string[]
    private patterns: RegExp[] = [];

    get aliasStr(): string {
        let ret: string = "";
        this.alias.forEach((value => {
            if (value != "") {
                ret += value + "|";
            }
        }))
        ret = ret.substr(0, ret.length - 1);
        return ret.trim();
    }

    helpMsg(prefix: string): string {
        let ret: string = this.name + ": `" + (prefix + this.aliasStr + " " + this.argDescription).trim() + "` - " + this.help;
        return ret;
    }

    matches(args: string): boolean {
        if (this.patterns.length == 0) {
            return true;
        }
        let match: boolean = false;
        this.patterns.every((pattern) => {
            if (args.match(pattern)) {
                match = true;
                return false;
            }
            return true;
        })
        return match;
    }

}