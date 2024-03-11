// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {parseExpression, parseScript} from './parser.js';
import {evaluateExpression} from './runtime.js';
import {executeScriptAsync} from './runtimeAsync.js';
import {lintScript} from './model.js';
import {urlFileRelative} from './options.js';
import {valueBoolean} from './value.js';


/**
 * BareScript CLI options
 *
 * @typedef {Object} BareOptions
 * @property {string[]} argv - The process command-line arguments
 * @property {function} fetchFn - The [fetch function]{@link module:lib/options~FetchFn}
 * @property {function} logFn - The [log function]{@link module:lib/options~LogFn}
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
    // Command line arguments
    let args;
    try {
        args = parseArgs(options.argv);
    } catch ({message}) {
        options.logFn(`error: ${message}`);
        return 1;
    }
    if (args.help || args.scripts.length === 0) {
        options.logFn(helpText);
        return 1;
    }

    let statusCode = 0;
    let inlineCount = 0;
    let errorName = null;
    try {
        // Evaluate the global variable expression arguments
        const globals = {};
        for (const [varName, varExpr] of Object.entries(args.var)) {
            globals[varName] = evaluateExpression(parseExpression(varExpr));
        }

        // Parse and execute all source files in order
        for (const [scriptType, scriptValue] of args.scripts) {
            // Get the script source
            let scriptName;
            let scriptSource;
            if (scriptType === 'file') {
                scriptName = scriptValue;
                scriptSource = null;
                try {
                    const scriptResponse = await options.fetchFn(scriptValue);
                    if (scriptResponse.ok) {
                        scriptSource = await scriptResponse.text();
                    }
                } catch {
                    // Do nothing...
                }
                if (scriptSource === null) {
                    throw Error(`Failed to load "${scriptValue}"`);
                }
            } else {
                inlineCount += 1;
                scriptName = `-c ${inlineCount}`;
                scriptSource = scriptValue;
            }

            // Parse the script source
            errorName = scriptName;
            const script = parseScript(scriptSource);

            // Run the bare-script linter?
            if (args.static || args.debug) {
                const warnings = lintScript(script);
                const warningPrefix = `BareScript: Static analysis "${scriptName}" ...`;
                if (warnings.length === 0) {
                    options.logFn(`${warningPrefix} OK`);
                } else {
                    options.logFn(`${warningPrefix} ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`);
                    for (const warning of warnings) {
                        options.logFn(`BareScript:     ${warning}`);
                    }
                    if (args.static) {
                        statusCode = 1;
                        break;
                    }
                }
            }
            if (args.static) {
                continue;
            }

            // Execute the script
            const timeBegin = performance.now();
            const result = await executeScriptAsync(script, {
                'debug': args.debug ?? false,
                'fetchFn': options.fetchFn,
                'globals': globals,
                'logFn': options.logFn,
                'systemPrefix': 'https://craigahobbs.github.io/markdown-up/include/',
                'urlFn': scriptType === 'file' ? (url) => urlFileRelative(scriptName, url) : null

            });
            if (Number.isInteger(result) && result >= 0 && result <= 255) {
                statusCode = result;
            } else {
                statusCode = valueBoolean(result) ? 1 : 0;
            }

            // Log script execution end with timing
            if (args.debug) {
                const timeEnd = performance.now();
                options.logFn(`BareScript: Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
            }

            // Stop on error status code
            if (statusCode !== 0) {
                break;
            }
        }
    } catch ({message}) {
        if (errorName !== null) {
            options.logFn(`${errorName}:`);
        }
        options.logFn(message);
        statusCode = 1;
    }

    return statusCode;
}


/**
 * Parse the BareScript command-line interface (CLI) arguments
 *
 * @param {string} argv - The command-line arguments
 * @returns {Object} The arguments object
 * @throws {Error}
 * @ignore
 */
export function parseArgs(argv) {
    const args = {'scripts': [], 'var': {}};
    for (let iArg = 2; iArg < argv.length; iArg++) {
        const arg = argv[iArg];
        if (arg === '-c' || arg === '--code') {
            if (iArg + 1 >= argv.length) {
                throw new Error('argument -c/--code: expected one argument');
            }
            args.scripts.push(['code', argv[iArg + 1]]);
            iArg++;
        } else if (arg === '-d' || arg === '--debug') {
            args.debug = true;
        } else if (arg === '-h' || arg === '--help') {
            args.help = true;
        } else if (arg === '-s' || arg === '--static') {
            args.static = true;
        } else if (arg === '-v' || arg === '--var') {
            if (iArg + 2 >= argv.length) {
                throw new Error('argument -v/--var: expected 2 arguments');
            }
            args.var[argv[iArg + 1]] = argv[iArg + 2];
            iArg += 2;
        } else if (arg.startsWith('-')) {
            throw new Error(`unrecognized arguments: ${arg}`);
        } else {
            args.scripts.push(['file', arg]);
        }
    }

    return args;
}


// The command-line interface (CLI) help text
export const helpText = `\
usage: bare [-h] [-c CODE] [-d] [-s] [-v VAR EXPR] [file ...]

The BareScript command-line interface

positional arguments:
  file                files to process

options:
  -h, --help          show this help message and exit
  -c, --code CODE     execute the BareScript code
  -d, --debug         enable debug mode
  -s, --static        perform static analysis
  -v, --var VAR EXPR  set a global variable to an expression value`;
