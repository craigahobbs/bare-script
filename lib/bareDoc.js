// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE


/**
 * BareScript library documentation CLI options
 *
 * @typedef {Object} BareDocOptions
 * @property {string[]} argv - The process command-line arguments
 * @property {function} fetchFn - The [fetch function]{@link module:lib/runtime~FetchFn}
 * @property {function} logFn - The [log function]{@link module:lib/runtime~LogFn}
 * @ignore
 */


/**
 * BareScript library documentation command-line interface (CLI) main entry point
 *
 * @param {Object} options - The CLI [options]{@link module:lib/bare~BareDocOptions}
 * @returns {Number} The exit code
 * @ignore
 */
export async function main(options) {
    try {
        const urls = options.argv.slice(2);
        const responses = await Promise.all(urls.map(async (url) => {
            try {
                return await options.fetchFn(url);
            } catch {
                throw Error(`Failed to load "${url}"`);
            }
        }));
        const files = await Promise.all(responses.map(async (response, ixResponse) => {
            const url = urls[ixResponse];
            let text = null;
            if (response.ok) {
                try {
                    text = await response.text();
                } catch {
                    // Do nothing
                }
            }
            if (text === null) {
                throw Error(`Failed to load "${url}"`);
            }
            return [url, text];
        }));
        options.logFn(JSON.stringify(parseBareDoc(files), null, 4));
    } catch ({message}) {
        options.logFn(message);
        return 1;
    }

    return 0;
}


/**
 * Parse the library source for documentation tags
 *
 * @param {string[][]} files - The list of file name and source tuples
 * @returns {Object} The [library documentation model]{@link https://craigahobbs.github.io/bare-script/library/#var.vDoc=1}
 * @throws {Error}
 * @ignore
 */
export function parseBareDoc(files) {
    // Parse each source file line-by-line
    const errors = [];
    const funcs = {};
    let func = null;
    for (const [file, source] of files) {
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

                // Add the function arg documentation line - don't add leading blank lines
                let args = func.args ?? null;
                let arg = (args !== null ? args.find((argFind) => argFind.name === name) : null) ?? null;
                if (arg !== null || textTrim !== '') {
                    if (args === null) {
                        args = [];
                        func.args = args;
                    }
                    if (arg === null) {
                        arg = {'name': name, 'doc': []};
                        args.push(arg);
                    }
                    arg.doc.push(text);
                }

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
        throw new Error(errors.join('\n'));
    }

    return library;
}


// Library documentation regular expressions
const rKey = /^\s*(?:\/\/|#)\s*\$(?<key>function|group|doc|return):\s?(?<text>.*)$/;
const rArg = /^\s*(?:\/\/|#)\s*\$arg\s+(?<name>[A-Za-z_][A-Za-z0-9_]*(?:\.\.\.)?):\s?(?<text>.*)$/;
const rUnknown = /^\s*(?:\/\/|#)\s*\$(?<unknown>[^:]+):/;
const rSplit = /\r?\n/;
