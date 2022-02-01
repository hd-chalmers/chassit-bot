/**  
 * This is a standard template class for commands.
 * Note: that man properties are no longer used since the move to slash commands
 * @abstract 
 */
export abstract class Command {
    /** The name of the command */
    readonly abstract name: string
    /** The descriptions of the arguments */
    readonly abstract argDescription: string
    /** The help text of the command */
    readonly abstract help: string
    /** Aliases for a simple command */
    readonly abstract alias: string[]
    /** Regex patterns for parsing the message */
    private patterns: RegExp[] = [];

    /** Generates a string list of all command aliases */
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

    /** Generates a help message for the command */
    helpMsg(prefix: string): string {
        let ret: string = this.name + ": `" + (prefix + this.aliasStr + " " + this.argDescription).trim() + "` - " + this.help;
        return ret;
    }

    /** Checks if the message arguments match the expected patterns */
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