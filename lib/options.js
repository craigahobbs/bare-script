// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/options */


/**
 * The BareScript runtime options
 *
 * @typedef {Object} ExecuteScriptOptions
 * @property {boolean} [debug] - If true, execute in debug mode
 * @property {function} [fetchFn] - The [fetch function]{@link module:lib/options~FetchFn}
 * @property {Object} [globals] - The global variables
 * @property {function} [logFn] - The [log function]{@link module:lib/options~LogFn}
 * @property {number} [maxStatements] - The maximum number of statements; default is 1e9; 0 for no maximum
 * @property {number} [statementCount] - The current statement count
 * @property {function} [urlFn] - The [URL modifier function]{@link module:lib/options~URLFn}
 * @property {string} [systemPrefix] - The system include prefix
 */


/**
 * The fetch function
 *
 * @callback FetchFn
 * @param {string} url - The URL to fetch
 * @param {?Object} [options] - The [fetch options]{@link https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters}
 * @returns {Promise} The fetch [response promise]{@link https://developer.mozilla.org/en-US/docs/Web/API/Response}
 */


/**
 * The log function
 *
 * @callback LogFn
 * @param {string} text - The log text
 */


/**
 * The URL modifier function
 *
 * @callback URLFn
 * @param {string} url - The URL
 * @returns {string} The modified URL
 */


/**
 * A [URL modifier function]{@link module:lib/options~URLFn} implementation that fixes up file-relative paths
 *
 * @param {string} file - The URL or path to which relative URLs are relative
 * @param {string} url - The URL or POSIX path to resolve
 * @returns {string} The resolved URL
 */
export function urlFileRelative(file, url) {
    // URL?
    if (rURL.test(url)) {
        return url;
    }

    // Absolute POSIX path?
    if (url.startsWith('/')) {
        return url;
    }

    // URL is relative POSIX path - join with root
    const result = `${file.slice(0, file.lastIndexOf('/') + 1)}${url}`;

    // Normalize non-URL POSIX paths
    if (!rURL.test(result)) {
        return normalizePath(result);
    }

    return result;
}


// Regular expression to match URLs
export const rURL = /^[a-z]+:/;


// Normalize a POSIX path
export function normalizePath(filepath) {
    // Handle empty string
    if (!filepath || filepath === '.') {
        return '.';
    }

    // Check if path is absolute
    const isAbsolute = filepath.startsWith('/');

    // Split path into segments
    const segments = filepath.split('/').filter(segment => segment !== '' && segment !== '.');

    // Process segments to handle '..'
    const stack = [];
    for (const segment of segments) {
        if (segment === '..') {
            // Only pop if we're not at the root and stack is not empty
            if (stack.length > 0 && stack[stack.length - 1] !== '..') {
                stack.pop();
            } else if (!isAbsolute) {
                // For relative paths, keep '..' if we can't go up further
                stack.push(segment);
            }
            // For absolute paths, ignore '..' at root
        } else {
            stack.push(segment);
        }
    }

    // Reconstruct path
    return isAbsolute ? `/${stack.join('/')}` : stack.join('/');
}
