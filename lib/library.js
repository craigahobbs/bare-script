// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE


/* eslint-disable id-length */


// The default maximum statements for executeScript
export const defaultMaxStatements = 1e7;


// The built-in script functions
export const scriptFunctions = {
    //
    // Array functions
    //

    // $function: arrayCopy
    // $group: Array
    // $doc: Create a copy of an array
    // $arg array: The array to copy
    // $return: A copy of the array
    'arrayCopy': ([array]) => (Array.isArray(array) ? [...array] : null),

    // $function: arrayGet
    // $group: Array
    // $doc: Get an array element
    // $arg array: The array
    // $arg index: The array element's index
    // $return: The array element
    'arrayGet': ([array, index]) => (Array.isArray(array) ? array[index] ?? null : null),

    // $function: arrayIndexOf
    // $group: Array
    // $doc: Find the index of a value in the array
    // $arg array: TODO
    // $arg value: TODO
    // $arg index: TODO = 0
    // $return: TODO
    'arrayIndexOf': ([array, value, index = 0]) => (Array.isArray(array) ? array.indexOf(value, index) : null),

    // $function: arrayJoin
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $arg sep: TODO
    // $return: TODO
    'arrayJoin': ([array, sep]) => (Array.isArray(array) ? array.join(sep) : null),

    // $function: arrayLastIndexOf
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $arg value: TODO
    // $arg index: TODO = null
    // $return: TODO
    'arrayLastIndexOf': ([array, value, index = null]) => (
        Array.isArray(array) ? (index === null ? array.lastIndexOf(value) : array.lastIndexOf(value, index)) : null
    ),

    // $function: arrayLength
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $return: TODO
    'arrayLength': ([array]) => (Array.isArray(array) ? array.length : null),

    // $function: arrayNew
    // $group: Array
    // $doc: TODO
    // $arg args: TODO
    // $return: TODO
    'arrayNew': (args) => args,

    // $function: arrayNewSize
    // $group: Array
    // $doc: TODO
    // $arg size: TODO = 0
    // $arg value: TODO = 0
    // $return: TODO
    'arrayNewSize': ([size = 0, value = 0]) => new Array(size).fill(value),

    // $function: arrayPop
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $return: TODO
    'arrayPop': ([array]) => (Array.isArray(array) ? array.pop() : null),

    // $function: arrayPush
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $arg values: TODO
    // $return: TODO
    'arrayPush': ([array, ...values]) => (Array.isArray(array) ? array.push(...values) : null),

    // $function: arraySet
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $arg index: TODO
    // $arg value: TODO
    // $return: TODO
    'arraySet': ([array, index, value]) => {
        if (Array.isArray(array)) {
            array[index] = value;
        }
    },

    // $function: arraySlice
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $arg start: TODO
    // $arg end: TODO
    // $return: TODO
    'arraySlice': ([array, start, end]) => (Array.isArray(array) ? array.slice(start, end) : null),

    // $function: arraySort
    // $group: Array
    // $doc: TODO
    // $arg array: TODO
    // $arg compareFn: TODO = null
    // $return: TODO
    'arraySort': ([array, compareFn = null], options) => (
        Array.isArray(array) ? (compareFn === null ? array.sort() : array.sort((...args) => compareFn(args, options))) : null
    ),


    //
    // Datetime functions
    //

    // $function: datetimeDate
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeDate': ([year, month, day]) => new Date(year, month - 1, day),

    // $function: datetimeDay
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeDay': ([datetime]) => (datetime instanceof Date ? datetime.getDate() : null),

    // $function: datetimeHour
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeHour': ([datetime]) => (datetime instanceof Date ? datetime.getHours() : null),

    // $function: datetimeMinute
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeMinute': ([datetime]) => (datetime instanceof Date ? datetime.getMinutes() : null),

    // $function: datetimeMonth
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeMonth': ([datetime]) => (datetime instanceof Date ? datetime.getMonth() + 1 : null),

    // $function: datetimeNow
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeNow': () => new Date(),

    // $function: datetimeSecond
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeSecond': ([datetime]) => (datetime instanceof Date ? datetime.getSeconds() : null),

    // $function: datetimeToday
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeToday': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },

    // $function: datetimeYear
    // $group: Datetime
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'datetimeYear': ([datetime]) => (datetime instanceof Date ? datetime.getFullYear() : null),


    //
    // JSON functions
    //

    // $function: jsonParse
    // $group: JSON
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
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

    // $function: jsonStringify
    // $group: JSON
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'jsonStringify': ([value, space]) => JSON.stringify(value, null, space),


    //
    // Math functions
    //

    // $function: mathAbs
    // $group: Math
    // $doc: Compute the absolute value of a number
    // $arg x: A number
    // $return: The absolute value of the number
    'mathAbs': ([x]) => Math.abs(x),

    // $function: mathAcos
    // $group: Math
    // $doc: Compute the arccosine (in radians) of a number
    // $arg x: A number
    // $return: The arccosine (in radians) of the number
    'mathAcos': ([x]) => Math.acos(x),

    // $function: mathAsin
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathAsin': ([x]) => Math.asin(x),

    // $function: mathAtan
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathAtan': ([x]) => Math.atan(x),

    // $function: mathAtan2
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathAtan2': ([y, x]) => Math.atan2(y, x),

    // $function: mathCeil
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathCeil': ([x]) => Math.ceil(x),

    // $function: mathCos
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathCos': ([x]) => Math.cos(x),

    // $function: mathFloor
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathFloor': ([x]) => Math.floor(x),

    // $function: mathLn
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathLn': ([x]) => Math.log(x),

    // $function: mathLog
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathLog': ([x, base = 10]) => Math.log(x) / Math.log(base),

    // $function: mathMax
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathMax': (args) => Math.max(...args),

    // $function: mathMin
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathMin': (args) => Math.min(...args),

    // $function: mathPi
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathPi': () => Math.PI,

    // $function: mathRandom
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathRandom': () => Math.random(),

    // $function: mathRound
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathRound': ([x, digits = 0]) => {
        const multiplier = 10 ** digits;
        return Math.round(x * multiplier) / multiplier;
    },

    // $function: mathSign
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathSign': ([x]) => Math.sign(x),

    // $function: mathSin
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathSin': ([x]) => Math.sin(x),

    // $function: mathSqrt
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathSqrt': ([x]) => Math.sqrt(x),

    // $function: mathTan
    // $group: Math
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'mathTan': ([x]) => Math.tan(x),


    //
    // Miscellaneous functions
    //

    // $function: debugLog
    // $group: Miscellaneous
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'debugLog': ([string], options) => {
        if (options !== null && 'logFn' in options) {
            options.logFn(string);
        }
    },

    // $function: fetch
    // $group: Miscellaneous
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
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

    // $function: typeof
    // $group: Miscellaneous
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'typeof': ([value]) => typeof value,


    //
    // Number functions
    //

    // $function: numberToFixed
    // $group: Number
    // $doc: TODO
    // $arg x: A number
    // $arg digits: TODO
    // $return: TODO
    'numberToFixed': ([x, digits = 2]) => (typeof x === 'number' ? x.toFixed(digits) : null),

    // $function: numberParseInt
    // $group: Number
    // $doc: TODO
    // $arg string: TODO
    // $arg radix: TODO
    // $return: TODO
    'numberParseInt': ([string, radix = 10]) => Number.parseInt(string, radix),

    // $function: numberParseFloat
    // $group: Number
    // $doc: TODO
    // $arg x: A number
    // $return: TODO
    'numberParseFloat': ([string]) => Number.parseFloat(string),


    //
    // Object functions
    //

    // $function: objectCopy
    // $group: Object
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'objectCopy': ([obj]) => (obj !== null && typeof obj === 'object' ? {...obj} : null),

    // $function: objectDelete
    // $group: Object
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'objectDelete': ([obj, key]) => (obj !== null && typeof obj === 'object' ? delete obj[key] : null),

    // $function: objectGet
    // $group: Object
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'objectGet': ([obj, key]) => (obj !== null && typeof obj === 'object' ? obj[key] ?? null : null),

    // $function: objectKeys
    // $group: Object
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'objectKeys': ([obj]) => (obj !== null && typeof obj === 'object' ? Object.keys(obj) : null),

    // $function: objectNew
    // $group: Object
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'objectNew': (args) => {
        const obj = {};
        for (let ix = 0; ix < args.length; ix += 2) {
            obj[args[ix]] = (ix + 1 < args.length ? args[ix + 1] : null);
        }
        return obj;
    },

    // $function: objectSet
    // $group: Object
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'objectSet': ([obj, key, value]) => {
        if (obj !== null && typeof obj === 'object') {
            obj[key] = value;
        }
    },


    //
    // Regular expression functions
    //

    // $function: regexEscape
    // $group: Regex
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'regexEscape': ([string]) => (typeof string === 'string' ? string.replace(reRegexEscape, '\\$&') : null),

    // $function: regexMatch
    // $group: Regex
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'regexMatch': ([regex, string]) => (typeof string === 'string' ? string.match(regex) : null),

    // $function: regexMatchAll
    // $group: Regex
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'regexMatchAll': ([regex, string]) => (typeof string === 'string' ? Array.from(string.matchAll(regex)) : null),

    // $function: regexNew
    // $group: Regex
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'regexNew': ([pattern, flags]) => new RegExp(pattern, flags),

    // $function: regexTest
    // $group: Regex
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'regexTest': ([regex, string]) => (regex instanceof RegExp ? regex.test(string) : null),


    //
    // String functions
    //

    // $function: stringSplit
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringSplit': ([string, separator, limit]) => (typeof string === 'string' ? string.split(separator, limit) : null),

    // $function: stringCharCodeAt
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringCharCodeAt': ([string, index]) => (typeof string === 'string' ? string.charCodeAt(index) : null),

    // $function: stringEncodeURL
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringEncodeURL': ([uriComponent]) => encodeURIComponent(uriComponent),

    // $function: stringEndsWith
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringEndsWith': ([string, searchString]) => (typeof string === 'string' ? string.endsWith(searchString) : null),

    // $function: stringFromCharCode
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringFromCharCode': (args) => String.fromCharCode(...args),

    // $function: stringIndexOf
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringIndexOf': ([string, searchString, position]) => (typeof string === 'string' ? string.indexOf(searchString, position) : null),

    // $function: stringLastIndexOf
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringLastIndexOf': ([string, searchString, position]) => (
        typeof string === 'string' ? string.lastIndexOf(searchString, position) : null
    ),

    // $function: stringLength
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringLength': ([string]) => (typeof string === 'string' ? string.length : null),

    // $function: stringLower
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringLower': ([string]) => (typeof string === 'string' ? string.toLowerCase() : null),

    // $function: stringNew
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringNew': ([value]) => `${value}`,

    // $function: stringReplace
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
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

    // $function: stringRepeat
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringRepeat': ([string, count]) => (typeof string === 'string' ? string.repeat(count) : null),

    // $function: stringSlice
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringSlice': ([string, beginIndex, endIndex]) => (typeof string === 'string' ? string.slice(beginIndex, endIndex) : null),

    // $function: stringStartsWith
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringStartsWith': ([string, searchString]) => (typeof string === 'string' ? string.startsWith(searchString) : null),

    // $function: stringTrim
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringTrim': ([string]) => (typeof string === 'string' ? string.trim() : null),

    // $function: stringUpper
    // $group: String
    // $doc: TODO
    // $arg TODO: TODO
    // $return: TODO
    'stringUpper': ([string]) => (typeof string === 'string' ? string.toUpperCase() : null)
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
