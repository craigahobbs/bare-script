#!/usr/bin/env node
// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE


/* c8 ignore start */


/**
 * TODO
 */
export function parseLibraryDoc(files) {
    // Parse each source file line-by-line
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
                const isTextEmpty = (textTrim === '');

                // Keyword used outside of function scope?
                if (key !== 'function' && func === null) {
                    throw new Error(`${file}:${ixLine + 1}: ${key} keyword used outside of function scope`);
                }

                // Process the keyword
                if (key === 'group') {
                    if ('group' in func) {
                        throw new Error(`${file}:${ixLine + 1}: Function "${func.name}" group redefined`);
                    }

                    // Set the function group
                    func.group = textTrim;
                } else if (key === 'doc') {
                    if (!('doc' in func)) {
                        func.doc = [];
                    }

                    // Add the function documentation line - don't add leading blank lines
                    if (func.doc.length !== 0 || !isTextEmpty) {
                        func.doc.push(text);
                    }
                } else if (key === 'return') {
                    if (!('return' in func)) {
                        func.return = [];
                    }

                    // Add the return documentation line - don't add leading blank lines
                    if (func.return.length !== 0 || !isTextEmpty) {
                        func.return.push(text);
                    }
                } else {
                    // key === 'function'
                    if (textTrim in funcs) {
                        throw new Error(`${file}:${ixLine + 1}: Function "${textTrim}" redefined`);
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
                    const isTextEmpty = (text.trim() === '');

                    // Keyword used outside of function scope?
                    if (func === null) {
                        throw new Error(`${file}:${ixLine + 1}: arg "${name}" keyword used outside of function scope`);
                    }

                    // Add the function arg
                    let arg;
                    let args = func.args ?? null;
                    if (args === null) {
                        args = [];
                        func.args = args;
                    }
                    if (args.length !== 0 && args[args.length - 1].name === name) {
                        arg = args[args.length - 1];
                    } else {
                        if (args.some((argSome) => argSome.name === name)) {
                            throw new Error(`${file}:${ixLine + 1}: arg "${name}" redefined`);
                        }
                        arg = {'name': name, 'doc': []};
                        args.push(arg);
                    }

                    // Add the function arg documentation line - don't add leading blank lines
                    if (args.length !== 0 || !isTextEmpty) {
                        arg.doc.push(text);
                    }
                }
            }
        }
    }

    // Return the library documentation model
    return {
        'functions': Object.values(funcs).sort((funcA, funcB) => {
            const resultGroup = (funcA.group < funcB.group ? -1 : (funcA.group === funcB.group ? 0 : 1));
            const resultName = (funcA.name < funcB.name ? -1 : (funcA.name === funcB.name ? 0 : 1));
            return resultGroup !== 0 ? resultGroup : resultName;
        })
    };
}


// Library documentation regular expressions
const rKey = /^\s*(?:\/\/|#)\s*\$(?<key>function|group|doc|return):\s?(?<text>.*)$/;
const rArg = /^\s*(?:\/\/|#)\s*\$arg\s+(?<name>.+?):\s?(?<text>.*)$/;
const rSplit = /\r?\n/;


/* c8 ignore stop */
