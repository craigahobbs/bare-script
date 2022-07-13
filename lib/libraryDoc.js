// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE


/**
 * Parse the calc-script library source for documentation tags
 *
 * @param {string[][]} files - The list of file name and source tuples
 * @returns {Object} The [library documentation model]{@link https://craigahobbs.github.io/calc-script/library/#var.vDoc=1}
 * @throws {Error}
 * @ignore
 */
export function parseLibraryDoc(files) {
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
            } else {
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
                }
            }
        }
    }

    // Return the library documentation model
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
            errors.push(`error: Function "${func.name}" missing documentation`);
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
const rArg = /^\s*(?:\/\/|#)\s*\$arg\s+(?<name>[A-Za-z_][A-Za-z0-9_]*):\s?(?<text>.*)$/;
const rSplit = /\r?\n/;
