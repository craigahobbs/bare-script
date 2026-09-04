// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE


/**
 * Get a value's type string
 *
 * @param value - The value
 * @returns {string} The type string ('array', 'boolean', 'datetime', 'function', 'null', 'number', 'object', 'regex', 'string')
 * @ignore
 */
export function valueType(value) {
    const type = typeof value;
    if (value === null || type === 'undefined') {
        return 'null';
    } else if (type === 'string') {
        return 'string';
    } else if (type === 'boolean') {
        return 'boolean';
    } else if (type === 'number') {
        return 'number';
    } else if (value instanceof Date) {
        return 'datetime';
    } else if (Array.isArray(value)) {
        return 'array';
    } else if (value instanceof RegExp) {
        return 'regex';
    } else if (type === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        return 'object';
    } else if (type === 'function') {
        return 'function';
    }

    // Unknown value type
    return null;
}


/**
 * Get a value's string representation
 *
 * @param value - The value
 * @returns {string} The value as a string
 * @ignore
 */
export function valueString(value) {
    const type = typeof value;
    if (value === null || type === 'undefined') {
        return 'null';
    } else if (type === 'string') {
        return value;
    } else if (type === 'boolean') {
        return value ? 'true' : 'false';
    } else if (type === 'number') {
        return `${value}`;
    } else if (value instanceof Date) {
        const year = String(value.getFullYear()).padStart(4, '0');
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        const hour = String(value.getHours()).padStart(2, '0');
        const minute = String(value.getMinutes()).padStart(2, '0');
        const second = String(value.getSeconds()).padStart(2, '0');
        const millisecond = value.getMilliseconds() === 0 ? '' : `.${String(value.getMilliseconds()).padStart(3, '0')}`;
        const tzOffset = value.getTimezoneOffset();
        /* c8 ignore next */
        const tzSign = tzOffset < 0 ? '+' : '-';
        const tzHour = Math.floor(Math.abs(tzOffset) / 60);
        /* c8 ignore next */
        const tzHourStr = String(tzHour).padStart(2, '0');
        const tzMinute = Math.abs(tzOffset) - tzHour * 60;
        /* c8 ignore next */
        const tzMinuteStr = String(tzMinute).padStart(2, '0');
        return `${year}-${month}-${day}T${hour}:${minute}:${second}${millisecond}${tzSign}${tzHourStr}:${tzMinuteStr}`;
    } else if (Array.isArray(value)) {
        return valueJSON(value);
    } else if (value instanceof RegExp) {
        return '<regex>';
    } else if (type === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        return valueJSON(value);
    } else if (type === 'function') {
        return '<function>';
    }

    // Unknown value type
    return '<unknown>';
}


/**
 * Get a value's JSON string representation
 *
 * @param value - The value
 * @param {number} indent - The JSON indent
 * @returns {string} The value as a JSON string
 * @ignore
 */
export function valueJSON(value, indent = null) {
    return JSON.stringify(valueJSONSort(value), null, indent);
}


function valueJSONSort(value) {
    const type = typeof value;
    if (value === null || type === 'undefined' || type === 'string' || type === 'boolean' || type === 'number') {
        return value;
    } else if (value instanceof Date) {
        return valueString(value);
    } else if (Array.isArray(value)) {
        return value.map(valueJSONSort);
    } else if (type === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        const valueCopy = {};
        for (const valueKey of Object.keys(value).sort()) {
            valueObjectSet(valueCopy, valueKey, valueJSONSort(value[valueKey]));
        }
        return valueCopy;
    } else if (type === 'function') {
        return valueString(value);
    }

    // Everything else is null
    return null;
}


/**
 * Interpret the value as a boolean
 *
 * @param value - The value
 * @returns {boolean} The value as a boolean
 * @ignore
 */
export function valueBoolean(value) {
    const type = typeof value;
    if (type === 'boolean') {
        return value;
    } else if (type === 'string') {
        return value !== '';
    } else if (type === 'number') {
        return value !== 0;
    } else if (Array.isArray(value)) {
        return value.length !== 0;
    }

    // Everything else non-null is true
    return (value ?? null) !== null;
}


/**
 * Test if one value is the same object as another
 *
 * @param value1 - The first value
 * @param value2 - The second value
 * @returns {boolean} true if values are the same object, false otherwise
 * @ignore
 */
export function valueIs(value1, value2) {
    if (value1 instanceof RegExp && value2 instanceof RegExp) {
        return value1 === value2 || value1.source === value2.source;
    }
    return value1 === value2;
}


/**
 * Compare two values
 *
 * @param left - The left value
 * @param right - The right value
 * @returns {number} -1 if the left value is less than the right value, 0 if equal, and 1 if greater than
 * @ignore
 */
export function valueCompare(left, right) {
    const leftType = typeof left;
    const rightType = typeof right;
    if (left === null || leftType === 'undefined') {
        return right === null || rightType === 'undefined' ? 0 : -1;
    } else if (right === null || rightType === 'undefined') {
        return 1;
    } else if (leftType === 'string' && rightType === 'string') {
        return left < right ? -1 : (left === right ? 0 : 1);
    } else if (leftType === 'number' && rightType === 'number') {
        return left < right ? -1 : (left === right ? 0 : 1);
    } else if (leftType === 'boolean' && rightType === 'boolean') {
        return left < right ? -1 : (left === right ? 0 : 1);
    } else if (left instanceof Date && right instanceof Date) {
        return left < right ? -1 : (left > right ? 1 : 0);
    } else if (Array.isArray(left) && Array.isArray(right)) {
        const ixEnd = Math.min(left.length, right.length);
        for (let ix = 0; ix < ixEnd; ix++) {
            const itemCompare = valueCompare(left[ix], right[ix]);
            if (itemCompare !== 0) {
                return itemCompare;
            }
        }
        return left.length < right.length ? -1 : (left.length === right.length ? 0 : 1);
    } else if (leftType === 'object' && Object.getPrototypeOf(left) === Object.prototype &&
               rightType === 'object' && Object.getPrototypeOf(right) === Object.prototype) {
        const leftKeyValues = Object.entries(left).sort((kv1, kv2) => kv1[0] < kv2[0] ? -1 : 1);
        const rightKeyValues = Object.entries(right).sort((kv1, kv2) => kv1[0] < kv2[0] ? -1 : 1);
        const ixMax = Math.min(leftKeyValues.length, rightKeyValues.length);
        for (let ix = 0; ix < ixMax; ix++) {
            const keyCompare = valueCompare(leftKeyValues[ix][0], rightKeyValues[ix][0]);
            if (keyCompare !== 0) {
                return keyCompare;
            }
            const valCompare = valueCompare(leftKeyValues[ix][1], rightKeyValues[ix][1]);
            if (valCompare !== 0) {
                return valCompare;
            }
        }
        return leftKeyValues.length < rightKeyValues.length ? -1 : (leftKeyValues.length === rightKeyValues.length ? 0 : 1);
    }

    // Invalid comparison - compare by type name
    const leftValueType = valueType(left) ?? 'unknown';
    const rightValueType = valueType(right) ?? 'unknown';
    return leftValueType < rightValueType ? -1 : (leftValueType === rightValueType ? 0 : 1);
}


//
// Function arguments validation
//


/**
 * Validate a function's arguments
 *
 * @param {Object[]} fnArgs - The function arguments model
 * @param {Array} args - The function arguments
 * @param {*} [errorReturnValue = null] - The function's return value on error
 * @returns {Array} The validated function arguments
 * @ignore
 */
export function valueArgsValidate(fnArgs, args, errorReturnValue = null) {
    const fnArgsLength = fnArgs.length;
    const argsLength = args.length;
    for (let ix = 0; ix < fnArgsLength; ix++) {
        const fnArg = fnArgs[ix];
        const argType = fnArg.type;

        // Missing argument?
        if (ix >= argsLength) {
            // Last argument array?
            if (fnArg.lastArgArray) {
                args.push([]);
                continue;
            }

            // Argument default?
            if (fnArg.default !== null) {
                args.push(fnArg.default);
                continue;
            }

            // Boolean argument?
            if (argType === 'boolean') {
                args.push(false);
                continue;
            }

            // Argument nullable?
            if (argType === null || fnArg.nullable) {
                args.push(null);
                continue;
            }

            // Invalid null value...
            throw new ValueArgsError(fnArg.name, null, errorReturnValue);
        }

        // Last arg array?
        if (fnArg.lastArgArray) {
            args.push(args.splice(ix));
            continue;
        }

        // Any type OK?
        if (argType === null) {
            continue;
        }

        // Boolean argument?
        const argValue = args[ix];
        if (argType === 'boolean') {
            args[ix] = valueBoolean(argValue);
            continue;
        }

        // Null value?
        const argValueType = typeof argValue;
        if (argValue === null || argValueType === 'undefined') {
            // Argument nullable?
            if (!fnArg.nullable) {
                throw new ValueArgsError(fnArg.name, argValue, errorReturnValue);
            }
            continue;
        }

        // Invalid value?
        if ((argType === 'number' && argValueType !== 'number') ||
            (argType === 'string' && argValueType !== 'string') ||
            (argType === 'array' && !Array.isArray(argValue)) ||
            (argType === 'object' && !(argValueType === 'object' && Object.getPrototypeOf(argValue) === Object.prototype)) ||
            (argType === 'datetime' && !(argValue instanceof Date)) ||
            (argType === 'regex' && !(argValue instanceof RegExp)) ||
            (argType === 'function' && argValueType !== 'function')
           ) {
            throw new ValueArgsError(fnArg.name, argValue, errorReturnValue);
        }

        // Number constraints
        if (argType === 'number') {
            if ((fnArg.integer && Math.floor(argValue) !== argValue) ||
                (fnArg.lt !== null && !(argValue < fnArg.lt)) ||
                (fnArg.lte !== null && !(argValue <= fnArg.lte)) ||
                (fnArg.gt !== null && !(argValue > fnArg.gt)) ||
                (fnArg.gte !== null && !(argValue >= fnArg.gte))) {
                throw new ValueArgsError(fnArg.name, argValue, errorReturnValue);
            }
        }
    }

    // Extra arguments? (a last-argument array collapses the extra arguments, so re-read the length)
    if (args.length > fnArgsLength) {
        throw new ValueArgsError(null, args.length, errorReturnValue);
    }

    return args;
}


/**
 * A function arguments validation error
 *
 * @extends {Error}
 * @property {*} returnValue - The function's error return value
 * @ignore
 */
export class ValueArgsError extends Error {
    /**
     * Create a BareScript runtime error
     *
     * @param {string} argName - The function argument name. If `arg_name` is null, there are too many arguments,
     *     and `arg_value` is the number of arguments.
     * @param {*} argValue - The function argument value
     * @param {*} [returnValue = null] - The function's error return value
     */
    constructor(argName, argValue, returnValue = null) {
        let message;
        if (argName === null) {
            message = `Too many arguments (${valueJSON(argValue)})`;
        } else {
            message = `Invalid "${argName}" argument value, ${valueJSON(argValue)}`;
        }
        super(message);
        this.name = this.constructor.name;
        this.returnValue = returnValue;
    }
}


/**
 * Validate a function arguments model
 *
 * @param {Object[]} fnArgs - The function arguments model
 * @returns {Object[]} The validated function arguments model - each argument model is normalized to have every
 *     member so that valueArgsValidate reads a single object shape
 * @ignore
 */
export function valueArgsModel(fnArgs) {
    return fnArgs.map((fnArg) => {
        // Use nullable instead of default-null
        if (fnArg.default === null) {
            throw Error(`Argument "${fnArg.name}" has default value of null - use nullable instead`);
        }
        return {
            'name': fnArg.name,
            'type': fnArg.type ?? null,
            'default': fnArg.default ?? null,
            'nullable': fnArg.nullable ?? false,
            'lastArgArray': fnArg.lastArgArray ?? false,
            'integer': fnArg.integer ?? false,
            'lt': fnArg.lt ?? null,
            'lte': fnArg.lte ?? null,
            'gt': fnArg.gt ?? null,
            'gte': fnArg.gte ?? null
        };
    });
}


//
// Number value functions
//


/**
 * Round a number
 *
 * @param {number} value - The number to round
 * @param {number} digits - The number of digits of precision
 * @returns {number} The rounded number
 * @ignore
 */
export function valueRoundNumber(value, digits) {
    const multiplier = 10 ** digits;
    return Math.round(value * multiplier) / multiplier;
}


/**
 * Parse a number string
 *
 * @param {string} text - The string to parse as a number
 * @returns {number|null}: A number value or null if parsing fails
 * @ignore
 */
export function valueParseNumber(text) {
    if (!rNumber.test(text)) {
        return null;
    }
    const value = Number.parseFloat(text);
    if (!isFinite(value)) {
        return null;
    }
    return value;
}


const rNumber = /^\s*[-+]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][-+]?[0-9]+)?\s*$/;


/**
 * Parse an integer string
 *
 * @param {string} text - The string to parse as an integer
 * @param {number} radix - The integer's radix (2 - 36). Default is 10.
 * @returns {number|null}: A number value or null if parsing fails
 * @ignore
 */
export function valueParseInteger(text, radix = 10) {
    if (valueType(radix) !== 'number' || Math.floor(radix) !== radix || radix < 2 || radix > 36 ||
        !valueParseIntegerRegexMap[String(radix)].test(text)) {
        return null;
    }
    return Number.parseInt(text, radix);
}


// Helper to create the integer-string regex for a radix (2 - 36) - digits, then letters for radix > 10
function valueParseIntegerRegex(radix) {
    const letterMax = radix - 11;
    const digits = (radix <= 10 ? `0-${radix - 1}`
        : `0-9A-${String.fromCharCode('A'.charCodeAt(0) + letterMax)}a-${String.fromCharCode('a'.charCodeAt(0) + letterMax)}`);
    return new RegExp(`^\\s*[-+]?[${digits}]+\\s*$`);
}


const valueParseIntegerRegexMap = Object.fromEntries(
    Array.from({'length': 35}, (unused, ixRadix) => [String(ixRadix + 2), valueParseIntegerRegex(ixRadix + 2)])
);


//
// Datetime value functions
//


/**
 * Parse a datetime string
 *
 * @param {string} text - The string to parse as a datetime
 * @returns {Date|null} A datetime value or null if parsing fails
 * @ignore
 */
export function valueParseDatetime(text) {
    const mDate = text.match(rDate);
    if (mDate !== null) {
        const year = Number.parseInt(mDate.groups.year, 10);
        const month = Number.parseInt(mDate.groups.month, 10);
        const day = Number.parseInt(mDate.groups.day, 10);

        // Return null for rolled-over date components, as in the Python implementation
        const value = new Date(year, month - 1, day);
        value.setFullYear(year);
        if (value.getMonth() !== month - 1 || value.getDate() !== day) {
            return null;
        }
        return value;
    } else if (rDatetime.test(text)) {
        // Return null for rolled-over date components, as in the Python implementation
        const year = Number.parseInt(text.slice(0, 4), 10);
        const month = Number.parseInt(text.slice(5, 7), 10);
        const day = Number.parseInt(text.slice(8, 10), 10);
        if (day > new Date(Date.UTC(year, month, 0)).getUTCDate()) {
            return null;
        }
        const value = new Date(text);
        return isNaN(value.getTime()) ? null : value;
    }
    return null;
}


const rDate = /^(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})$/;
const rDatetime = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,6})?(?:Z|[+-][0-9]{2}:[0-9]{2})$/;


//
// Object value functions
//


/**
 * Set an object key's value. This is an optional part of the value interface, present only in
 * host languages that need special key handling - in JavaScript, assigning "__proto__" would set
 * the object's prototype, so it is defined as an own key instead. (The Python implementation has
 * no equivalent; a plain dict assignment suffices there.)
 *
 * @param {Object} object - The object
 * @param {string} key - The key
 * @param {*} value - The value
 * @ignore
 */
export function valueObjectSet(object, key, value) {
    if (key === '__proto__') {
        Object.defineProperty(object, key, {'value': value, 'configurable': true, 'enumerable': true, 'writable': true});
    } else {
        object[key] = value;
    }
}
