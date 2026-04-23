// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/optionsNode */

import {dirname, join} from 'path';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'url';
import {stdout} from 'node:process';


/**
 * A [fetch function]{@link module:lib/options~FetchFn} implementation that fetches resources that uses HTTP GET
 * and POST for URLs, otherwise read-only file system access
 */
export function fetchReadOnly(url, options = null, fetchFn = fetch, readFileFn = readFile) {
    // URL fetch?
    if (rURL.test(url)) {
        return fetchFn(url, options);
    }

    // File write?
    if ((options ?? null) !== null && 'body' in options) {
        return {'ok': false};
    }

    // File read
    return {
        'ok': true,
        'text': () => readFileFn(url, 'utf-8')
    };
}


/**
 * A [fetch function]{@link module:lib/options~FetchFn} implementation that fetches resources that uses HTTP GET
 * and POST for URLs, otherwise read-write file system access
 */
export function fetchReadWrite(url, options, fetchFn = fetch, readFileFn = readFile, writeFileFn = writeFile) {
    // URL fetch?
    if (rURL.test(url)) {
        return fetchFn(url, options);
    }

    // File write?
    if ((options ?? null) !== null && 'body' in options) {
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


export const rURL = /^[a-z]+:/;


/**
 * A partial [fetch function]{@link module:lib/options~FetchFn} implementation that fetches system includes
 * from the local package, otherwise falls back to the first argument, `fetchFn`, unless null.
 */
export function fetchSystem(fetchFn, url, options) {
    // Is this a bare system include?
    if (url.startsWith(fetchSystemPrefix)) {
        // Get the include file path
        const includePath = url.slice(fetchSystemPrefix.length);
        const packageDir = dirname(fileURLToPath(import.meta.url));
        const packagePath = join(packageDir, 'include', includePath);

        // Return the include fetch-like promise
        return new Promise((resolve) => {
            const response = {
                'ok': true,
                'status': 200,
                'statusText': 'OK',
                'text': () => readFile(packagePath, 'utf8')
            };
            resolve(response);
        });
    }

    // Null fetch function?
    if (!fetchFn) {
        return new Promise((resolve) => {
            const response = {
                'ok': false,
                'status': 404,
                'statusText': 'Not Found'
            };
            resolve(response);
        });
    }

    return fetchFn(url, options);
}


/**
 * The system include prefix to use in conjunction with the `fetchSystem` function.
 */
export const fetchSystemPrefix = ':bare-include:/';


/**
 * A [log function]{@link module:lib/options~LogFn} implementation that outputs to stdout
 */
export function logStdout(text, stdoutObj = stdout) {
    stdoutObj.write(`${text}\n`);
}
