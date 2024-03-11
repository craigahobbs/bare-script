// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {
    addCalculatedField, aggregateData, filterData, joinData, parseCSV, sortData, topData, validateData
} from './data.js';
import {validateType, validateTypeModel} from 'schema-markdown/lib/schema.js';
import {
    valueBoolean, valueCompare, valueIs, valueJSON, valueParseDatetime, valueParseInteger, valueParseNumber, valueString, valueType
} from './value.js';
import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import {typeModel} from 'schema-markdown/lib/typeModel.js';


/* eslint-disable id-length */


// The default maximum statements for executeScript
export const defaultMaxStatements = 1e9;


//
// Array functions
//


// $function: arrayCopy
// $group: Array
// $doc: Create a copy of an array
// $arg array: The array to copy
// $return: The array copy
function arrayCopy([array = null]) {
    if (valueType(array) !== 'array') {
        return null;
    }

    return [...array];
}


// $function: arrayExtend
// $group: Array
// $doc: Extend one array with another
// $arg array: The array to extend
// $arg array2: The array to extend with
// $return: The extended array
function arrayExtend([array = null, array2 = null]) {
    if (valueType(array) !== 'array' || valueType(array2) !== 'array') {
        return null;
    }

    array.push(...array2);
    return array;
}


// $function: arrayGet
// $group: Array
// $doc: Get an array element
// $arg array: The array
// $arg index: The array element's index
// $return: The array element
function arrayGet([array = null, index = null]) {
    if (valueType(array) !== 'array' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0 || index >= array.length) {
        return null;
    }

    return array[index];
}


// $function: arrayIndexOf
// $group: Array
// $doc: Find the index of a value in an array
// $arg array: The array
// $arg value: The value to find in the array, or a match function, f(value) -> bool
// $arg index: Optional (default is 0). The index at which to start the search.
// $return: The first index of the value in the array; -1 if not found.
function arrayIndexOf([array = null, value = null, index = 0], options) {
    if (valueType(array) !== 'array' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0 || index >= array.length) {
        return -1;
    }

    if (valueType(value) === 'function') {
        for (let ix = index; ix < array.length; ix += 1) {
            if (valueBoolean(value([array[ix]], options))) {
                return ix;
            }
        }
    }

    return array.indexOf(value, index);
}


// $function: arrayJoin
// $group: Array
// $doc: Join an array with a separator string
// $arg array: The array
// $arg separator: The separator string
// $return: The joined string
function arrayJoin([array = null, separator = null]) {
    if (valueType(array) !== 'array' || valueType(separator) !== 'string') {
        return null;
    }

    return array.map((value) => valueString(value)).join(separator);
}


// $function: arrayLastIndexOf
// $group: Array
// $doc: Find the last index of a value in an array
// $arg array: The array
// $arg value: The value to find in the array, or a match function, f(value) -> bool
// $arg index: Optional (default is the end of the array). The index at which to start the search.
// $return: The last index of the value in the array; -1 if not found.
function arrayLastIndexOf([array = null, value = null, indexArg = null], options) {
    let index = indexArg;
    if (valueType(array) === 'array' && index === null) {
        index = array.length - 1;
    }
    if (valueType(array) !== 'array' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0 || index >= array.length) {
        return -1;
    }

    if (valueType(value) === 'function') {
        for (let ix = index; ix >= 0; ix -= 1) {
            if (valueBoolean(value([array[ix]], options))) {
                return ix;
            }
        }
    }

    return array.lastIndexOf(value, index);
}


// $function: arrayLength
// $group: Array
// $doc: Get the length of an array
// $arg array: The array
// $return: The array's length; zero if not an array
function arrayLength([array = null]) {
    if (valueType(array) !== 'array') {
        return 0;
    }

    return array.length;
}


// $function: arrayNew
// $group: Array
// $doc: Create a new array
// $arg values...: The new array's values
// $return: The new array
function arrayNew(values) {
    return values;
}


// $function: arrayNewSize
// $group: Array
// $doc: Create a new array of a specific size
// $arg size: Optional (default is 0). The new array's size.
// $arg value: Optional (default is 0). The value with which to fill the new array.
// $return: The new array
function arrayNewSize([size = 0, value = 0]) {
    if (valueType(size) !== 'number' || Math.floor(size) !== size || size < 0) {
        return null;
    }

    return new Array(size).fill(value);
}


// $function: arrayPop
// $group: Array
// $doc: Remove the last element of the array and return it
// $arg array: The array
// $return: The last element of the array; null if the array is empty.
function arrayPop([array = null]) {
    if (valueType(array) !== 'array' || array.length === 0) {
        return null;
    }

    return array.pop();
}


// $function: arrayPush
// $group: Array
// $doc: Add one or more values to the end of the array
// $arg array: The array
// $arg values...: The values to add to the end of the array
// $return: The array
function arrayPush([array = null, ...values]) {
    if (valueType(array) !== 'array') {
        return null;
    }

    array.push(...values);
    return array;
}


// $function: arraySet
// $group: Array
// $doc: Set an array element value
// $arg array: The array
// $arg index: The index of the element to set
// $arg value: The value to set
// $return: The value
function arraySet([array = null, index = null, value = null]) {
    if (valueType(array) !== 'array' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0 || index >= array.length) {
        return null;
    }

    array[index] = value;
    return value;
}


// $function: arrayShift
// $group: Array
// $doc: Remove the first element of the array and return it
// $arg array: The array
// $return: The first element of the array; null if the array is empty.
function arrayShift([array = null]) {
    if (valueType(array) !== 'array' || array.length === 0) {
        return null;
    }

    return array.shift();
}


// $function: arraySlice
// $group: Array
// $doc: Copy a portion of an array
// $arg array: The array
// $arg start: Optional (default is 0). The start index of the slice.
// $arg end: Optional (default is the end of the array). The end index of the slice.
// $return: The new array slice
function arraySlice([array = null, start = 0, endArg = null]) {
    let end = endArg;
    if (valueType(array) === 'array' && end === null) {
        end = array.length;
    }
    if (valueType(array) !== 'array' ||
        valueType(start) !== 'number' || Math.floor(start) !== start || start < 0 || start > array.length ||
        valueType(end) !== 'number' || Math.floor(end) !== end || end < 0 || end > array.length) {
        return null;
    }

    return array.slice(start, end);
}


// $function: arraySort
// $group: Array
// $doc: Sort an array
// $arg array: The array
// $arg compareFn: Optional (default is null). The comparison function.
// $return: The sorted array
function arraySort([array = null, compareFn = null], options) {
    if (valueType(array) !== 'array' || (compareFn !== null && valueType(compareFn) !== 'function')) {
        return null;
    }

    if (compareFn === null) {
        return array.sort(valueCompare);
    }
    return array.sort((...args) => compareFn(args, options));
}


//
// Data functions
//


// $function: dataAggregate
// $group: Data
// $doc: Aggregate a data array
// $arg data: The data array
// $arg aggregation: The [aggregation model](model.html#var.vName='Aggregation')
// $return: The aggregated data array
function dataAggregate([data = null, aggregation = null]) {
    if (valueType(data) !== 'array' || (aggregation !== null && valueType(aggregation) !== 'object')) {
        return null;
    }

    return aggregateData(data, aggregation);
}


// $function: dataCalculatedField
// $group: Data
// $doc: Add a calculated field to a data array
// $arg data: The data array
// $arg fieldName: The calculated field name
// $arg expr: The calculated field expression
// $arg variables: Optional (default is null). A variables object the expression evaluation.
// $return: The updated data array
function dataCalculatedField([data = null, fieldName = null, expr = null, variables = null], options) {
    if (valueType(data) !== 'array' || valueType(fieldName) !== 'string' || valueType(expr) !== 'string' ||
        (variables !== null && valueType(variables) !== 'object')) {
        return null;
    }

    return addCalculatedField(data, fieldName, expr, variables, options);
}

// $function: dataFilter
// $group: Data
// $doc: Filter a data array
// $arg data: The data array
// $arg expr: The filter expression
// $arg variables: Optional (default is null). A variables object the expression evaluation.
// $return: The filtered data array
function dataFilter([data = null, expr = null, variables = null], options) {
    if (valueType(data) !== 'array' || valueType(expr) !== 'string' || (variables !== null && valueType(variables) !== 'object')) {
        return null;
    }

    return filterData(data, expr, variables, options);
}


// $function: dataJoin
// $group: Data
// $doc: Join two data arrays
// $arg leftData: The left data array
// $arg rightData: The right data array
// $arg joinExpr: The [join expression](https://craigahobbs.github.io/bare-script/language/#expressions)
// $arg rightExpr: Optional (default is null).
// $arg rightExpr: The right [join expression](https://craigahobbs.github.io/bare-script/language/#expressions)
// $arg isLeftJoin: Optional (default is false). If true, perform a left join (always include left row).
// $arg variables: Optional (default is null). A variables object for join expression evaluation.
// $return: The joined data array
function dataJoin([leftData = null, rightData = null, joinExpr = null, rightExpr = null, isLeftJoin = false, variables = null], options) {
    if (valueType(leftData) !== 'array' || valueType(rightData) !== 'array' || valueType(joinExpr) !== 'string' ||
        (rightExpr !== null && valueType(rightExpr) !== 'string') || (variables !== null && valueType(variables) !== 'object')) {
        return null;
    }

    return joinData(leftData, rightData, joinExpr, rightExpr, isLeftJoin, variables, options);
}


// $function: dataParseCSV
// $group: Data
// $doc: Parse CSV text to a data array
// $arg text...: The CSV text
// $return: The data array
function dataParseCSV(args) {
    // Split the input CSV parts into lines
    const lines = [];
    for (const arg of args) {
        if (arg === null) {
            continue;
        }
        if (valueType(arg) !== 'string') {
            return null;
        }
        lines.push(arg);
    }

    const data = parseCSV(lines);
    validateData(data, true);
    return data;
}


// $function: dataSort
// $group: Data
// $doc: Sort a data array
// $arg data: The data array
// $arg sorts: The sort field-name/descending-sort tuples
// $return: The sorted data array
function dataSort([data = null, sorts = null]) {
    if (valueType(data) !== 'array' || valueType(sorts) !== 'array') {
        return null;
    }

    return sortData(data, sorts);
}


// $function: dataTop
// $group: Data
// $doc: Keep the top rows for each category
// $arg data: The data array
// $arg count: The number of rows to keep (default is 1)
// $arg categoryFields: Optional (default is null). The category fields.
// $return: The top data array
function dataTop([data = null, count = null, categoryFields = null]) {
    if (valueType(data) !== 'array' ||
        valueType(count) !== 'number' || Math.floor(count) !== count || count < 1 ||
        (categoryFields !== null && valueType(categoryFields) !== 'array')) {
        return null;
    }

    return topData(data, count, categoryFields);
}


// $function: dataValidate
// $group: Data
// $doc: Validate a data array
// $arg data: The data array
// $return: The validated data array
function dataValidate([data = null]) {
    if (valueType(data) !== 'array') {
        return null;
    }

    validateData(data);
    return data;
}


//
// Datetime functions
//


// $function: datetimeDay
// $group: Datetime
// $doc: Get the day of the month of a datetime
// $arg datetime: The datetime
// $return: The day of the month
function datetimeDay([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getDate();
}


// $function: datetimeHour
// $group: Datetime
// $doc: Get the hour of a datetime
// $arg datetime: The datetime
// $return: The hour
function datetimeHour([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getHours();
}


// $function: datetimeISOFormat
// $group: Datetime
// $doc: Format the datetime as an ISO date/time string
// $arg datetime: The datetime
// $arg isDate: If true, format the datetime as an ISO date
// $return: The formatted datetime string
function datetimeISOFormat([datetime = null, isDate = false]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    if (valueBoolean(isDate)) {
        const year = datetime.getFullYear();
        const month = datetime.getMonth() + 1;
        const day = datetime.getDate();
        return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    }

    return valueString(datetime);
}


// $function: datetimeISOParse
// $group: Datetime
// $doc: Parse an ISO date/time string
// $arg string: The ISO date/time string
// $return: The datetime, or null if parsing fails
function datetimeISOParse([string]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return valueParseDatetime(string);
}


// $function: datetimeMillisecond
// $group: Datetime
// $doc: Get the millisecond of a datetime
// $arg datetime: The datetime
// $return: The millisecond
function datetimeMillisecond([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getMilliseconds();
}


// $function: datetimeMinute
// $group: Datetime
// $doc: Get the minute of a datetime
// $arg datetime: The datetime
// $return: The minute
function datetimeMinute([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getMinutes();
}


// $function: datetimeMonth
// $group: Datetime
// $doc: Get the month (1-12) of a datetime
// $arg datetime: The datetime
// $return: The month
function datetimeMonth([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getMonth() + 1;
}


// $function: datetimeNew
// $group: Datetime
// $doc: Create a new datetime
// $arg year: The full year
// $arg month: The month (1-12)
// $arg day: The day of the month
// $arg hour: Optional (default is 0). The hour (0-23).
// $arg minute: Optional (default is 0). The minute.
// $arg second: Optional (default is 0). The second.
// $arg millisecond: Optional (default is 0). The millisecond.
// $return: The new datetime
function datetimeNew([year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0]) {
    if (valueType(year) !== 'number' || Math.floor(year) !== year ||
        valueType(month) !== 'number' || Math.floor(month) !== month ||
        valueType(day) !== 'number' || Math.floor(day) !== day || day < -10000 || day > 10000 ||
        valueType(hour) !== 'number' || Math.floor(hour) !== hour ||
        valueType(minute) !== 'number' || Math.floor(minute) !== minute ||
        valueType(second) !== 'number' || Math.floor(second) !== second ||
        valueType(millisecond) !== 'number' || Math.floor(millisecond) !== millisecond) {
        return null;
    }

    return new Date(year, month - 1, day, hour, minute, second, millisecond);
}


// $function: datetimeNow
// $group: Datetime
// $doc: Get the current datetime
// $return: The current datetime
function datetimeNow() {
    return new Date();
}


// $function: datetimeSecond
// $group: Datetime
// $doc: Get the second of a datetime
// $arg datetime: The datetime
// $return: The second
function datetimeSecond([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getSeconds();
}


// $function: datetimeToday
// $group: Datetime
// $doc: Get today's datetime
// $return: Today's datetime
function datetimeToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}


// $function: datetimeYear
// $group: Datetime
// $doc: Get the full year of a datetime
// $arg datetime: The datetime
// $return: The full year
function datetimeYear([datetime = null]) {
    if (valueType(datetime) !== 'datetime') {
        return null;
    }

    return datetime.getFullYear();
}


//
// JSON functions
//


// $function: jsonParse
// $group: JSON
// $doc: Convert a JSON string to an object
// $arg string: The JSON string
// $return: The object
function jsonParse([string = null]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return JSON.parse(string);
}


// $function: jsonStringify
// $group: JSON
// $doc: Convert an object to a JSON string
// $arg value: The object
// $arg indent: Optional (default is null). The indentation number.
// $return: The JSON string
function jsonStringify([value = null, indent = null]) {
    if (indent !== null && (valueType(indent) !== 'number' || Math.floor(indent) !== indent || indent < 1)) {
        return null;
    }

    return valueJSON(value, indent);
}


//
// Math functions
//

// $function: mathAbs
// $group: Math
// $doc: Compute the absolute value of a number
// $arg x: The number
// $return: The absolute value of the number
function mathAbs([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.abs(x);
}


// $function: mathAcos
// $group: Math
// $doc: Compute the arccosine, in radians, of a number
// $arg x: The number
// $return: The arccosine, in radians, of the number
function mathAcos([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.acos(x);
}


// $function: mathAsin
// $group: Math
// $doc: Compute the arcsine, in radians, of a number
// $arg x: The number
// $return: The arcsine, in radians, of the number
function mathAsin([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.asin(x);
}


// $function: mathAtan
// $group: Math
// $doc: Compute the arctangent, in radians, of a number
// $arg x: The number
// $return: The arctangent, in radians, of the number
function mathAtan([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.atan(x);
}


// $function: mathAtan2
// $group: Math
// $doc: Compute the angle, in radians, between (0, 0) and a point
// $arg y: The Y-coordinate of the point
// $arg x: The X-coordinate of the point
// $return: The angle, in radians
function mathAtan2([y = null, x = null]) {
    if (valueType(y) !== 'number' || valueType(x) !== 'number') {
        return null;
    }

    return Math.atan2(y, x);
}


// $function: mathCeil
// $group: Math
// $doc: Compute the ceiling of a number (round up to the next highest integer)
// $arg x: The number
// $return: The ceiling of the number
function mathCeil([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.ceil(x);
}


// $function: mathCos
// $group: Math
// $doc: Compute the cosine of an angle, in radians
// $arg x: The angle, in radians
// $return: The cosine of the angle
function mathCos([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.cos(x);
}


// $function: mathFloor
// $group: Math
// $doc: Compute the floor of a number (round down to the next lowest integer)
// $arg x: The number
// $return: The floor of the number
function mathFloor([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.floor(x);
}


// $function: mathLn
// $group: Math
// $doc: Compute the natural logarithm (base e) of a number
// $arg x: The number
// $return: The natural logarithm of the number
function mathLn([x = null]) {
    if (valueType(x) !== 'number' || x <= 0) {
        return null;
    }

    return Math.log(x);
}


// $function: mathLog
// $group: Math
// $doc: Compute the logarithm (base 10) of a number
// $arg x: The number
// $arg base: Optional (default is 10). The logarithm base.
// $return: The logarithm of the number
function mathLog([x = null, base = 10]) {
    if (valueType(x) !== 'number' || x <= 0 || valueType(base) !== 'number' || base <= 0 || base === 1) {
        return null;
    }

    return Math.log(x) / Math.log(base);
}


// $function: mathMax
// $group: Math
// $doc: Compute the maximum value
// $arg values...: The values
// $return: The maximum value
function mathMax(values) {
    if (values.some((value) => valueType(value) !== 'number')) {
        return null;
    }

    return Math.max(...values);
}


// $function: mathMin
// $group: Math
// $doc: Compute the minimum value
// $arg values...: The values
// $return: The minimum value
function mathMin(values) {
    if (values.some((value) => valueType(value) !== 'number')) {
        return null;
    }

    return Math.min(...values);
}


// $function: mathPi
// $group: Math
// $doc: Return the number pi
// $return: The number pi
function mathPi() {
    return Math.PI;
}


// $function: mathRandom
// $group: Math
// $doc: Compute a random number between 0 and 1, inclusive
// $return: A random number
function mathRandom() {
    return Math.random();
}


// $function: mathRound
// $group: Math
// $doc: Round a number to a certain number of decimal places
// $arg x: The number
// $arg digits: Optional (default is 0). The number of decimal digits to round to.
// $return: The rounded number
function mathRound([x = null, digits = 0]) {
    if (valueType(x) !== 'number' || valueType(digits) !== 'number' || Math.floor(digits) !== digits || digits < 0) {
        return null;
    }

    const multiplier = 10 ** digits;
    return Math.round(x * multiplier) / multiplier;
}


// $function: mathSign
// $group: Math
// $doc: Compute the sign of a number
// $arg x: The number
// $return: -1 for a negative number, 1 for a positive number, and 0 for zero
function mathSign([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.sign(x);
}


// $function: mathSin
// $group: Math
// $doc: Compute the sine of an angle, in radians
// $arg x: The angle, in radians
// $return: The sine of the angle
function mathSin([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.sin(x);
}


// $function: mathSqrt
// $group: Math
// $doc: Compute the square root of a number
// $arg x: The number
// $return: The square root of the number
function mathSqrt([x = null]) {
    if (valueType(x) !== 'number' || x < 0) {
        return null;
    }

    return Math.sqrt(x);
}


// $function: mathTan
// $group: Math
// $doc: Compute the tangent of an angle, in radians
// $arg x: The angle, in radians
// $return: The tangent of the angle
function mathTan([x = null]) {
    if (valueType(x) !== 'number') {
        return null;
    }

    return Math.tan(x);
}


//
// Number functions
//


// $function: numberParseFloat
// $group: Number
// $doc: Parse a string as a floating point number
// $arg string: The string
// $return: The number
function numberParseFloat([string = null]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return valueParseNumber(string);
}


// $function: numberParseInt
// $group: Number
// $doc: Parse a string as an integer
// $arg string: The string
// $arg radix: Optional (default is 10). The number base.
// $return: The integer
function numberParseInt([string = null, radix = 10]) {
    if (valueType(string) !== 'string' || valueType(radix) !== 'number' || Math.floor(radix) !== radix || radix < 2 || radix > 36) {
        return null;
    }

    return valueParseInteger(string, radix);
}


// $function: numberToFixed
// $group: Number
// $doc: Format a number using fixed-point notation
// $arg x: The number
// $arg digits: Optional (default is 2). The number of digits to appear after the decimal point.
// $arg trim: Optional (default is false). If true, trim trailing zeroes and decimal point.
// $return: The fixed-point notation string
function numberToFixed([x = null, digits = 2, trim = false]) {
    if (valueType(x) !== 'number' || valueType(digits) !== 'number' || Math.floor(digits) !== digits || digits < 0) {
        return null;
    }

    let result = x.toFixed(digits);
    if (valueBoolean(trim)) {
        result = result.replace(rNumberCleanup, '');
    }
    return result;
}

const rNumberCleanup = /\.0*$/;


//
// Object functions
//


// $function: objectAssign
// $group: Object
// $doc: Assign the keys/values of one object to another
// $arg object: The object to assign to
// $arg object2: The object to assign
// $return: The updated object
function objectAssign([object = null, object2 = null]) {
    if (valueType(object) !== 'object' || valueType(object2) !== 'object') {
        return null;
    }

    Object.assign(object, object2);
    return object;
}


// $function: objectCopy
// $group: Object
// $doc: Create a copy of an object
// $arg object: The object to copy
// $return: The object copy
function objectCopy([object = null]) {
    if (valueType(object) !== 'object') {
        return null;
    }

    return {...object};
}


// $function: objectDelete
// $group: Object
// $doc: Delete an object key
// $arg object: The object
// $arg key: The key to delete
function objectDelete([object = null, key = null]) {
    if (valueType(object) !== 'object' || valueType(key) !== 'string') {
        return null;
    }

    delete object[key];
    return null;
}


// $function: objectGet
// $group: Object
// $doc: Get an object key's value
// $arg object: The object
// $arg key: The key
// $arg defaultValue: The default value (optional)
// $return: The value or null if the key does not exist
function objectGet([object = null, key = null, defaultValue = null]) {
    if (valueType(object) !== 'object' || valueType(key) !== 'string') {
        return defaultValue;
    }

    return object[key] ?? defaultValue;
}


// $function: objectHas
// $group: Object
// $doc: Test if an object contains a key
// $arg object: The object
// $arg key: The key
// $return: true if the object contains the key, false otherwise
function objectHas([object = null, key = null]) {
    if (valueType(object) !== 'object' || valueType(key) !== 'string') {
        return false;
    }

    return key in object;
}


// $function: objectKeys
// $group: Object
// $doc: Get an object's keys
// $arg object: The object
// $return: The array of keys
function objectKeys([object = null]) {
    if (valueType(object) !== 'object') {
        return null;
    }

    return Object.keys(object);
}


// $function: objectNew
// $group: Object
// $doc: Create a new object
// $arg keyValues...: The object's initial key and value pairs
// $return: The new object
function objectNew(keyValues = null) {
    const object = {};
    for (let ix = 0; ix < keyValues.length; ix += 2) {
        const key = keyValues[ix];
        const value = ix + 1 < keyValues.length ? keyValues[ix + 1] : null;
        if (valueType(key) !== 'string') {
            return null;
        }
        object[key] = value;
    }
    return object;
}


// $function: objectSet
// $group: Object
// $doc: Set an object key's value
// $arg object: The object
// $arg key: The key
// $arg value: The value to set
// $return: The value to set
function objectSet([object = null, key = null, value = null]) {
    if (valueType(object) !== 'object' || valueType(key) !== 'string') {
        return null;
    }

    object[key] = value;
    return value;
}


//
// Regex functions
//


// $function: regexEscape
// $group: Regex
// $doc: Escape a string for use in a regular expression
// $arg string: The string to escape
// $return: The escaped string
function regexEscape([string = null]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return string.replace(rRegexEscape, '\\$&');
}

const rRegexEscape = /[.*+?^${}()|[\]\\]/g;


// $function: regexMatch
// $group: Regex
// $doc: Find the first match of a regular expression in a string
// $arg regex: The regular expression
// $arg string: The string
// $return: The [match object](model.html#var.vName='RegexMatch'), or null if no matches are found
function regexMatch([regex = null, string = null]) {
    if (valueType(regex) !== 'regex' || valueType(string) !== 'string') {
        return null;
    }

    // Match?
    const match = string.match(regex);
    if (match === null) {
        return null;
    }

    return regexMatchGroups(match);
}


// $function: regexMatchAll
// $group: Regex
// $doc: Find all matches of regular expression in a string
// $arg regex: The regular expression
// $arg string: The string
// $return: The array of [match objects](model.html#var.vName='RegexMatch')
function regexMatchAll([regex = null, string = null]) {
    if (valueType(regex) !== 'regex' || valueType(string) !== 'string') {
        return null;
    }

    // Re-compile the regex with the "g" flag, if necessary
    const regexGlobal = (regex.flags.indexOf('g') !== -1 ? regex : new RegExp(regex.source, `${regex.flags}g`));

    return Array.from(string.matchAll(regexGlobal)).map((match) => regexMatchGroups(match));
}


// Helper function to create a match model from a metch object
function regexMatchGroups(match) {
    const groups = {};
    for (let ixMatch = 0; ixMatch < match.length; ixMatch++) {
        groups[`${ixMatch}`] = match[ixMatch];
    }
    if (match.groups) {
        for (const groupName of Object.keys(match.groups)) {
            groups[groupName] = match.groups[groupName];
        }
    }
    return {
        'index': match.index,
        'input': match.input,
        'groups': groups
    };
}


// The regex match model
export const regexMatchTypes = parseSchemaMarkdown(`\
group "RegexMatch"


# A regex match model
struct RegexMatch

    # The zero-based index of the match in the input string
    int(>= 0) index

    # The input string
    string input

    # The matched groups. The "0" key is the full match text. Ordered (non-named) groups use keys "1", "2", and so on.
    string{} groups
`);


// $function: regexNew
// $group: Regex
// $doc: Create a regular expression
// eslint-disable-next-line max-len
// $arg pattern: The [regular expression pattern string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#writing_a_regular_expression_pattern)
// $arg flags: The regular expression flags. The string may contain the following characters:
// $arg flags: - **i** - case-insensitive search
// $arg flags: - **m** - multi-line search - "^" and "$" matches next to newline characters
// $arg flags: - **s** - "." matches newline characters
// $return: The regular expression or null if the pattern is invalid
function regexNew([pattern = null, flags = null]) {
    if (valueType(pattern) !== 'string' || (flags !== null && valueType(flags) !== 'string')) {
        return null;
    }

    // Valid flags mask?
    if (flags !== null) {
        for (const flag of flags) {
            if (flag !== 'i' && flag !== 'm' && flag !== 's') {
                return null;
            }
        }
    }

    return flags !== null ? new RegExp(pattern, flags) : new RegExp(pattern);
}


// $function: regexReplace
// $group: Regex
// $doc: Replace regular expression matches with a string
// $arg regex: The replacement regular expression
// $arg string: The string
// $arg substr: The replacement string
// $return: The updated string
function regexReplace([regex = null, string = null, substr = null]) {
    if (valueType(regex) !== 'regex' || valueType(string) !== 'string' || valueType(substr) !== 'string') {
        return null;
    }

    // Re-compile the regex with the "g" flag, if necessary
    const regexGlobal = (regex.flags.indexOf('g') !== -1 ? regex : new RegExp(regex.source, `${regex.flags}g`));

    return string.replaceAll(regexGlobal, substr);
}


// $function: regexSplit
// $group: Regex
// $doc: Split a string with a regular expression
// $arg regex: The regular expression
// $arg string: The string
// $return: The array of split parts
function regexSplit([regex = null, string = null]) {
    if (valueType(regex) !== 'regex' || valueType(string) !== 'string') {
        return null;
    }

    return string.split(regex);
}


//
// Schema functions
//


// $function: schemaParse
// $group: Schema
// $doc: Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text
// $arg lines...: The [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
// $arg lines...: text lines (may contain nested arrays of un-split lines)
// $return: The schema's [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
function schemaParse(lines) {
    return parseSchemaMarkdown(lines);
}


// $function: schemaParseEx
// $group: Schema
// $doc: Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text with options
// $arg lines: The array of [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
// $arg lines: text lines (may contain nested arrays of un-split lines)
// $arg types: Optional. The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types').
// $arg filename: Optional (default is ""). The file name.
// $return: The schema's [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
function schemaParseEx([lines = null, types = {}, filename = '']) {
    if (!(valueType(lines) === 'array' || valueType(lines) === 'string') ||
        valueType(types) !== 'object' || valueType(filename) !== 'string') {
        return null;
    }

    return parseSchemaMarkdown(lines, {types, filename});
}


// $function: schemaTypeModel
// $group: Schema
// $doc: Get the [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
// $return: The [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
function schemaTypeModel() {
    return typeModel;
}


// $function: schemaValidate
// $group: Schema
// $doc: Validate an object to a schema type
// $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
// $arg typeName: The type name
// $arg value: The object to validate
// $return: The validated object or null if validation fails
function schemaValidate([types = null, typeName = null, value = null]) {
    if (valueType(types) !== 'object' || valueType(typeName) !== 'string') {
        return null;
    }

    validateTypeModel(types);
    return validateType(types, typeName, value);
}


// $function: schemaValidateTypeModel
// $group: Schema
// $doc: Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
// $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types') to validate
// $return: The validated [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
function schemaValidateTypeModel([types = null]) {
    if (valueType(types) !== 'object') {
        return null;
    }

    return validateTypeModel(types);
}


//
// String functions
//


// $function: stringCharCodeAt
// $group: String
// $doc: Get a string index's character code
// $arg string: The string
// $arg index: The character index
// $return: The character code
function stringCharCodeAt([string = null, index = null]) {
    if (valueType(string) !== 'string' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0 || index >= string.length) {
        return null;
    }

    return string.charCodeAt(index);
}


// $function: stringEndsWith
// $group: String
// $doc: Determine if a string ends with a search string
// $arg string: The string
// $arg search: The search string
// $return: true if the string ends with the search string, false otherwise
function stringEndsWith([string = null, search = null]) {
    if (valueType(string) !== 'string' || valueType(search) !== 'string') {
        return null;
    }

    return string.endsWith(search);
}


// $function: stringFromCharCode
// $group: String
// $doc: Create a string of characters from character codes
// $arg charCodes...: The character codes
// $return: The string of characters
function stringFromCharCode(charCodes = null) {
    if (charCodes.some((code) => valueType(code) !== 'number' || Math.floor(code) !== code || code < 0)) {
        return null;
    }

    return String.fromCharCode(...charCodes);
}


// $function: stringIndexOf
// $group: String
// $doc: Find the first index of a search string in a string
// $arg string: The string
// $arg search: The search string
// $arg index: Optional (default is 0). The index at which to start the search.
// $return: The first index of the search string; -1 if not found.
function stringIndexOf([string = null, search = null, index = 0]) {
    if (valueType(string) !== 'string' || valueType(search) !== 'string' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0  || index >= string.length) {
        return -1;
    }

    return string.indexOf(search, index);
}


// $function: stringLastIndexOf
// $group: String
// $doc: Find the last index of a search string in a string
// $arg string: The string
// $arg search: The search string
// $arg index: Optional (default is the end of the string). The index at which to start the search.
// $return: The last index of the search string; -1 if not found.
function stringLastIndexOf([string = null, search = null, indexArg = null]) {
    let index = indexArg;
    if (index === null && valueType(string) === 'string') {
        index = string.length - 1;
    }
    if (valueType(string) !== 'string' || valueType(search) !== 'string' ||
        valueType(index) !== 'number' || Math.floor(index) !== index || index < 0  || index >= string.length) {
        return -1;
    }

    return string.lastIndexOf(search, index);
}


// $function: stringLength
// $group: String
// $doc: Get the length of a string
// $arg string: The string
// $return: The string's length; zero if not a string
function stringLength([string = null]) {
    if (valueType(string) !== 'string') {
        return 0;
    }

    return string.length;
}


// $function: stringLower
// $group: String
// $doc: Convert a string to lower-case
// $arg string: The string
// $return: The lower-case string
function stringLower([string = null]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return string.toLowerCase();
}


// $function: stringNew
// $group: String
// $doc: Create a new string from a value
// $arg value: The value
// $return: The new string
function stringNew([value = null]) {
    return valueString(value);
}


// $function: stringRepeat
// $group: String
// $doc: Repeat a string
// $arg string: The string to repeat
// $arg count: The number of times to repeat the string
// $return: The repeated string
function stringRepeat([string = null, count = null]) {
    if (valueType(string) !== 'string' || valueType(count) !== 'number' || Math.floor(count) !== count || count < 0) {
        return null;
    }

    return string.repeat(count);
}


// $function: stringReplace
// $group: String
// $doc: Replace all instances of a string with another string
// $arg string: The string to update
// $arg substr: The string to replace
// $arg newSubstr: The replacement string
// $return: The updated string
function stringReplace([string = null, substr = null, newSubstr = null]) {
    if (valueType(string) !== 'string' || valueType(substr) !== 'string' || valueType(newSubstr) !== 'string') {
        return null;
    }

    return string.replaceAll(substr, newSubstr);
}


// $function: stringSlice
// $group: String
// $doc: Copy a portion of a string
// $arg string: The string
// $arg start: The start index of the slice
// $arg end: Optional (default is the end of the string). The end index of the slice.
// $return: The new string slice
function stringSlice([string = null, begin = null, endArg = null]) {
    let end = endArg;
    if (end === null && valueType(string) === 'string') {
        end = string.length;
    }
    if (valueType(string) !== 'string' ||
        valueType(begin) !== 'number' || Math.floor(begin) !== begin || begin < 0 || begin > string.length ||
        valueType(end) !== 'number' || Math.floor(end) !== end || end < 0 || end > string.length) {
        return null;
    }

    return string.slice(begin, end);
}


// $function: stringSplit
// $group: String
// $doc: Split a string
// $arg string: The string to split
// $arg separator: The separator string
// $return: The array of split-out strings
function stringSplit([string = null, separator = null]) {
    if (valueType(string) !== 'string' || valueType(separator) !== 'string') {
        return null;
    }

    return string.split(separator);
}


// $function: stringStartsWith
// $group: String
// $doc: Determine if a string starts with a search string
// $arg string: The string
// $arg search: The search string
// $return: true if the string starts with the search string, false otherwise
function stringStartsWith([string = null, search = null]) {
    if (valueType(string) !== 'string' || valueType(search) !== 'string') {
        return null;
    }

    return string.startsWith(search);
}


// $function: stringTrim
// $group: String
// $doc: Trim the whitespace from the beginning and end of a string
// $arg string: The string
// $return: The trimmed string
function stringTrim([string = null]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return string.trim();
}


// $function: stringUpper
// $group: String
// $doc: Convert a string to upper-case
// $arg string: The string
// $return: The upper-case string
function stringUpper([string = null]) {
    if (valueType(string) !== 'string') {
        return null;
    }

    return string.toUpperCase();
}


//
// System functions
//


// $function: systemBoolean
// $group: System
// $doc: Interpret a value as a boolean
// $arg value: The value
// $return: true or false
function systemBoolean([value = null]) {
    return valueBoolean(value);
}


// $function: systemCompare
// $group: System
// $doc: Compare two values
// $arg left: The left value
// $arg right: The right value
// $return: -1 if the left value is less than the right value, 0 if equal, and 1 if greater than
function systemCompare([left = null, right = null]) {
    return valueCompare(left, right);
}


// $function: systemFetch
// $group: System
// $doc: Retrieve a URL resource
// $arg url: The resource URL, [request model](model.html#var.vName='SystemFetchRequest'), or array of URL and
// $arg url: [request model](model.html#var.vName='SystemFetchRequest')
// $return: The response string or array of strings; null if an error occurred
async function systemFetch([url = null], options) {
    // Options
    const fetchFn = options !== null ? (options.fetchFn ?? null) : null;
    const logFn = options !== null && options.debug ? (options.logFn ?? null) : null;
    const urlFn = options !== null ? (options.urlFn ?? null) : null;

    // Validate the URL argument
    const requests = [];
    let isResponseArray = false;
    if (valueType(url) === 'string') {
        requests.push({'url': url});
    } else if (valueType(url) === 'object') {
        requests.push(validateType(systemFetchTypes, 'SystemFetchRequest', url));
    } else if (valueType(url) === 'array') {
        isResponseArray = true;
        for (const urlItem of url) {
            if (valueType(urlItem) === 'string') {
                requests.push({'url': urlItem});
            } else {
                requests.push(validateType(systemFetchTypes, 'SystemFetchRequest', urlItem));
            }
        }
    } else {
        return null;
    }

    // Fetch in parallel
    const fetchResponses = await Promise.all(requests.map((request) => {
        try {
            const fetchURL = urlFn !== null ? urlFn(request.url) : request.url;
            const fetchOptions = {};
            if ((request.body ?? null) !== null) {
                fetchOptions.body = request.body;
            }
            if ((request.headers ?? null) !== null) {
                fetchOptions.headers = request.headers;
            }
            return fetchFn !== null ? fetchFn(fetchURL, fetchOptions) : null;
        } catch {
            return null;
        }
    }));
    const responses = await Promise.all(fetchResponses.map(async (fetchResponse, ixResponse) => {
        let response;
        try {
            response = fetchResponse !== null && fetchResponse.ok ? await fetchResponse.text() : null;
        } catch {
            response = null;
        }

        // Log failure
        if (response === null && logFn !== null) {
            const errorURL = requests[ixResponse].url;
            logFn(`BareScript: Function "systemFetch" failed for resource "${errorURL}"`);
        }

        return response;
    }));

    return isResponseArray ? responses : responses[0];
}


// The aggregation model
export const systemFetchTypes = parseSchemaMarkdown(`\
group "SystemFetch"


# A fetch request model
struct SystemFetchRequest

    # The resource URL
    string url

    # The request body
    optional string body

    # The request headers
    optional string{} headers
`);


// $function: systemGlobalGet
// $group: System
// $doc: Get a global variable value
// $arg name: The global variable name
// $arg defaultValue: The default value (optional)
// $return: The global variable's value or null if it does not exist
function systemGlobalGet([name = null, defaultValue = null], options) {
    if (valueType(name) !== 'string') {
        return defaultValue;
    }

    const globals = (options !== null ? (options.globals ?? null) : null);
    return globals !== null ? (globals[name] ?? defaultValue) : defaultValue;
}


// $function: systemGlobalSet
// $group: System
// $doc: Set a global variable value
// $arg name: The global variable name
// $arg value: The global variable's value
// $return: The global variable's value
function systemGlobalSet([name = null, value = null], options) {
    if (valueType(name) !== 'string') {
        return null;
    }

    const globals = (options !== null ? (options.globals ?? null) : null);
    if (globals !== null) {
        globals[name] = value;
    }
    return value;
}


// $function: systemIs
// $group: System
// $doc: Test if one value is the same object as another
// $arg value1: The first value
// $arg value2: The second value
// $return: true if values are the same object, false otherwise
function systemIs([value1 = null, value2 = null]) {
    return valueIs(value1, value2);
}


// $function: systemLog
// $group: System
// $doc: Log a message to the console
// $arg message: The log message
function systemLog([message = null], options) {
    if (options !== null && 'logFn' in options) {
        options.logFn(valueString(message));
    }
}


// $function: systemLogDebug
// $group: System
// $doc: Log a message to the console, if in debug mode
// $arg message: The log message
function systemLogDebug([message = null], options) {
    if (options !== null && 'logFn' in options && options.debug) {
        options.logFn(valueString(message));
    }
}


// $function: systemPartial
// $group: System
// $doc: Return a new function which behaves like "func" called with "args".
// $doc: If additional arguments are passed to the returned function, they are appended to "args".
// $arg func: The function
// $arg args...: The function arguments
// $return: The new function called with "args"
function systemPartial([func = null, ...args]) {
    if (valueType(func) !== 'function' || args.length < 1) {
        return null;
    }

    return (argsExtra, options) => func([...args, ...argsExtra], options);
}


// $function: systemType
// $group: System
// $doc: Get a value's type string
// $arg value: The value
// $return: The type string of the value.
// $return: Valid values are: 'array', 'boolean', 'datetime', 'function', 'null', 'number', 'object', 'regex', 'string'.
function systemType([value = null]) {
    return valueType(value);
}


//
// URL functions
//


// $function: urlEncode
// $group: URL
// $doc: Encode a URL
// $arg url: The URL string
// $arg extra: Optional (default is true). If true, encode extra characters for wider compatibility.
// $return: The encoded URL string
function urlEncode([url = null, extra = true]) {
    if (valueType(url) !== 'string') {
        return null;
    }

    let urlEncoded = encodeURI(url);
    if (valueBoolean(extra)) {
        // Replace ')' with '%29' for Markdown links
        urlEncoded = urlEncoded.replaceAll(')', '%29');
    }
    return urlEncoded;
}


// $function: urlEncodeComponent
// $group: URL
// $doc: Encode a URL component
// $arg url: The URL component string
// $arg extra: Optional (default is true). If true, encode extra characters for wider compatibility.
// $return: The encoded URL component string
function urlEncodeComponent([url = null, extra = true]) {
    if (valueType(url) !== 'string') {
        return null;
    }

    let urlEncoded = encodeURIComponent(url);
    if (valueBoolean(extra)) {
        // Replace ')' with '%29' for Markdown links
        urlEncoded = urlEncoded.replaceAll(')', '%29');
    }
    return urlEncoded;
}


// The built-in script functions
export const scriptFunctions = {
    arrayCopy,
    arrayExtend,
    arrayGet,
    arrayIndexOf,
    arrayJoin,
    arrayLastIndexOf,
    arrayLength,
    arrayNew,
    arrayNewSize,
    arrayPop,
    arrayPush,
    arraySet,
    arrayShift,
    arraySlice,
    arraySort,
    dataAggregate,
    dataCalculatedField,
    dataFilter,
    dataJoin,
    dataParseCSV,
    dataSort,
    dataTop,
    dataValidate,
    datetimeDay,
    datetimeHour,
    datetimeISOFormat,
    datetimeISOParse,
    datetimeMillisecond,
    datetimeMinute,
    datetimeMonth,
    datetimeNew,
    datetimeNow,
    datetimeSecond,
    datetimeToday,
    datetimeYear,
    jsonParse,
    jsonStringify,
    mathAbs,
    mathAcos,
    mathAsin,
    mathAtan,
    mathAtan2,
    mathCeil,
    mathCos,
    mathFloor,
    mathLn,
    mathLog,
    mathMax,
    mathMin,
    mathPi,
    mathRandom,
    mathRound,
    mathSign,
    mathSin,
    mathSqrt,
    mathTan,
    numberParseFloat,
    numberParseInt,
    numberToFixed,
    objectAssign,
    objectCopy,
    objectDelete,
    objectGet,
    objectHas,
    objectKeys,
    objectNew,
    objectSet,
    regexEscape,
    regexMatch,
    regexMatchAll,
    regexNew,
    regexReplace,
    regexSplit,
    schemaParse,
    schemaParseEx,
    schemaTypeModel,
    schemaValidate,
    schemaValidateTypeModel,
    stringCharCodeAt,
    stringEndsWith,
    stringFromCharCode,
    stringIndexOf,
    stringLastIndexOf,
    stringLength,
    stringLower,
    stringNew,
    stringRepeat,
    stringReplace,
    stringSlice,
    stringSplit,
    stringStartsWith,
    stringTrim,
    stringUpper,
    systemBoolean,
    systemCompare,
    systemFetch,
    systemGlobalGet,
    systemGlobalSet,
    systemIs,
    systemLog,
    systemLogDebug,
    systemPartial,
    systemType,
    urlEncode,
    urlEncodeComponent,
};


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
