// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {evaluateExpression, systemGlobalIncludesName} from './runtime.js';
import {fetchSystem, fetchSystemPrefix} from './optionsNode.js';
import {parseExpression, parseScript} from './parser.js';
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
        options.logFn(`${helpTextShort}\nerror: ${message}`);
        return 1;
    }
    if (args.help || args.scripts.length === 0) {
        options.logFn(helpText);
        return 1;
    }

    let statusCode = 0;
    let inlineCount = 0;
    try {
        // Evaluate the global variable expression arguments
        const globals = {};
        for (const [varName, varExpr] of Object.entries(args.var)) {
            globals[varName] = evaluateExpression(parseExpression(varExpr));
        }

        // Get the scripts to run
        let {scripts} = args;
        let ixUserScript = 0;
        if (args.html || args.markdownUp) {
            // HTML or Markdown Text render?
            if (args.html) {
                scripts = [
                    ['code', 'include <markdownUp.bare>'],
                    ['code', 'markdownUpHTMLBegin()'],
                    ...scripts,
                    ['code', 'markdownUpHTMLEnd()']
                ];
                ixUserScript = 2;
            } else {
                scripts = [
                    ['code', 'include <markdownUp.bare>'],
                    ...scripts
                ];
                ixUserScript = 1;
            }

            // Add unittest.bare argument globals
            globals.vUnittestReport = true;
            if (args.static) {
                globals.vUnittestDisabled = true;
            }
        }

        // Parse and execute all source files in order
        for (const [ixScript, [scriptType, scriptValue]] of scripts.entries()) {
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
                const inlineDisplay = inlineCount - ixUserScript;
                scriptName = `<string${inlineDisplay > 1 ? inlineDisplay : ''}>`;
                scriptSource = scriptValue;
            }

            // Parse the script source
            const script = parseScript(scriptSource, 1, scriptName);

            // Execute?
            let staticGlobals = null;
            if (args.static !== 's') {
                // Set the globals to use for static analysis (below)
                if (!args.static || ixScript < ixUserScript) {
                    staticGlobals = globals;
                } else {
                    // Copy global to keep each script as isolated as possible
                    staticGlobals = {...globals};
                    const globalIncludes = staticGlobals[systemGlobalIncludesName] ?? null;
                    if (globalIncludes !== null && typeof globalIncludes === 'object') {
                        staticGlobals[systemGlobalIncludesName] = {...globalIncludes};
                    }
                }

                // Execute the script
                const timeBegin = performance.now();
                const result = await executeScriptAsync(script, {
                    'debug': args.debug ?? false,
                    'fetchFn': (fetchURL, fetchOptions) => fetchSystem(options.fetchFn, fetchURL, fetchOptions),
                    'globals': staticGlobals,
                    'logFn': options.logFn,
                    'systemPrefix': fetchSystemPrefix,
                    'urlFn': scriptType === 'file' ? (url) => urlFileRelative(scriptName, url) : null

                });
                if (Number.isInteger(result) && result >= 0 && result <= 255) {
                    statusCode = result || statusCode;
                } else {
                    statusCode = (valueBoolean(result) ? 1 : 0) || statusCode;
                }

                // Log script execution end with timing
                if (args.debug && ixScript >= ixUserScript) {
                    const timeEnd = performance.now();
                    options.logFn(`BareScript executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
                }
            }

            // Run the bare-script linter?
            if (args.static && ixScript >= ixUserScript) {
                const warnings = lintScript(script, staticGlobals);
                if (warnings.length === 0) {
                    options.logFn(`BareScript static analysis "${scriptName}" ... OK`);
                } else {
                    options.logFn(
                        `BareScript static analysis "${scriptName}" ... ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`
                    );
                    for (const warning of warnings) {
                        options.logFn(warning);
                    }
                    statusCode = 1;
                }
            }

            // Stop on error status code
            if (statusCode !== 0 && !args.static) {
                break;
            }
        }
    } catch ({message}) {
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
        } else if (arg === '-l' || arg === '--html') {
            args.html = true;
        } else if (arg === '-m' || arg === '--markdown') {
            args.markdownUp = true;
        } else if (arg === '-s' || arg === '--static') {
            args.static = 's';
        } else if (arg === '-x' || arg === '--staticx') {
            args.static = 'x';
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

    // markdownUp.bare arguments are exclusive
    if (args.html && args.markdownUp) {
        throw new Error('argument -m/--markdown: not allowed with argument -l/--html');
    }

    return args;
}


// The command-line interface (CLI) help text
export const helpTextShort = 'usage: bare [-h] [-c CODE] [-d] [-l | -m] [-s] [-x] [-v VAR EXPR] [file ...]';
export const helpText = `\
${helpTextShort}

The BareScript command-line interface

positional arguments:
  file                files to process

options:
  -h, --help          show this help message and exit
  -c, --code CODE     execute the BareScript code
  -d, --debug         enable debug mode
  -l, --html          run with MarkdownUp HTML output
  -m, --markdown      run with MarkdownUp text output
  -s, --static        perform static analysis
  -x, --staticx       perform static analysis with execution
  -v, --var VAR EXPR  set a global variable to an expression value`;
