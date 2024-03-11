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

    // URL is relative POSIX path
    return `${file.slice(0, file.lastIndexOf('/') + 1)}${url}`;
}


export const rURL = /^[a-z]+:/;
