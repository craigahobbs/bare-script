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
    // $return: The array copy
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
    // $arg array: The array
    // $arg value: The value to find in the array
    // $arg index: Optional (default is 0). The index at which to start the search.
    // $return: The first index of the value in the array; -1 if not found.
    'arrayIndexOf': ([array, value, index = 0]) => (Array.isArray(array) ? array.indexOf(value, index) : null),

    // $function: arrayJoin
    // $group: Array
    // $doc: Join an array with a separator string
    // $arg array: The array
    // $arg separator: The separator string
    // $return: The joined string
    'arrayJoin': ([array, separator]) => (Array.isArray(array) ? array.join(separator) : null),

    // $function: arrayLastIndexOf
    // $group: Array
    // $doc: Find the last index of a value in the array
    // $arg array: The array
    // $arg value: The value to find in the array
    // $arg index: Optional (default is the end of the array). The index at which to start the search.
    // $return: The last index of the value in the array; -1 if not found.
    'arrayLastIndexOf': ([array, value, index = null]) => (
        Array.isArray(array) ? (index === null ? array.lastIndexOf(value) : array.lastIndexOf(value, index)) : null
    ),

    // $function: arrayLength
    // $group: Array
    // $doc: Get the length of an array
    // $arg array: The array
    // $return: The array's length
    'arrayLength': ([array]) => (Array.isArray(array) ? array.length : null),

    // $function: arrayNew
    // $group: Array
    // $doc: Create a new array
    // $arg args: The new array's values
    // $return: The new array
    'arrayNew': (args) => args,

    // $function: arrayNewSize
    // $group: Array
    // $doc: Create a new array of a specific size
    // $arg size: Optional (default is 0). The new array's size.
    // $arg value: Optional (default is 0). The value with which to fill the new array.
    // $return: The new array
    'arrayNewSize': ([size = 0, value = 0]) => new Array(size).fill(value),

    // $function: arrayPop
    // $group: Array
    // $doc: Remove the last element of the array and return it
    // $arg array: The array
    // $return: The last element of the array; null if the array is empty.
    'arrayPop': ([array]) => (Array.isArray(array) ? array.pop() ?? null : null),

    // $function: arrayPush
    // $group: Array
    // $doc: Add one or more values to the end of the array
    // $arg array: The array
    // $arg values: The values to add to the end of the array
    // $return: The new length of the array
    'arrayPush': ([array, ...values]) => (Array.isArray(array) ? array.push(...values) : null),

    // $function: arraySet
    // $group: Array
    // $doc: Set an array element value
    // $arg array: The array
    // $arg index: The index of the element to set
    // $arg value: The value to set
    // $return: The value to set
    'arraySet': ([array, index, value]) => {
        if (Array.isArray(array)) {
            array[index] = value;
            return value;
        }
        return null;
    },

    // $function: arraySlice
    // $group: Array
    // $doc: Copy a portion of an array
    // $arg array: The array
    // $arg start: Optional (default is 0). The start index of the slice.
    // $arg end: Optional (default is the end of the array). The end index of the slice.
    // $return: The new array slice
    'arraySlice': ([array, start, end]) => (Array.isArray(array) ? array.slice(start, end) : null),

    // $function: arraySort
    // $group: Array
    // $doc: Sort an array
    // $arg array: The array
    // $arg compareFn: Optional (default is null). The comparison function.
    // $return: The sorted array
    'arraySort': ([array, compareFn = null], options) => (
        Array.isArray(array) ? (compareFn === null ? array.sort() : array.sort((...args) => compareFn(args, options))) : null
    ),


    //
    // Datetime functions
    //

    // $function: datetimeDay
    // $group: Datetime
    // $doc: Get the day of the month of the datetime
    // $arg datetime: The datetime
    // $return: The day of the month
    'datetimeDay': ([datetime]) => (datetime instanceof Date ? datetime.getDate() : null),

    // $function: datetimeHour
    // $group: Datetime
    // $doc: Get the hour of the datetime
    // $arg datetime: The datetime
    // $return: The hour
    'datetimeHour': ([datetime]) => (datetime instanceof Date ? datetime.getHours() : null),

    // $function: datetimeMinute
    // $group: Datetime
    // $doc: Get the number of minutes of a datetime
    // $arg datetime: The datetime
    // $return: The number of minutes
    'datetimeMinute': ([datetime]) => (datetime instanceof Date ? datetime.getMinutes() : null),

    // $function: datetimeMonth
    // $group: Datetime
    // $doc: Get the number of the month of a datetime
    // $arg datetime: The datetime
    // $return: The number of the month
    'datetimeMonth': ([datetime]) => (datetime instanceof Date ? datetime.getMonth() + 1 : null),

    // $function: datetimeNew
    // $group: Datetime
    // $doc: Create a new datetime
    // $arg year: The full year
    // $arg month: The month (1-12)
    // $arg day: The day of the month
    // $arg hours: Optional (default is 0). The hour (0-23)
    // $arg minutes: Optional (default is 0). The number of minutes.
    // $arg seconds: Optional (default is 0). The number of seconds.
    // $arg milliseconds: Optional (default is 0). The number of milliseconds.
    // $return: The new datetime
    'datetimeNew': ([year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0]) => (
        new Date(year, month - 1, day, hours, minutes, seconds, milliseconds)
    ),

    // $function: datetimeNow
    // $group: Datetime
    // $doc: Get the current datetime
    // $return: The current datetime
    'datetimeNow': () => new Date(),

    // $function: datetimeSecond
    // $group: Datetime
    // $doc: Get the number of seconds of a datetime
    // $arg datetime: The datetime
    // $return: The number of seconds
    'datetimeSecond': ([datetime]) => (datetime instanceof Date ? datetime.getSeconds() : null),

    // $function: datetimeToday
    // $group: Datetime
    // $doc: Get today's datetime
    // $return: Today's datetime
    'datetimeToday': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },

    // $function: datetimeYear
    // $group: Datetime
    // $doc: Get the full year of a datetime
    // $arg datetime: The datetime
    // $return: The full year
    'datetimeYear': ([datetime]) => (datetime instanceof Date ? datetime.getFullYear() : null),


    //
    // JSON functions
    //

    // $function: jsonParse
    // $group: JSON
    // $doc: Convert a JSON string to an object
    // $arg string: The JSON string
    // $return: The object
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
    // $doc: Convert an object to a JSON string
    // $arg value: The object
    // $arg space: Optional (default is null). The indentation string or number.
    // $return: The JSON string
    'jsonStringify': ([value, space]) => JSON.stringify(value, null, space),


    //
    // Math functions
    //

    // $function: mathAbs
    // $group: Math
    // $doc: Compute the absolute value of a number
    // $arg x: The number
    // $return: The absolute value of the number
    'mathAbs': ([x]) => Math.abs(x),

    // $function: mathAcos
    // $group: Math
    // $doc: Compute the arccosine, in radians, of a number
    // $arg x: The number
    // $return: The arccosine, in radians, of the number
    'mathAcos': ([x]) => Math.acos(x),

    // $function: mathAsin
    // $group: Math
    // $doc: Compute the arcsine, in radians, of a number
    // $arg x: The number
    // $return: The arcsine, in radians, of the number
    'mathAsin': ([x]) => Math.asin(x),

    // $function: mathAtan
    // $group: Math
    // $doc: Compute the arctangent, in radians, of a number
    // $arg x: The number
    // $return: The arctangent, in radians, of the number
    'mathAtan': ([x]) => Math.atan(x),

    // $function: mathAtan2
    // $group: Math
    // $doc: Compute the angle, in radians, between (0, 0) and a point
    // $arg y: The Y-coordinate of the point
    // $arg x: The X-coordinate of the point
    // $return: The angle, in radians
    'mathAtan2': ([y, x]) => Math.atan2(y, x),

    // $function: mathCeil
    // $group: Math
    // $doc: Compute the ceiling of a number (round up to the next highest integer)
    // $arg x: The number
    // $return: The ceiling of the number
    'mathCeil': ([x]) => Math.ceil(x),

    // $function: mathCos
    // $group: Math
    // $doc: Compute the cosine of the angle, in radians
    // $arg x: The angle, in radians
    // $return: The cosine of the angle
    'mathCos': ([x]) => Math.cos(x),

    // $function: mathFloor
    // $group: Math
    // $doc: Compute the floor of a number (round down to the next lowest integer)
    // $arg x: The number
    // $return: The floor of the number
    'mathFloor': ([x]) => Math.floor(x),

    // $function: mathLn
    // $group: Math
    // $doc: Compute the natural logarithm (base e) of a number
    // $arg x: The number
    // $return: The natural logarithm of the number
    'mathLn': ([x]) => Math.log(x),

    // $function: mathLog
    // $group: Math
    // $doc: Compute the logarithm (base 10) of a number
    // $arg x: The number
    // $return: The logarithm of the number
    'mathLog': ([x, base = 10]) => Math.log(x) / Math.log(base),

    // $function: mathMax
    // $group: Math
    // $doc: Compute the maximum value of all arguments
    // $arg values: All arguments
    // $return: The maximum value
    'mathMax': (values) => Math.max(...values),

    // $function: mathMin
    // $group: Math
    // $doc: Compute the minimum value of all arguments
    // $arg values: All arguments
    // $return: The minimum value
    'mathMin': (values) => Math.min(...values),

    // $function: mathPi
    // $group: Math
    // $doc: Return the number pi
    // $return: The number pi
    'mathPi': () => Math.PI,

    // $function: mathRandom
    // $group: Math
    // $doc: Return a random number between 0 and 1, inclusive
    // $return: A random number
    'mathRandom': () => Math.random(),

    // $function: mathRound
    // $group: Math
    // $doc: Round a number to a certain number of decimal places
    // $arg x: The number
    // $arg digits: Optional (default is 0). The number of decimal digits to round to.
    // $return: The rounded number
    'mathRound': ([x, digits = 0]) => {
        const multiplier = 10 ** digits;
        return Math.round(x * multiplier) / multiplier;
    },

    // $function: mathSign
    // $group: Math
    // $doc: Compute the sign of a number
    // $arg x: The number
    // $return: -1 for a negative number, 1 for a positive number, and 0 for zero
    'mathSign': ([x]) => Math.sign(x),

    // $function: mathSin
    // $group: Math
    // $doc: Compute the sine of the angle, in radians
    // $arg x: The angle, in radians
    // $return: The sine of the angle
    'mathSin': ([x]) => Math.sin(x),

    // $function: mathSqrt
    // $group: Math
    // $doc: Compute the square root of a number
    // $arg x: The number
    // $return: The square root of the number
    'mathSqrt': ([x]) => Math.sqrt(x),

    // $function: mathTan
    // $group: Math
    // $doc: Compute the tangent of the angle, in radians
    // $arg x: The angle, in radians
    // $return: The tangent of the angle
    'mathTan': ([x]) => Math.tan(x),


    //
    // Miscellaneous functions
    //

    // $function: debugLog
    // $group: Miscellaneous
    // $doc: Log a debug message
    // $arg string: The message
    'debugLog': ([string], options) => {
        if (options !== null && 'logFn' in options) {
            options.logFn(string);
        }
    },

    // $function: fetch
    // $group: Miscellaneous
    // $doc: Retrieve a remote JSON or text resource
    // $arg url: The resource URL or array of URLs
    // $arg options: Optional (default is null). [The fetch options](https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters).
    // $arg isText: Optional (default is false). If true, retrieve the resource as text.
    // $return: The resource object/string or array of objects/strings; null if an error occured.
    'fetch': async ([url, fetchOptions = null, isText = false], options) => {
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
                return (fetchFn !== null ? fetchFn(actualURL, fetchOptions) : null);
            }));
            return Promise.all(responses.map(responseFn));
        }

        // Single URL
        const actualURL = (options !== null && 'urlFn' in options ? options.urlFn(url) : url);
        const response = (fetchFn !== null ? await fetchFn(actualURL, fetchOptions) : null);
        return responseFn(response);
    },


    //
    // Number functions
    //

    // $function: numberParseInt
    // $group: Number
    // $doc: Parse a string as an integer
    // $arg string: The string
    // $arg radix: Optional (default is 10). The number base.
    // $return: The integer
    'numberParseInt': ([string, radix = 10]) => Number.parseInt(string, radix),

    // $function: numberParseFloat
    // $group: Number
    // $doc: Parse a string as a floating point number
    // $arg string: The string
    // $return: The number
    'numberParseFloat': ([string]) => Number.parseFloat(string),

    // $function: numberToFixed
    // $group: Number
    // $doc: Format a number using fixed-point notation
    // $arg x: The number
    // $arg digits: The number of digits to appear after the decimal point
    // $return: The fixed-point notation string
    'numberToFixed': ([x, digits = 2]) => (typeof x === 'number' ? x.toFixed(digits) : null),


    //
    // Object functions
    //

    // $function: objectCopy
    // $group: Object
    // $doc: Create a copy of an object
    // $arg object: The object to copy
    // $return: The object copy
    'objectCopy': ([object]) => (object !== null && typeof object === 'object' ? {...object} : null),

    // $function: objectDelete
    // $group: Object
    // $doc: Delete an object key
    // $arg object: The object
    // $arg key: The key to delete
    'objectDelete': ([object, key]) => {
        if (object !== null && typeof object === 'object') {
            delete object[key];
        }
    },

    // $function: objectGet
    // $group: Object
    // $doc: Get an object key's value
    // $arg object: The object
    // $arg key: The value's key
    // $return: The value or null if the key does not exist
    'objectGet': ([object, key]) => (object !== null && typeof object === 'object' ? object[key] ?? null : null),

    // $function: objectKeys
    // $group: Object
    // $doc: Get an object's keys
    // $arg object: The object
    // $return: The array of keys
    'objectKeys': ([object]) => (object !== null && typeof object === 'object' ? Object.keys(object) : null),

    // $function: objectNew
    // $group: Object
    // $doc: Create a new object
    // $arg keyValues: The object's initial key and value arguments
    // $return: The new object
    'objectNew': (keyValues) => {
        const object = {};
        for (let ix = 0; ix < keyValues.length; ix += 2) {
            object[keyValues[ix]] = (ix + 1 < keyValues.length ? keyValues[ix + 1] : null);
        }
        return object;
    },

    // $function: objectSet
    // $group: Object
    // $doc: Set an object key's value
    // $arg object: The object
    // $arg key: The key
    // $arg value: The value to set
    // $return: The value to set
    'objectSet': ([object, key, value]) => {
        if (object !== null && typeof object === 'object') {
            object[key] = value;
            return value;
        }
        return null;
    },


    //
    // Regular expression functions
    //

    // $function: regexEscape
    // $group: Regex
    // $doc: Escape a string for use in a regular expression
    // $arg string: The string to escape
    // $return: The escaped string
    'regexEscape': ([string]) => (typeof string === 'string' ? string.replace(reRegexEscape, '\\$&') : null),

    // $function: regexMatch
    // $group: Regex
    // $doc: Find the first match of a regular expression in a string
    // $arg regex: The regular expression
    // $arg string: The string
    // $return: The match object or null
    'regexMatch': ([regex, string]) => (typeof string === 'string' ? string.match(regex) : null),

    // $function: regexMatchAll
    // $group: Regex
    // $doc: Find all matches of regular expression in a string
    // $arg regex: The regular expression
    // $arg string: The string
    // $return: The match object array
    'regexMatchAll': ([regex, string]) => (typeof string === 'string' ? Array.from(string.matchAll(regex)) : null),

    // $function: regexNew
    // $group: Regex
    // $doc: Create a regular expression
    // $arg pattern: The regular expression pattern string
    // eslint-disable-next-line max-len
    // $arg flags: The [regular expression flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags)
    // $return: The regular expression or null if the pattern is invalid
    'regexNew': ([pattern, flags]) => new RegExp(pattern, flags),

    // $function: regexTest
    // $group: Regex
    // $doc: Test if a regular expression matches a string
    // $arg regex: The regular expression
    // $arg string: The string
    // $return: true if the regular expression matches, false otherwise
    'regexTest': ([regex, string]) => (regex instanceof RegExp ? regex.test(string) : null),


    //
    // String functions
    //

    // $function: stringCharCodeAt
    // $group: String
    // $doc: Get the character code for the character at a specific string index
    // $arg string: The string
    // $arg index: The character index
    // $return: The character code
    'stringCharCodeAt': ([string, index]) => (typeof string === 'string' ? string.charCodeAt(index) : null),

    // $function: stringEncodeURL
    // $group: String
    // $doc: Encode a string for use in a URL
    // $arg uriComponent: The URI component string
    // $return: The encoded string
    'stringEncodeURL': ([uriComponent]) => encodeURIComponent(uriComponent),

    // $function: stringEndsWith
    // $group: String
    // $doc: Determine if a string ends with a search string
    // $arg string: The string
    // $arg searchString: The search string
    // $return: true if the string ends with the search string, false otherwise
    'stringEndsWith': ([string, searchString]) => (typeof string === 'string' ? string.endsWith(searchString) : null),

    // $function: stringFromCharCode
    // $group: String
    // $doc: Create a string from the character code arguments
    // $arg charCodes: The character codes
    // $return: The string created from the character codes
    'stringFromCharCode': (charCodes) => String.fromCharCode(...charCodes),

    // $function: stringIndexOf
    // $group: String
    // $doc: Find the first index of a search string in a string
    // $arg string: The string
    // $arg searchString: The search string
    // $arg index: Optional (default is 0). The index at which to start the search.
    // $return: The first index of the search string; -1 if not found.
    'stringIndexOf': ([string, searchString, index]) => (typeof string === 'string' ? string.indexOf(searchString, index) : null),

    // $function: stringLastIndexOf
    // $group: String
    // $doc: Find the last index of a search string in a string
    // $arg string: The string
    // $arg searchString: The search string
    // $arg index: Optional (default is the end of the string). The index at which to start the search.
    // $return: The last index of the search string; -1 if not found.
    'stringLastIndexOf': ([string, searchString, index]) => (
        typeof string === 'string' ? string.lastIndexOf(searchString, index) : null
    ),

    // $function: stringLength
    // $group: String
    // $doc: Get the length of a string
    // $arg string: The string
    // $return: The string's length
    'stringLength': ([string]) => (typeof string === 'string' ? string.length : null),

    // $function: stringLower
    // $group: String
    // $doc: Convert a string to lower-case
    // $arg string: The string
    // $return: The lower-case string
    'stringLower': ([string]) => (typeof string === 'string' ? string.toLowerCase() : null),

    // $function: stringNew
    // $group: String
    // $doc: Create a new string from a value
    // $arg value: The value
    // $return: The value string
    'stringNew': ([value]) => `${value}`,

    // $function: stringRepeat
    // $group: String
    // $doc: Repeat a string
    // $arg string: The string to repeat
    // $arg count: The number of times to repeat the string
    // $return: The repeated string
    'stringRepeat': ([string, count]) => (typeof string === 'string' ? string.repeat(count) : null),

    // $function: stringReplace
    // $group: String
    // $doc: Replace all instances of a string with another string
    // $arg string: The string to update
    // $arg substr: The string to replace
    // $arg newSubstr: The replacement string
    // $return: The updated string
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

    // $function: stringSlice
    // $group: String
    // $doc: Copy a portion of a string
    // $arg string: The string
    // $arg start: Optional (default is 0). The start index of the slice.
    // $arg end: Optional (default is the end of the string). The end index of the slice.
    // $return: The new string slice
    'stringSlice': ([string, beginIndex, endIndex]) => (typeof string === 'string' ? string.slice(beginIndex, endIndex) : null),

    // $function: stringSplit
    // $group: String
    // $doc: Split a string
    // $arg string: The string to split
    // $arg separator: The separator string or regular expression
    // $arg limit: The maximum number of strings to split into
    // $return: The array of split-out strings
    'stringSplit': ([string, separator, limit]) => (typeof string === 'string' ? string.split(separator, limit) : null),

    // $function: stringStartsWith
    // $group: String
    // $doc: Determine if a string starts with a search string
    // $arg string: The string
    // $arg searchString: The search string
    // $return: true if the string starts with the search string, false otherwise
    'stringStartsWith': ([string, searchString]) => (typeof string === 'string' ? string.startsWith(searchString) : null),

    // $function: stringTrim
    // $group: String
    // $doc: Trim the whitespace from the beginning and end of a string
    // $arg string: The string
    // $return: The trimmed string
    'stringTrim': ([string]) => (typeof string === 'string' ? string.trim() : null),

    // $function: stringUpper
    // $group: String
    // $doc: Convert a string to upper-case
    // $arg string: The string
    // $return: The upper-case string
    'stringUpper': ([string]) => (typeof string === 'string' ? string.toUpperCase() : null)
};


// Regex escape regular expression
const reRegexEscape = /[.*+?^${}()|[\]\\]/g;


// The built-in expression function name script function name map
export const expressionFunctionMap = {
    'abs': 'mathAbs',
    'acos': 'mathAcos',
    'asin': 'mathAsin',
    'atan': 'mathAtan',
    'atan2': 'mathAtan2',
    'ceil': 'mathCeil',
    'charCodeAt': 'stringCharCodeAt',
    'cos': 'mathCos',
    'date': 'datetimeNew',
    'day': 'datetimeDay',
    'encodeURL': 'stringEncodeURL',
    'endsWith': 'stringEndsWith',
    'indexOf': 'stringIndexOf',
    'fixed': 'numberToFixed',
    'floor': 'mathFloor',
    'fromCharCode': 'stringFromCharCode',
    'hour': 'datetimeHour',
    'lastIndexOf': 'stringLastIndexOf',
    'len': 'stringLength',
    'lower': 'stringLower',
    'ln': 'mathLn',
    'log': 'mathLog',
    'max': 'mathMax',
    'min': 'mathMin',
    'minute': 'datetimeMinute',
    'month': 'datetimeMonth',
    'now': 'datetimeNow',
    'parseInt': 'numberParseInt',
    'parseFloat': 'numberParseFloat',
    'pi': 'mathPi',
    'rand': 'mathRandom',
    'replace': 'stringReplace',
    'rept': 'stringRepeat',
    'round': 'mathRound',
    'second': 'datetimeSecond',
    'sign': 'mathSign',
    'sin': 'mathSin',
    'slice': 'stringSlice',
    'sqrt': 'mathSqrt',
    'startsWith': 'stringStartsWith',
    'text': 'stringNew',
    'tan': 'mathTan',
    'today': 'datetimeToday',
    'trim': 'stringTrim',
    'upper': 'stringUpper',
    'year': 'datetimeYear'
};


// The built-in expression functions
export const expressionFunctions = Object.fromEntries(Object.entries(expressionFunctionMap).map(
    ([exprFnName, scriptFnName]) => [exprFnName, scriptFunctions[scriptFnName]]
));
