// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import {validateType} from 'schema-markdown/lib/schema.js';


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
            valueCopy[valueKey] = valueJSONSort(value[valueKey]);
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
    if (value === null || type === 'undefined') {
        return false;
    } else if (type === 'string') {
        return value !== '';
    } else if (type === 'boolean') {
        return value;
    } else if (type === 'number') {
        return value !== 0;
    } else if (value instanceof Date) {
        return true;
    } else if (Array.isArray(value)) {
        return value.length !== 0;
    }

    // Everything else is true
    return true;
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
    for (let ix = 0; ix < fnArgsLength; ix++) {
        const fnArg = fnArgs[ix];
        const {'type': argType = null, 'default': argDefault = null, lastArgArray = false} = fnArg;

        // Missing argument?
        if (ix >= args.length) {
            // Last argument array?
            if (lastArgArray) {
                args.push([]);
                continue;
            }

            // Argument default?
            if (argDefault !== null) {
                args.push(argDefault);
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
        if (lastArgArray) {
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
            const {integer = false, lt = null, lte = null, gt = null, gte = null} = fnArg;
            if ((integer && Math.floor(argValue) !== argValue) ||
                (lt !== null && !(argValue < lt)) ||
                (lte !== null && !(argValue <= lte)) ||
                (gt !== null && !(argValue > gt)) ||
                (gte !== null && !(argValue >= gte))) {
                throw new ValueArgsError(fnArg.name, argValue, errorReturnValue);
            }
        }
    }

    // Extra arguments?
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
 * @returns {Object[]} The validated function arguments model
 * @ignore
 */
export function valueArgsModel(fnArgs) {
    validateType(valueArgsTypes, 'FunctionArguments', fnArgs);

    // Use nullable instead of default-null
    for (const fnArg of fnArgs) {
        if (fnArg.default === null) {
            throw Error(`Argument "${fnArg.name}" has default value of null - use nullable instead`);
        }
    }

    return fnArgs;
}


// Function arguments type model
const valueArgsTypes = parseSchemaMarkdown(`\
# A function arguments model
typedef FunctionArgument[len > 0] FunctionArguments


# A function argument model
struct FunctionArgument

    # The argument name
    string name

    # The argument type
    optional FunctionArgumentType type

    # If true, the argument may be null
    optional bool nullable

    # The default argument value
    optional any default

    # If true, this argument is the array of remaining arguments
    optional bool lastArgArray

    # If true, the number argument must be an integer
    optional bool integer

    # The number argument must be less-than
    optional any lt

    # The number argument must be less-than-or-equal-to
    optional any lte

    # The number argument must be greater-than
    optional any gt

    # The number argument must be greater-than-or-equal-to
    optional any gte


# The function argument types
enum FunctionArgumentType
    array
    boolean
    datetime
    function
    number
    object
    regex
    string
`);


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
    return Number.parseFloat(text);
}


const rNumber = /^\s*[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?\s*$/;


/**
 * Parse an integer string
 *
 * @param {string} text - The string to parse as an integer
 * @param {number} radix - The integer's radix (2 - 36). Default is 10.
 * @returns {number|null}: A number value or null if parsing fails
 * @ignore
 */
export function valueParseInteger(text, radix = 10) {
    if (!rInteger.test(text)) {
        return null;
    }
    return Number.parseInt(text, radix);
}


const rInteger = /^\s*[-+]?\d+\s*$/;


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
        return new Date(year, month - 1, day);
    } else if (rDatetime.test(text)) {
        return new Date(text);
    }
    return null;
}


const rDate = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;
const rDatetime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
