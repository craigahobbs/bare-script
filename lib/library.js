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
    'cos': ([number]) => Math.cos(number),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': ([datetime]) => datetime.getDate(),
    'encodeURIComponent': ([text]) => encodeURIComponent(text),
    'indexOf': ([text, findText, index]) => text.indexOf(findText, index),
    'fixed': ([number, decimals = 2]) => number.toFixed(decimals),
    'floor': ([number]) => Math.floor(number),
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
    'arrayLength': ([array]) => array.length,
    'arrayNew': ([size = 0, value = 0]) => {
        const array = [];
        for (let ix = 0; ix < size; ix++) {
            array.push(value);
        }
        return array;
    },
    'arrayNewArgs': (args) => args,
    'arrayPush': ([array, ...values]) => array.push(...values),
    'arraySet': ([array, index, value]) => {
        array[index] = value;
    },
    'arraySize': ([size = 0, value = 0]) => new Array(size).fill(value),
    'arraySlice': ([array, start, end]) => array.slice(start, end),

    // Debug functions
    'debugLog': ([text], options) => {
        if (options !== null && 'logFn' in options) {
            options.logFn(text);
        }
    },

    // Fetch
    'fetch': async ([url, fetchOptions = null], options) => {
        const {fetchFn} = options;
        const isText = fetchOptions !== null && (fetchOptions.type === 'text' || fetchOptions.type === 'xml');

        // Array of URLs?
        if (Array.isArray(url)) {
            const responses = await Promise.all(url.map((fetchURL) => (fetchFn ? fetchFn(fetchURL) : null)));
            // eslint-disable-next-line require-await
            return Promise.all(responses.map(async (response) => (
                response !== null && response.ok ? (isText ? response.text() : response.json()) : null
            )));
        }

        // Single URL
        const response = fetchFn ? await fetchFn(url) : null;
        return response !== null && response.ok ? (isText ? response.text() : response.json()) : null;
    },

    // JSON functions
    'jsonParse': ([text]) => {
        try {
            return JSON.parse(text);
        } catch (error) {
            return null;
        }
    },
    'jsonStringify': ([obj, space]) => {
        try {
            return JSON.stringify(obj, null, space);
        } catch (error) {
            return null;
        }
    },

    // Object functions
    'objectCopy': ([obj]) => ({...obj}),
    'objectDelete': ([obj, key]) => {
        delete obj[key];
    },
    'objectGet': ([obj, key]) => obj[key],
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
