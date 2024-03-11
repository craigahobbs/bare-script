// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {valueJSON} from './value.js';


/**
 * BareScript documentation tool options
 *
 * @typedef {Object} BaredocOptions
 * @property {string[]} argv - The process command-line arguments
 * @property {function} fetchFn - The [fetch function]{@link module:lib/options~FetchFn}
 * @property {function} logFn - The [log function]{@link module:lib/options~LogFn}
 * @ignore
 */


/**
 * BareScript documentation tool main entry point
 *
 * @param {Object} options - The [baredoc options]{@link module:lib/bare~BaredocOptions}
 * @returns {Number} The exit code
 * @ignore
 */
export async function main(options) {
    // Command line arguments
    let args;
    try {
        args = parseArgs(options.argv);
    } catch ({message}) {
        options.logFn(`error: ${message}`);
        return 1;
    }
    if (args.help || args.files.length === 0) {
        options.logFn(helpText);
        return 1;
    }

    // Parse each source file line-by-line
    const errors = [];
    const funcs = {};
    let func = null;
    for (const file of args.files) {
        // Read the source file
        let source = null;
        try {
            const response = await options.fetchFn(file);
            if (response.ok) {
                source = await response.text();
            }
        } catch {
            // Do nothing...
        }
        if (source === null) {
            errors.push(`Failed to load "${file}"`);
            continue;
        }

        // Split the source lines and process documentation comments
        const lines = source.split(rSplit);
        for (const [ixLine, line] of lines.entries()) {
            // function/group/doc/return documentation keywords?
            const matchKey = line.match(rKey);
            if (matchKey !== null) {
                const {key, text} = matchKey.groups;
                const textTrim = text.trim();

                // Keyword used outside of function?
                if (key !== 'function' && func === null) {
                    errors.push(`${file}:${ixLine + 1}: ${key} keyword outside function`);
                    continue;
                }

                // Process the keyword
                if (key === 'group') {
                    if (textTrim === '') {
                        errors.push(`${file}:${ixLine + 1}: Invalid function group name "${textTrim}"`);
                        continue;
                    }
                    if ('group' in func) {
                        errors.push(`${file}:${ixLine + 1}: Function "${func.name}" group redefinition`);
                        continue;
                    }

                    // Set the function group
                    func.group = textTrim;
                } else if (key === 'doc' || key === 'return') {
                    // Add the documentation line - don't add leading blank lines
                    let funcDoc = func[key] ?? null;
                    if (funcDoc !== null || textTrim !== '') {
                        if (funcDoc === null) {
                            funcDoc = [];
                            func[key] = funcDoc;
                        }
                        funcDoc.push(text);
                    }
                } else {
                    // key === 'function'
                    if (textTrim === '') {
                        errors.push(`${file}:${ixLine + 1}: Invalid function name "${textTrim}"`);
                        continue;
                    }
                    if (textTrim in funcs) {
                        errors.push(`${file}:${ixLine + 1}: Function "${textTrim}" redefinition`);
                        continue;
                    }

                    // Add the function
                    func = {'name': textTrim};
                    funcs[textTrim] = func;
                }

                continue;
            }

            // arg keyword?
            const matchArg = line.match(rArg);
            if (matchArg !== null) {
                const {name, text} = matchArg.groups;
                const textTrim = text.trim();

                // Keyword used outside of function?
                if (func === null) {
                    errors.push(`${file}:${ixLine + 1}: Function argument "${name}" outside function`);
                    continue;
                }

                // Get the function argument model, if it exists
                let funcArgs = func.args ?? null;
                let funcArg = null;
                if (funcArgs !== null) {
                    funcArg = funcArgs.find((findArg) => findArg.name === name) ?? null;
                }

                // Ignore leading argument documentation blank lines
                if (funcArg === null && textTrim === '') {
                    continue;
                }

                // Add the fuction model arguments member, if necessary
                if (funcArgs === null) {
                    funcArgs = [];
                    func.args = funcArgs;
                }

                // Add the function argument model, if necessary
                if (funcArg === null) {
                    funcArg = {'name': name, 'doc': []};
                    funcArgs.push(funcArg);
                }

                // Add the function argument documentation line
                funcArg.doc.push(text);
                continue;
            }

            // Unknown documentation comment?
            const matchUnknown = line.match(rUnknown);
            if (matchUnknown !== null) {
                const {unknown} = matchUnknown.groups;
                errors.push(`${file}:${ixLine + 1}: Invalid documentation comment "${unknown}"`);
                continue;
            }
        }
    }

    // Create the library documentation model
    const library = {
        'functions': Object.values(funcs).sort(
            /* c8 ignore next */
            (funcA, funcB) => (funcA.name < funcB.name ? -1 : (funcA.name === funcB.name ? 0 : 1))
        )
    };

    // Validate
    if (library.functions.length === 0) {
        errors.push('error: No library functions');
    }
    for (const funcLib of library.functions) {
        if (!('group' in funcLib)) {
            errors.push(`error: Function "${funcLib.name}" missing group`);
        }
        if (!('doc' in funcLib)) {
            errors.push(`error: Function "${funcLib.name}" missing documentation`);
        }
    }

    // Errors?
    if (errors.length !== 0) {
        options.logFn(errors.join('\n'));
        return 1;
    }

    // JSON-serialize the library documentation model
    const libraryJSON = valueJSON(library);

    // Output to stdout?
    if (args.output === '-') {
        options.logFn(libraryJSON);
    } else {
        // Output to file
        let success = false;
        try {
            const response = await options.fetchFn(args.output, {'body': libraryJSON});
            if (response.ok) {
                await response.text();
                success = true;
            }
        } catch {
            // Do nothing
        }
        if (!success) {
            options.logFn(`error: Failed to write "${args.output}"`);
            return 1;
        }
    }

    return 0;
}


// Library documentation regular expressions
const rKey = /^\s*(?:\/\/|#)\s*\$(?<key>function|group|doc|return):\s?(?<text>.*)$/;
const rArg = /^\s*(?:\/\/|#)\s*\$arg\s+(?<name>[A-Za-z_][A-Za-z0-9_]*(?:\.\.\.)?):\s?(?<text>.*)$/;
const rUnknown = /^\s*(?:\/\/|#)\s*\$(?<unknown>[^:]+):/;
const rSplit = /\r?\n/;


/**
 * Parse the baredoc command-line arguments
 *
 * @param {string} argv - The command-line arguments
 * @returns {Object} The arguments object
 * @throws {Error}
 * @ignore
 */
export function parseArgs(argv) {
    const args = {'files': [], 'output': '-'};
    for (let iArg = 2; iArg < argv.length; iArg++) {
        const arg = argv[iArg];
        if (arg === '-o') {
            if (iArg + 1 >= argv.length) {
                throw new Error('argument -o: expected one argument');
            }
            args.output = argv[iArg + 1];
            iArg++;
        } else if (arg === '-h' || arg === '--help') {
            args.help = true;
        } else if (arg.startsWith('-')) {
            throw new Error(`unrecognized arguments: ${arg}`);
        } else {
            args.files.push(arg);
        }
    }

    // Files is required
    if (!args.help && args.files.length === 0) {
        throw new Error('the following arguments are required: file');
    }

    return args;
}


// The baredoc command-line help text
export const helpText = `\
usage: baredoc [-h] [-o file] file [file ...]

The BareScript documentation tool

positional arguments:
  file        files to process

options:
  -h, --help  show this help message and exit
  -o file     write output to file (default is "-")`;
