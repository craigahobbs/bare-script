// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/library */


// The default maximum statements for executeScript
export const defaultMaxStatements = 1e7;


// The built-in expression functions
export const expressionFunctions = {
    'abs': ([number]) => Math.abs(number),
    'acos': ([number]) => Math.acos(number),
    'asin': ([number]) => Math.asin(number),
    'atan': ([number]) => Math.atan(number),
    'atan2': ([number]) => Math.atan2(number),
    'ceil': ([number]) => Math.ceil(number),
    'charCodeAt': ([text, index]) => text.charCodeAt(index),
    'cos': ([number]) => Math.cos(number),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': ([datetime]) => datetime.getDate(),
    'encodeURIComponent': ([text]) => encodeURIComponent(text),
    'endsWith': ([text, searchText]) => text.endsWith(searchText),
    'indexOf': ([text, findText, index]) => text.indexOf(findText, index),
    'fixed': ([number, decimals = 2]) => number.toFixed(decimals),
    'floor': ([number]) => Math.floor(number),
    'fromCharCode': (args) => String.fromCharCode(...args),
    'hour': ([datetime]) => datetime.getHours(),
    'lastIndexOf': ([text, findText, index]) => text.lastIndexOf(findText, index),
    'len': ([text]) => text.length,
    'lower': ([text]) => text.toLowerCase(),
    'ln': ([number]) => Math.log(number),
    'log': ([number, base = 10]) => Math.log(number) / Math.log(base),
    'log10': ([number]) => Math.log10(number),
    'max': (args) => Math.max(...args),
    'min': (args) => Math.min(...args),
    'minute': ([datetime]) => datetime.getMinutes(),
    'month': ([datetime]) => datetime.getMonth() + 1,
    'now': () => new Date(),
    'pi': () => Math.PI,
    'rand': () => Math.random(),
    'replace': ([text, oldText, newText]) => text.replaceAll(oldText, newText),
    'rept': ([text, count]) => text.repeat(count),
    'round': ([number, digits]) => {
        const multiplier = 10 ** digits;
        return Math.round(number * multiplier) / multiplier;
    },
    'second': ([datetime]) => datetime.getSeconds(),
    'sign': ([number]) => Math.sign(number),
    'sin': ([number]) => Math.sin(number),
    'slice': ([text, beginIndex, endIndex]) => text.slice(beginIndex, endIndex),
    'sqrt': ([number]) => Math.sqrt(number),
    'startsWith': ([text, searchText]) => text.startsWith(searchText),
    'text': ([value]) => `${value}`,
    'tan': ([number]) => Math.tan(number),
    'today': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    'trim': ([text]) => text.trim(),
    'typeof': ([obj]) => typeof obj,
    'upper': ([text]) => text.toUpperCase(),
    'value': ([text]) => parseFloat(text),
    'year': ([datetime]) => datetime.getFullYear()
};


// The built-in script functions
export const scriptFunctions = {
    // Array functions
    'arrayCopy': ([array]) => [...array],
    'arrayGet': ([array, index]) => array[index],
    'arrayIndexOf': ([array, value, index = 0]) => array.indexOf(value, index),
    'arrayJoin': ([array, sep]) => array.join(sep),
    'arrayLastIndexOf': ([array, value, index = 0]) => array.lastIndexOf(value, index),
    'arrayLength': ([array]) => array.length,
    'arrayNew': (args) => args,
    'arrayNewSize': ([size = 0, value = 0]) => new Array(size).fill(value),
    'arrayPop': ([array]) => array.pop(),
    'arrayPush': ([array, ...values]) => array.push(...values),
    'arraySet': ([array, index, value]) => {
        array[index] = value;
    },
    'arraySlice': ([array, start, end]) => array.slice(start, end),

    // Debug functions
    'debugLog': ([text], options) => {
        if (options !== null && 'logFn' in options) {
            options.logFn(text);
        }
    },

    // Fetch
    'fetch': async ([url, init = null, isText = false], options) => {
        const fetchFn = (options !== null && 'fetchFn' in options ? options.fetchFn : null);

        // Response helper function
        const responseFn = (response) => (
            response !== null && response.ok ? (isText ? response.text() : response.json()) : null
        );

        // Array of URLs?
        if (Array.isArray(url)) {
            const responses = await Promise.all(url.map((fURL) => (fetchFn !== null ? fetchFn(fURL, init) : null)));
            return Promise.all(responses.map(responseFn));
        }

        // Single URL
        const response = (fetchFn !== null ? await fetchFn(url, init) : null);
        return (response !== null ? responseFn(response) : null);
    },

    // JSON functions
    'jsonParse': ([text]) => JSON.parse(text),
    'jsonStringify': ([obj, space]) => JSON.stringify(obj, null, space),

    // Object functions
    'objectCopy': ([obj]) => ({...obj}),
    'objectDelete': ([obj, key]) => delete obj[key],
    'objectGet': ([obj, key]) => obj[key] ?? null,
    'objectKeys': ([obj]) => Object.keys(obj),
    'objectNew': (args) => {
        const obj = {};
        for (let ix = 0; ix < args.length; ix += 2) {
            obj[args[ix]] = (ix + 1 < args.length ? args[ix + 1] : null);
        }
        return obj;
    },
    'objectSet': ([obj, key, value]) => {
        obj[key] = value;
    },

    // String functions
    'split': ([text, sep]) => text.split(sep)
};
