// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/* eslint-disable id-length */


// The default maximum statements for executeScript
export const defaultMaxStatements = 1e7;


// The built-in expression functions
export const expressionFunctions = {
    'abs': ([x]) => Math.abs(x),
    'acos': ([x]) => Math.acos(x),
    'asin': ([x]) => Math.asin(x),
    'atan': ([x]) => Math.atan(x),
    'atan2': ([y, x]) => Math.atan2(y, x),
    'ceil': ([x]) => Math.ceil(x),
    'charCodeAt': ([string, index]) => (typeof string === 'string' ? string.charCodeAt(index) : null),
    'cos': ([x]) => Math.cos(x),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': ([datetime]) => (datetime instanceof Date ? datetime.getDate() : null),
    'encodeURIComponent': ([uriComponent]) => encodeURIComponent(uriComponent),
    'endsWith': ([string, searchString]) => (typeof string === 'string' ? string.endsWith(searchString) : null),
    'indexOf': ([string, searchString, position]) => (typeof string === 'string' ? string.indexOf(searchString, position) : null),
    'fixed': ([x, digits = 2]) => (typeof x === 'number' ? x.toFixed(digits) : null),
    'floor': ([x]) => Math.floor(x),
    'fromCharCode': (args) => String.fromCharCode(...args),
    'hour': ([datetime]) => (datetime instanceof Date ? datetime.getHours() : null),
    'lastIndexOf': ([string, searchString, position]) => (typeof string === 'string' ? string.lastIndexOf(searchString, position) : null),
    'len': ([string]) => (typeof string === 'string' ? string.length : null),
    'lower': ([string]) => (typeof string === 'string' ? string.toLowerCase() : null),
    'ln': ([x]) => Math.log(x),
    'log': ([x, base = 10]) => Math.log(x) / Math.log(base),
    'max': (args) => Math.max(...args),
    'min': (args) => Math.min(...args),
    'minute': ([datetime]) => (datetime instanceof Date ? datetime.getMinutes() : null),
    'month': ([datetime]) => (datetime instanceof Date ? datetime.getMonth() + 1 : null),
    'now': () => new Date(),
    'parseInt': ([string, radix = 10]) => parseInt(string, radix),
    'parseFloat': ([string]) => parseFloat(string),
    'pi': () => Math.PI,
    'rand': () => Math.random(),
    'replace': ([string, substr, newSubstr], options) => {
        if (typeof string !== 'string') {
            return null;
        }
        if (typeof newSubstr === 'function') {
            const replacerFunction = (...args) => newSubstr(args, options);
            return string.replaceAll(substr, replacerFunction);
        }
        return string.replaceAll(substr, newSubstr);
    },
    'rept': ([string, count]) => (typeof string === 'string' ? string.repeat(count) : null),
    'round': ([x, digits = 0]) => {
        const multiplier = 10 ** digits;
        return Math.round(x * multiplier) / multiplier;
    },
    'second': ([datetime]) => (datetime instanceof Date ? datetime.getSeconds() : null),
    'sign': ([x]) => Math.sign(x),
    'sin': ([x]) => Math.sin(x),
    'slice': ([string, beginIndex, endIndex]) => (typeof string === 'string' ? string.slice(beginIndex, endIndex) : null),
    'sqrt': ([x]) => Math.sqrt(x),
    'startsWith': ([string, searchString]) => (typeof string === 'string' ? string.startsWith(searchString) : null),
    'text': ([value]) => `${value}`,
    'tan': ([x]) => Math.tan(x),
    'today': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    'trim': ([string]) => (typeof string === 'string' ? string.trim() : null),
    'typeof': ([value]) => typeof value,
    'upper': ([string]) => (typeof string === 'string' ? string.toUpperCase() : null),
    'year': ([datetime]) => (datetime instanceof Date ? datetime.getFullYear() : null)
};


// The built-in script functions
export const scriptFunctions = {
    // Array functions
    'arrayCopy': ([array]) => (Array.isArray(array) ? [...array] : null),
    'arrayGet': ([array, index]) => (Array.isArray(array) ? array[index] ?? null : null),
    'arrayIndexOf': ([array, value, index = 0]) => (Array.isArray(array) ? array.indexOf(value, index) : null),
    'arrayJoin': ([array, sep]) => (Array.isArray(array) ? array.join(sep) : null),
    'arrayLastIndexOf': ([array, value, index = null]) => (
        Array.isArray(array) ? (index === null ? array.lastIndexOf(value) : array.lastIndexOf(value, index)) : null
    ),
    'arrayLength': ([array]) => (Array.isArray(array) ? array.length : null),
    'arrayNew': (args) => args,
    'arrayNewSize': ([size = 0, value = 0]) => new Array(size).fill(value),
    'arrayPop': ([array]) => (Array.isArray(array) ? array.pop() : null),
    'arrayPush': ([array, ...values]) => (Array.isArray(array) ? array.push(...values) : null),
    'arraySet': ([array, index, value]) => {
        if (Array.isArray(array)) {
            array[index] = value;
        }
    },
    'arraySlice': ([array, start, end]) => (Array.isArray(array) ? array.slice(start, end) : null),
    'arraySort': ([array, compareFn = null], options) => (
        Array.isArray(array) ? (compareFn === null ? array.sort() : array.sort((...args) => compareFn(args, options))) : null
    ),

    // Debug functions
    'debugLog': ([string], options) => {
        if (options !== null && 'logFn' in options) {
            options.logFn(string);
        }
    },

    // Fetch
    'fetch': async ([url, init = null, isText = false], options) => {
        const fetchFn = (options !== null && 'fetchFn' in options ? options.fetchFn : null);

        // Response helper function
        const responseFn = (response) => {
            let errorMessage = (response !== null && !response.ok ? response.statusText : null);
            if (response !== null && response.ok) {
                try {
                    return isText ? response.text() : response.json();
                } catch ({message}) {
                    errorMessage = message;
                }
            }

            // Failure
            if (options !== null && 'logFn' in options) {
                options.logFn(`Error: fetch failed for ${isText ? 'text' : 'JSON'} resource "${url}"` +
                              `${errorMessage !== null ? `with error: ${errorMessage}` : ''}`);
            }
            return null;
        };

        // Array of URLs?
        if (Array.isArray(url)) {
            const responses = await Promise.all(url.map((fURL) => {
                const actualURL = (options !== null && 'urlFn' in options ? options.urlFn(fURL) : fURL);
                return (fetchFn !== null ? fetchFn(actualURL, init) : null);
            }));
            return Promise.all(responses.map(responseFn));
        }

        // Single URL
        const actualURL = (options !== null && 'urlFn' in options ? options.urlFn(url) : url);
        const response = (fetchFn !== null ? await fetchFn(actualURL, init) : null);
        return responseFn(response);
    },

    // JSON functions
    'jsonParse': ([string], options) => {
        try {
            return JSON.parse(string);
        } catch ({message}) {
            if (options !== null && 'logFn' in options) {
                options.logFn(`Error: jsonParse failed with error: ${message}`);
            }
            return null;
        }
    },
    'jsonStringify': ([value, space]) => JSON.stringify(value, null, space),

    // Object functions
    'objectCopy': ([obj]) => (obj !== null && typeof obj === 'object' ? {...obj} : null),
    'objectDelete': ([obj, key]) => (obj !== null && typeof obj === 'object' ? delete obj[key] : null),
    'objectGet': ([obj, key]) => (obj !== null && typeof obj === 'object' ? obj[key] ?? null : null),
    'objectKeys': ([obj]) => (obj !== null && typeof obj === 'object' ? Object.keys(obj) : null),
    'objectNew': (args) => {
        const obj = {};
        for (let ix = 0; ix < args.length; ix += 2) {
            obj[args[ix]] = (ix + 1 < args.length ? args[ix + 1] : null);
        }
        return obj;
    },
    'objectSet': ([obj, key, value]) => {
        if (obj !== null && typeof obj === 'object') {
            obj[key] = value;
        }
    },

    // Regular expression functions
    'regexEscape': ([string]) => (typeof string === 'string' ? string.replace(reRegexEscape, '\\$&') : null),
    'regexMatch': ([regex, string]) => (typeof string === 'string' ? string.match(regex) : null),
    'regexMatchAll': ([regex, string]) => (typeof string === 'string' ? Array.from(string.matchAll(regex)) : null),
    'regexNew': ([pattern, flags]) => new RegExp(pattern, flags),
    'regexTest': ([regex, string]) => (regex instanceof RegExp ? regex.test(string) : null),

    // String functions
    'split': ([string, separator, limit]) => (typeof string === 'string' ? string.split(separator, limit) : null)
};


// Regex escape regular expression
const reRegexEscape = /[.*+?^${}()|[\]\\]/g;
