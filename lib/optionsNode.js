// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/optionsNode */

import {readFile, writeFile} from 'node:fs/promises';
import {rURL} from './options.js';
import {stdout} from 'node:process';


/**
 * A [fetch function]{@link module:lib/options~FetchFn} implementation that fetches resources that uses HTTP GET
 * and POST for URLs, otherwise read-only file system access
 */
export function fetchReadOnly(url, options = null, fetchFn = fetch, readFileFn = readFile) {
    return fetchHelper(url, options, fetchFn, readFileFn, null);
}


/**
 * A [fetch function]{@link module:lib/options~FetchFn} implementation that fetches resources that uses HTTP GET
 * and POST for URLs, otherwise read-write file system access
 */
export function fetchReadWrite(url, options, fetchFn = fetch, readFileFn = readFile, writeFileFn = writeFile) {
    return fetchHelper(url, options, fetchFn, readFileFn, writeFileFn);
}


// Helper to fetch a URL or read/write a file - a null write-file function makes file writes fail
function fetchHelper(url, options, fetchFn, readFileFn, writeFileFn) {
    // URL fetch?
    if (rURL.test(url)) {
        return fetchFn(url, options);
    }

    // File write?
    if ((options ?? null) !== null && 'body' in options) {
        if (writeFileFn === null) {
            return {'ok': false};
        }
        return {
            'ok': true,
            'text': async () => {
                await writeFileFn(url, options.body);
                return '{}';
            }
        };
    }

    // File read
    return {
        'ok': true,
        'text': () => readFileFn(url, 'utf-8')
    };
}


/**
 * A [log function]{@link module:lib/options~LogFn} implementation that outputs to stdout
 */
export function logStdout(text, stdoutObj = stdout) {
    stdoutObj.write(`${text}\n`);
}
