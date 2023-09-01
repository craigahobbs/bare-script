// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {parseExpression, parseScript} from './parser.js';
import {evaluateExpression} from './runtime.js';
import {executeScriptAsync} from './runtimeAsync.js';
import {lintScript} from './model.js';


// The command-line interface (CLI) help text
export const helpText = `\
usage: bare [-h] [-c CODE] [-d] [-v VAR EXPR] [filename ...]

The BareScript command-line interface

positional arguments:
  filename

options:
  -h, --help          show this help message and exit
  -c, --code CODE     execute the BareScript code
  -d, --debug         enable debug mode
  -v, --var VAR EXPR  set a global variable to an expression value`;


/**
 * BareScript CLI options
 *
 * @typedef {Object} BareOptions
 * @property {string[]} argv - The process command-line arguments
 * @property {function} fetchFn - The [fetch function]{@link module:lib/runtime~FetchFn}
 * @property {function} logFn - The [log function]{@link module:lib/runtime~LogFn}
 * @ignore
 */


/**
 * BareScript command-line interface (CLI) main entry point
 *
 * @param {Object} options - The [CLI options]{@link module:lib/bare~BareOptions}
 * @returns {Number} The exit code
 * @ignore
 */
export async function main(options) {
    let currentFile = null;
    try {
        const args = parseArgs(options.argv);

        // Read the source files
        const responses = await Promise.all(args.files.map(async ([url, source]) => {
            if (source !== null) {
                return {'ok': true, 'text': () => source};
            }
            try {
                return await options.fetchFn(url);
            } catch {
                throw Error(`Failed to load "${url}"`);
            }
        }));
        const files = await Promise.all(responses.map(async (response, ixResponse) => {
            const [url] = args.files[ixResponse];
            let source = null;
            if (response.ok) {
                try {
                    source = await response.text();
                } catch {
                    // Do nothing
                }
            }
            if (source === null) {
                throw Error(`Failed to load "${url}"`);
            }
            return [url, source];
        }));

        // Parse the source files
        const scripts = [];
        for (const [file, source] of files) {
            currentFile = file;
            scripts.push([file, parseScript(source)]);
        }

        // Lint and execute the source scripts
        for (const [file, script] of scripts) {
            currentFile = file;

            // Run the bare-script linter?
            if (args.debug) {
                const warnings = lintScript(script);
                const warningPrefix = `BareScript: Static analysis...`;
                if (warnings.length === 0) {
                    options.logFn(`${warningPrefix} OK`);
                } else {
                    options.logFn(`${warningPrefix} ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`);
                    for (const warning of warnings) {
                        options.logFn(`BareScript:     ${warning}`);
                    }
                }
            }

            // Execute the script
            const timeBegin = performance.now();
            // eslint-disable-next-line no-await-in-loop
            await executeScriptAsync(script, {
                'debug': args.debug ?? false,
                'fetchFn': options.fetchFn,
                'globals': args.variables,
                'logFn': (message) => options.logFn(message),
                'systemPrefix': 'https://craigahobbs.github.io/markdown-up/include/',
                'urlFn': (url) => (rURL.test(url) || url.startsWith('/') ? url : `${file.slice(0, file.lastIndexOf('/') + 1)}${url}`)

            });

            // Log script execution end with timing
            if (args.debug) {
                const timeEnd = performance.now();
                options.logFn(`BareScript: Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
            }
        }
    } catch ({message}) {
        const fileStr = (currentFile !== null ? `${currentFile}:\n` : '');
        options.logFn(`${fileStr}${message}`);
        return 1;
    }

    return 0;
}


// Regex to match a URL
const rURL = /^[a-z]+:/;


/**
 * Parse the BareScript command-line interface (CLI) arguments
 *
 * @param {string} argv - The command-line arguments
 * @returns {Object} The arguments object
 * @throws {Error}
 * @ignore
 */
export function parseArgs(argv) {
    const args = {'files': [], 'variables': {}};
    let codeCount = 0;
    for (let iArg = 2; iArg < argv.length; iArg++) {
        const arg = argv[iArg];
        if (arg === '-c' || arg === '--code') {
            if (iArg + 1 >= argv.length) {
                throw new Error(`Missing value for ${arg}`);
            }
            args.files.push([`-c ${++codeCount}`, argv[iArg + 1]]);
            iArg++;
        } else if (arg === '-d' || arg === '--debug') {
            args.debug = true;
        } else if (arg === '-h' || arg === '--help') {
            args.help = true;
        } else if (arg === '-v' || arg === '--var') {
            if (iArg + 2 >= argv.length) {
                throw new Error(`Missing values for ${arg}`);
            }
            args.variables[argv[iArg + 1]] = evaluateExpression(parseExpression(argv[iArg + 2]));
            iArg += 2;
        } else if (arg.startsWith('-')) {
            throw new Error(`Unknown option ${arg}`);
        } else {
            args.files.push([arg, null]);
        }
    }

    // Show help, if necessary
    if (args.help || args.files.length === 0) {
        throw new Error(helpText);
    }

    return args;
}
