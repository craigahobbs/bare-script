// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/optionsNode */

import {readFile, unlink, writeFile} from 'node:fs/promises';
import {rURL} from './options.js';
import {stdout} from 'node:process';


/**
 * A [fetch function]{@link module:lib/options~FetchFn} implementation that fetches resources that uses HTTP for
 * URLs, otherwise read-only file system access - a file read is a GET request
 */
export function fetchReadOnly(url, options = null, fetchFn = fetch, readFileFn = readFile) {
    return fetchHelper(url, options, fetchFn, readFileFn, null, null);
}


/**
 * A [fetch function]{@link module:lib/options~FetchFn} implementation that fetches resources that uses HTTP for
 * URLs, otherwise read-write file system access - a file read is a GET request, a file write is a POST or PUT
 * request with a body, and a file delete is a DELETE request
 */
export function fetchReadWrite(url, options, fetchFn = fetch, readFileFn = readFile, writeFileFn = writeFile, unlinkFn = unlink) {
    return fetchHelper(url, options, fetchFn, readFileFn, writeFileFn, unlinkFn);
}


// Helper to fetch a URL or read/write/delete a file - a null write-file or unlink function makes file writes or deletes
// fail, and any other method fails
function fetchHelper(url, options, fetchFn, readFileFn, writeFileFn, unlinkFn) {
    // URL fetch?
    if (rURL.test(url)) {
        return fetchFn(url, options);
    }

    // File delete?
    const method = (options ?? null) !== null ? (options.method ?? null) : null;
    if (method === 'DELETE') {
        if (unlinkFn === null || 'body' in options) {
            return {'ok': false};
        }
        return fetchHelperResponse(() => unlinkFn(url));
    }

    // File write?
    if ((options ?? null) !== null && 'body' in options) {
        if (writeFileFn === null || (method !== null && method !== 'POST' && method !== 'PUT')) {
            return {'ok': false};
        }
        return fetchHelperResponse(() => writeFileFn(url, options.body));
    }

    // File read
    if (method !== null && method !== 'GET') {
        return {'ok': false};
    }
    return {
        'ok': true,
        'text': () => readFileFn(url, 'utf-8'),
        'arrayBuffer': async () => {
            const buffer = await readFileFn(url);
            return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        }
    };
}


// Helper to create a file write or delete response - the operation runs when the response is read
function fetchHelperResponse(operation) {
    const text = async () => {
        await operation();
        return '{}';
    };
    return {
        'ok': true,
        text,
        'arrayBuffer': async () => new TextEncoder().encode(await text()).buffer
    };
}


/**
 * A [log function]{@link module:lib/options~LogFn} implementation that outputs to stdout
 */
export function logStdout(text, stdoutObj = stdout) {
    stdoutObj.write(`${text}\n`);
}
