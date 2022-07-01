// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/* eslint-disable id-length */


// The default maximum statements for executeScript
export const defaultMaxStatements = 1e7;


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

    // Datetime functions
    'datetimeDate': ([year, month, day]) => new Date(year, month - 1, day),
    'datetimeDay': ([datetime]) => (datetime instanceof Date ? datetime.getDate() : null),
    'datetimeHour': ([datetime]) => (datetime instanceof Date ? datetime.getHours() : null),
    'datetimeMinute': ([datetime]) => (datetime instanceof Date ? datetime.getMinutes() : null),
    'datetimeMonth': ([datetime]) => (datetime instanceof Date ? datetime.getMonth() + 1 : null),
    'datetimeNow': () => new Date(),
    'datetimeSecond': ([datetime]) => (datetime instanceof Date ? datetime.getSeconds() : null),
    'datetimeToday': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    'datetimeYear': ([datetime]) => (datetime instanceof Date ? datetime.getFullYear() : null),

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
        const responseFn = async (response) => {
            let errorMessage = (response !== null && !response.ok ? response.statusText : null);
            if (response !== null && response.ok) {
                try {
                    return isText ? await response.text() : await response.json();
                } catch ({message}) {
                    errorMessage = message;
                }
            }

            // Failure
            if (options !== null && 'logFn' in options) {
                options.logFn(`Error: fetch failed for ${isText ? 'text' : 'JSON'} resource "${url}"` +
                              `${errorMessage !== null ? ` with error: ${errorMessage}` : ''}`);
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

    // Math functions
    'mathAbs': ([x]) => Math.abs(x),
    'mathAcos': ([x]) => Math.acos(x),
    'mathAsin': ([x]) => Math.asin(x),
    'mathAtan': ([x]) => Math.atan(x),
    'mathAtan2': ([y, x]) => Math.atan2(y, x),
    'mathCeil': ([x]) => Math.ceil(x),
    'mathCos': ([x]) => Math.cos(x),
    'mathFloor': ([x]) => Math.floor(x),
    'mathLn': ([x]) => Math.log(x),
    'mathLog': ([x, base = 10]) => Math.log(x) / Math.log(base),
    'mathMax': (args) => Math.max(...args),
    'mathMin': (args) => Math.min(...args),
    'mathPi': () => Math.PI,
    'mathRandom': () => Math.random(),
    'mathRound': ([x, digits = 0]) => {
        const multiplier = 10 ** digits;
        return Math.round(x * multiplier) / multiplier;
    },
    'mathSign': ([x]) => Math.sign(x),
    'mathSin': ([x]) => Math.sin(x),
    'mathSqrt': ([x]) => Math.sqrt(x),
    'mathTan': ([x]) => Math.tan(x),

    // Number functions
    'numberToFixed': ([x, digits = 2]) => (typeof x === 'number' ? x.toFixed(digits) : null),
    'numberParseInt': ([string, radix = 10]) => Number.parseInt(string, radix),
    'numberParseFloat': ([string]) => Number.parseFloat(string),

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
    'stringSplit': ([string, separator, limit]) => (typeof string === 'string' ? string.split(separator, limit) : null),
    'stringCharCodeAt': ([string, index]) => (typeof string === 'string' ? string.charCodeAt(index) : null),
    'stringEncodeURL': ([uriComponent]) => encodeURIComponent(uriComponent),
    'stringEndsWith': ([string, searchString]) => (typeof string === 'string' ? string.endsWith(searchString) : null),
    'stringFromCharCode': (args) => String.fromCharCode(...args),
    'stringIndexOf': ([string, searchString, position]) => (typeof string === 'string' ? string.indexOf(searchString, position) : null),
    'stringLastIndexOf': ([string, searchString, position]) => (
        typeof string === 'string' ? string.lastIndexOf(searchString, position) : null
    ),
    'stringLength': ([string]) => (typeof string === 'string' ? string.length : null),
    'stringLower': ([string]) => (typeof string === 'string' ? string.toLowerCase() : null),
    'stringNew': ([value]) => `${value}`,
    'stringReplace': ([string, substr, newSubstr], options) => {
        if (typeof string !== 'string') {
            return null;
        }
        if (typeof newSubstr === 'function') {
            const replacerFunction = (...args) => newSubstr(args, options);
            return string.replaceAll(substr, replacerFunction);
        }
        return string.replaceAll(substr, newSubstr);
    },
    'stringRepeat': ([string, count]) => (typeof string === 'string' ? string.repeat(count) : null),
    'stringSlice': ([string, beginIndex, endIndex]) => (typeof string === 'string' ? string.slice(beginIndex, endIndex) : null),
    'stringStartsWith': ([string, searchString]) => (typeof string === 'string' ? string.startsWith(searchString) : null),
    'stringTrim': ([string]) => (typeof string === 'string' ? string.trim() : null),
    'stringUpper': ([string]) => (typeof string === 'string' ? string.toUpperCase() : null),

    // Type functions
    'typeof': ([value]) => typeof value
};


// Regex escape regular expression
const reRegexEscape = /[.*+?^${}()|[\]\\]/g;


// The built-in expression functions
export const expressionFunctions = {
    'abs': scriptFunctions.mathAbs,
    'acos': scriptFunctions.mathAcos,
    'asin': scriptFunctions.mathAsin,
    'atan': scriptFunctions.mathAtan,
    'atan2': scriptFunctions.mathAtan2,
    'ceil': scriptFunctions.mathCeil,
    'charCodeAt': scriptFunctions.stringCharCodeAt,
    'cos': scriptFunctions.mathCos,
    'date': scriptFunctions.datetimeDate,
    'day': scriptFunctions.datetimeDay,
    'encodeURL': scriptFunctions.stringEncodeURL,
    'endsWith': scriptFunctions.stringEndsWith,
    'indexOf': scriptFunctions.stringIndexOf,
    'fixed': scriptFunctions.numberToFixed,
    'floor': scriptFunctions.mathFloor,
    'fromCharCode': scriptFunctions.stringFromCharCode,
    'hour': scriptFunctions.datetimeHour,
    'lastIndexOf': scriptFunctions.stringLastIndexOf,
    'len': scriptFunctions.stringLength,
    'lower': scriptFunctions.stringLower,
    'ln': scriptFunctions.mathLn,
    'log': scriptFunctions.mathLog,
    'max': scriptFunctions.mathMax,
    'min': scriptFunctions.mathMin,
    'minute': scriptFunctions.datetimeMinute,
    'month': scriptFunctions.datetimeMonth,
    'now': scriptFunctions.datetimeNow,
    'parseInt': scriptFunctions.numberParseInt,
    'parseFloat': scriptFunctions.numberParseFloat,
    'pi': scriptFunctions.mathPi,
    'rand': scriptFunctions.mathRandom,
    'replace': scriptFunctions.stringReplace,
    'rept': scriptFunctions.stringRepeat,
    'round': scriptFunctions.mathRound,
    'second': scriptFunctions.datetimeSecond,
    'sign': scriptFunctions.mathSign,
    'sin': scriptFunctions.mathSin,
    'slice': scriptFunctions.stringSlice,
    'sqrt': scriptFunctions.mathSqrt,
    'startsWith': scriptFunctions.stringStartsWith,
    'text': scriptFunctions.stringNew,
    'tan': scriptFunctions.mathTan,
    'today': scriptFunctions.datetimeToday,
    'trim': scriptFunctions.stringTrim,
    'typeof': scriptFunctions.typeof,
    'upper': scriptFunctions.stringUpper,
    'year': scriptFunctions.datetimeYear
};
