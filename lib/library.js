// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

import {
    ValueArgsError, valueArgsModel, valueArgsValidate, valueBoolean, valueCompare, valueIs, valueJSON,
    valueParseDatetime, valueParseInteger, valueParseNumber, valueRoundNumber, valueString, valueType
} from './value.js';
import {
    addCalculatedField, aggregateData, filterData, joinData, parseCSV, sortData, topData, validateData
} from './data.js';
import {validateType, validateTypeModel} from 'schema-markdown/lib/schema.js';
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
function arrayCopy(args) {
    const [array] = valueArgsValidate(arrayCopyArgs, args);
    return [...array];
}

const arrayCopyArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'}
]);


// $function: arrayDelete
// $group: Array
// $doc: Delete an array element
// $arg array: The array
// $arg index: The index of the element to delete
function arrayDelete(args) {
    const [array, index] = valueArgsValidate(arrayDeleteArgs, args);
    if (index >= array.length) {
        throw new ValueArgsError('index', index);
    }

    array.splice(index, 1);
}

const arrayDeleteArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'index', 'type': 'number', 'integer': true, 'gte': 0}
]);


// $function: arrayExtend
// $group: Array
// $doc: Extend one array with another
// $arg array: The array to extend
// $arg array2: The array to extend with
// $return: The extended array
function arrayExtend(args) {
    const [array, array2] = valueArgsValidate(arrayExtendArgs, args);
    array.push(...array2);
    return array;
}

const arrayExtendArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'array2', 'type': 'array'}
]);


// $function: arrayFlat
// $group: Array
// $doc: Flat an array hierarchy
// $arg array: The array to flat
// $return: The flated array
function arrayFlat(args) {
    const [array] = valueArgsValidate(arrayFlatArgs, args);
    return array.flat(Infinity);
}

const arrayFlatArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'}
]);


// $function: arrayGet
// $group: Array
// $doc: Get an array element
// $arg array: The array
// $arg index: The array element's index
// $return: The array element
function arrayGet(args) {
    const [array, index] = valueArgsValidate(arrayGetArgs, args);
    if (index >= array.length) {
        throw new ValueArgsError('index', index);
    }

    return array[index];
}

const arrayGetArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'index', 'type': 'number', 'integer': true, 'gte': 0}
]);


// $function: arrayIndexOf
// $group: Array
// $doc: Find the index of a value in an array
// $arg array: The array
// $arg value: The value to find in the array, or a match function, f(value) -> bool
// $arg index: Optional (default is 0). The index at which to start the search.
// $return: The first index of the value in the array; -1 if not found.
function arrayIndexOf(args, options) {
    const [array, value, index] = valueArgsValidate(arrayIndexOfArgs, args, -1);
    if (index >= array.length) {
        throw new ValueArgsError('index', index, -1);
    }

    // Value function?
    if (valueType(value) === 'function') {
        for (let ix = index; ix < array.length; ix += 1) {
            if (valueBoolean(value([array[ix]], options))) {
                return ix;
            }
        }
        return -1;
    }

    return array.indexOf(value, index);
}

const arrayIndexOfArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'value'},
    {'name': 'index', 'type': 'number', 'default': 0, 'integer': true, 'gte': 0}
]);


// $function: arrayJoin
// $group: Array
// $doc: Join an array with a separator string
// $arg array: The array
// $arg separator: The separator string
// $return: The joined string
function arrayJoin(args) {
    const [array , separator] = valueArgsValidate(arrayJoinArgs, args);
    return array.map((value) => valueString(value)).join(separator);
}

const arrayJoinArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'separator', 'type': 'string'}
]);


// $function: arrayLastIndexOf
// $group: Array
// $doc: Find the last index of a value in an array
// $arg array: The array
// $arg value: The value to find in the array, or a match function, f(value) -> bool
// $arg index: Optional (default is the end of the array). The index at which to start the search.
// $return: The last index of the value in the array; -1 if not found.
function arrayLastIndexOf(args, options) {
    const [array, value, indexArg] = valueArgsValidate(arrayLastIndexOfArgs, args, -1);
    let index = indexArg;
    if (index === null) {
        index = array.length - 1;
    }
    if (index >= array.length) {
        throw new ValueArgsError('index', index, -1);
    }

    // Value function?
    if (valueType(value) === 'function') {
        for (let ix = index; ix >= 0; ix -= 1) {
            if (valueBoolean(value([array[ix]], options))) {
                return ix;
            }
        }
        return -1;
    }

    return array.lastIndexOf(value, index);
}

const arrayLastIndexOfArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'value'},
    {'name': 'index', 'type': 'number', 'nullable': true, 'integer': true, 'gte': 0}
]);


// $function: arrayLength
// $group: Array
// $doc: Get the length of an array
// $arg array: The array
// $return: The array's length; zero if not an array
function arrayLength(args) {
    const [array] = valueArgsValidate(arrayLengthArgs, args, 0);
    return array.length;
}

const arrayLengthArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'}
]);


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
function arrayNewSize(args) {
    const [size, value] = valueArgsValidate(arrayNewSizeArgs, args);
    return new Array(size).fill(value);
}

const arrayNewSizeArgs = valueArgsModel([
    {'name': 'size', 'type': 'number', 'default': 0, 'integer': true, 'gte': 0},
    {'name': 'value', 'default': 0}
]);


// $function: arrayPop
// $group: Array
// $doc: Remove the last element of the array and return it
// $arg array: The array
// $return: The last element of the array; null if the array is empty.
function arrayPop(args) {
    const [array] = valueArgsValidate(arrayPopArgs, args);
    if (array.length === 0) {
        throw new ValueArgsError('array', array);
    }
    return array.pop();
}

const arrayPopArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'}
]);


// $function: arrayPush
// $group: Array
// $doc: Add one or more values to the end of the array
// $arg array: The array
// $arg values...: The values to add to the end of the array
// $return: The array
function arrayPush(args) {
    const [array, values] = valueArgsValidate(arrayPushArgs, args);
    array.push(...values);
    return array;
}

const arrayPushArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'values', 'lastArgArray': true}
]);


// $function: arraySet
// $group: Array
// $doc: Set an array element value
// $arg array: The array
// $arg index: The index of the element to set
// $arg value: The value to set
// $return: The value
function arraySet(args) {
    const [array, index, value] = valueArgsValidate(arraySetArgs, args);
    if (index >= array.length) {
        throw new ValueArgsError('index', index);
    }

    array[index] = value;
    return value;
}

const arraySetArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'index', 'type': 'number', 'integer': true, 'gte': 0},
    {'name': 'value'}
]);


// $function: arrayShift
// $group: Array
// $doc: Remove the first element of the array and return it
// $arg array: The array
// $return: The first element of the array; null if the array is empty.
function arrayShift(args) {
    const [array] = valueArgsValidate(arrayShiftArgs, args);
    if (array.length === 0) {
        throw new ValueArgsError('array', array);
    }
    return array.shift();
}

const arrayShiftArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'}
]);


// $function: arraySlice
// $group: Array
// $doc: Copy a portion of an array
// $arg array: The array
// $arg start: Optional (default is 0). The start index of the slice.
// $arg end: Optional (default is the end of the array). The end index of the slice.
// $return: The new array slice
function arraySlice(args) {
    const [array, start, endArg] = valueArgsValidate(arraySliceArgs, args);
    const end = endArg !== null ? endArg : array.length;
    if (start > array.length) {
        throw new ValueArgsError('start', start);
    }
    if (end > array.length) {
        throw new ValueArgsError('end', end);
    }

    return array.slice(start, end);
}

const arraySliceArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'start', 'type': 'number', 'default': 0, 'integer': true, 'gte': 0},
    {'name': 'end', 'type': 'number', 'nullable': true, 'integer': true, 'gte': 0}
]);


// $function: arraySort
// $group: Array
// $doc: Sort an array
// $arg array: The array
// $arg compareFn: Optional (default is null). The comparison function.
// $return: The sorted array
function arraySort(args, options) {
    const [array, compareFn] = valueArgsValidate(arraySortArgs, args);
    if (compareFn === null) {
        return array.sort(valueCompare);
    }
    return array.sort((...sortArgs) => compareFn(sortArgs, options));
}

const arraySortArgs = valueArgsModel([
    {'name': 'array', 'type': 'array'},
    {'name': 'compareFn', 'type': 'function', 'nullable': true}
]);


//
// Coverage functions
//


// Coverage configuration object global variable name
export const coverageGlobalName = '__bareScriptCoverage';


// $function: coverageGlobalGet
// $group: Coverage
// $doc: Get the coverage global object
// $return: The [coverage global object](https://craigahobbs.github.io/bare-script/model/#var.vName='CoverageGlobal')
function coverageGlobalGet(unusedArgs, options) {
    const globals = (options !== null ? (options.globals ?? null) : null);
    return globals !== null ? (globals[coverageGlobalName] ?? null) : null;
}


// $function: coverageGlobalName
// $group: Coverage
// $doc: Get the coverage global variable name
// $return: The coverage global variable name
function coverageGlobalNameFn() {
    return coverageGlobalName;
}


// $function: coverageStart
// $group: Coverage
// $doc: Start coverage data collection
function coverageStart(unusedArgs, options) {
    const globals = (options !== null ? (options.globals ?? null) : null);
    if (globals !== null) {
        const coverageGlobal = {'enabled': true};
        globals[coverageGlobalName] = coverageGlobal;
    }
}


// $function: coverageStop
// $group: Coverage
// $doc: Stop coverage data collection
function coverageStop(unusedArgs, options) {
    const globals = (options !== null ? (options.globals ?? null) : null);
    if (globals !== null) {
        const coverageGlobal = globals[coverageGlobalName] ?? null;
        if (coverageGlobal !== null) {
            globals[coverageGlobalName].enabled = false;
        }
    }
}


//
// Data functions
//


// $function: dataAggregate
// $group: Data
// $doc: Aggregate a data array
// $arg data: The data array
// $arg aggregation: The [aggregation model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='Aggregation')
// $return: The aggregated data array
function dataAggregate(args) {
    const [data, aggregation] = valueArgsValidate(dataAggregateArgs, args);
    return aggregateData(data, aggregation);
}

const dataAggregateArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'aggregation', 'type': 'object'}
]);


// $function: dataCalculatedField
// $group: Data
// $doc: Add a calculated field to a data array
// $arg data: The data array
// $arg fieldName: The calculated field name
// $arg expr: The calculated field expression
// $arg variables: Optional (default is null). A variables object the expression evaluation.
// $return: The updated data array
function dataCalculatedField(args, options) {
    const [data, fieldName, expr, variables] = valueArgsValidate(dataCalculatedFieldArgs, args);
    return addCalculatedField(data, fieldName, expr, variables, options);
}

const dataCalculatedFieldArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'fieldName', 'type': 'string'},
    {'name': 'expr', 'type': 'string'},
    {'name': 'variables', 'type': 'object', 'nullable': true}
]);


// $function: dataFilter
// $group: Data
// $doc: Filter a data array
// $arg data: The data array
// $arg expr: The filter expression
// $arg variables: Optional (default is null). A variables object the expression evaluation.
// $return: The filtered data array
function dataFilter(args, options) {
    const [data, expr, variables] = valueArgsValidate(dataFilterArgs, args);
    return filterData(data, expr, variables, options);
}

const dataFilterArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'expr', 'type': 'string'},
    {'name': 'variables', 'type': 'object', 'nullable': true}
]);


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
function dataJoin(args, options) {
    const [leftData, rightData, joinExpr, rightExpr, isLeftJoin, variables] = valueArgsValidate(dataJoinArgs, args);
    return joinData(leftData, rightData, joinExpr, rightExpr, isLeftJoin, variables, options);
}

const dataJoinArgs = valueArgsModel([
    {'name': 'leftData', 'type': 'array'},
    {'name': 'rightData', 'type': 'array'},
    {'name': 'joinExpr', 'type': 'string'},
    {'name': 'rightExpr', 'type': 'string', 'nullable': true},
    {'name': 'isLeftJoin', 'type': 'boolean', 'default': false},
    {'name': 'variables', 'type': 'object', 'nullable': true}
]);


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
            throw new ValueArgsError('text', arg);
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
function dataSort(args) {
    const [data, sorts] = valueArgsValidate(dataSortArgs, args);
    return sortData(data, sorts);
}

const dataSortArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'sorts', 'type': 'array'}
]);


// $function: dataTop
// $group: Data
// $doc: Keep the top rows for each category
// $arg data: The data array
// $arg count: The number of rows to keep (default is 1)
// $arg categoryFields: Optional (default is null). The category fields.
// $return: The top data array
function dataTop(args) {
    const [data, count, categoryFields] = valueArgsValidate(dataTopArgs, args);
    return topData(data, count, categoryFields);
}

const dataTopArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'count', 'type': 'number', 'integer': true, 'gte': 1},
    {'name': 'categoryFields', 'type': 'array', 'nullable': true}
]);


// $function: dataValidate
// $group: Data
// $doc: Validate a data array
// $arg data: The data array
// $arg csv: Optional (default is false). If true, parse value strings.
// $return: The validated data array
function dataValidate(args) {
    const [data, csv] = valueArgsValidate(dataValidateArgs, args);
    validateData(data, csv);
    return data;
}

const dataValidateArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'csv', 'type': 'boolean', 'default': false}
]);


//
// Datetime functions
//


// $function: datetimeDay
// $group: Datetime
// $doc: Get the day of the month of a datetime
// $arg datetime: The datetime
// $return: The day of the month
function datetimeDay(args) {
    const [datetime] = valueArgsValidate(datetimeDayArgs, args);
    return datetime.getDate();
}

const datetimeDayArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


// $function: datetimeHour
// $group: Datetime
// $doc: Get the hour of a datetime
// $arg datetime: The datetime
// $return: The hour
function datetimeHour(args) {
    const [datetime] = valueArgsValidate(datetimeHourArgs, args);
    return datetime.getHours();
}

const datetimeHourArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


// $function: datetimeISOFormat
// $group: Datetime
// $doc: Format the datetime as an ISO date/time string
// $arg datetime: The datetime
// $arg isDate: If true, format the datetime as an ISO date
// $return: The formatted datetime string
function datetimeISOFormat(args) {
    const [datetime, isDate] = valueArgsValidate(datetimeISOFormatArgs, args);

    if (isDate) {
        const year = String(datetime.getFullYear()).padStart(4, '0');
        const month = String(datetime.getMonth() + 1).padStart(2, '0');
        const day = String(datetime.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return valueString(datetime);
}

const datetimeISOFormatArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'},
    {'name': 'isDate', 'type': 'boolean', 'default': false}
]);


// $function: datetimeISOParse
// $group: Datetime
// $doc: Parse an ISO date/time string
// $arg string: The ISO date/time string
// $return: The datetime, or null if parsing fails
function datetimeISOParse(args) {
    const [string] = valueArgsValidate(datetimeISOParseArgs, args);
    return valueParseDatetime(string);
}

const datetimeISOParseArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


// $function: datetimeMillisecond
// $group: Datetime
// $doc: Get the millisecond of a datetime
// $arg datetime: The datetime
// $return: The millisecond
function datetimeMillisecond(args) {
    const [datetime] = valueArgsValidate(datetimeMillisecondArgs, args);
    return datetime.getMilliseconds();
}

const datetimeMillisecondArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


// $function: datetimeMinute
// $group: Datetime
// $doc: Get the minute of a datetime
// $arg datetime: The datetime
// $return: The minute
function datetimeMinute(args) {
    const [datetime] = valueArgsValidate(datetimeMinuteArgs, args);
    return datetime.getMinutes();
}

const datetimeMinuteArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


// $function: datetimeMonth
// $group: Datetime
// $doc: Get the month (1-12) of a datetime
// $arg datetime: The datetime
// $return: The month
function datetimeMonth(args) {
    const [datetime] = valueArgsValidate(datetimeMonthArgs, args);
    return datetime.getMonth() + 1;
}

const datetimeMonthArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


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
function datetimeNew(args) {
    const [year, month, day, hour, minute, second, millisecond] = valueArgsValidate(datetimeNewArgs, args);
    return new Date(year, month - 1, day, hour, minute, second, millisecond);
}

const datetimeNewArgs = valueArgsModel([
    {'name': 'year', 'type': 'number', 'integer': true, 'gte': 100},
    {'name': 'month', 'type': 'number', 'integer': true},
    {'name': 'day', 'type': 'number', 'integer': true, 'gte': -10000, 'lte': 10000},
    {'name': 'hour', 'type': 'number', 'default': 0, 'integer': true},
    {'name': 'minute', 'type': 'number', 'default': 0, 'integer': true},
    {'name': 'second', 'type': 'number', 'default': 0, 'integer': true},
    {'name': 'millisecond', 'type': 'number', 'default': 0, 'integer': true}
]);


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
function datetimeSecond(args) {
    const [datetime] = valueArgsValidate(datetimeSecondArgs, args);
    return datetime.getSeconds();
}

const datetimeSecondArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


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
function datetimeYear(args) {
    const [datetime] = valueArgsValidate(datetimeYearArgs, args);
    return datetime.getFullYear();
}

const datetimeYearArgs = valueArgsModel([
    {'name': 'datetime', 'type': 'datetime'}
]);


//
// JSON functions
//


// $function: jsonParse
// $group: JSON
// $doc: Convert a JSON string to an object
// $arg string: The JSON string
// $return: The object
function jsonParse(args) {
    const [string] = valueArgsValidate(jsonParseArgs, args);
    return JSON.parse(string);
}

const jsonParseArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


// $function: jsonStringify
// $group: JSON
// $doc: Convert an object to a JSON string
// $arg value: The object
// $arg indent: Optional (default is null). The indentation number.
// $return: The JSON string
function jsonStringify(args) {
    const [value, indent] = valueArgsValidate(jsonStringifyArgs, args);
    return valueJSON(value, indent);
}

const jsonStringifyArgs = valueArgsModel([
    {'name': 'value'},
    {'name': 'indent', 'type': 'number', 'nullable': true, 'integer': true, 'gte': 1}
]);


//
// Math functions
//


// $function: mathAbs
// $group: Math
// $doc: Compute the absolute value of a number
// $arg x: The number
// $return: The absolute value of the number
function mathAbs(args) {
    const [x] = valueArgsValidate(mathAbsArgs, args);
    return Math.abs(x);
}

const mathAbsArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathAcos
// $group: Math
// $doc: Compute the arccosine, in radians, of a number
// $arg x: The number
// $return: The arccosine, in radians, of the number
function mathAcos(args) {
    const [x] = valueArgsValidate(mathAcosArgs, args);
    return Math.acos(x);
}

const mathAcosArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathAsin
// $group: Math
// $doc: Compute the arcsine, in radians, of a number
// $arg x: The number
// $return: The arcsine, in radians, of the number
function mathAsin(args) {
    const [x] = valueArgsValidate(mathAsinArgs, args);
    return Math.asin(x);
}

const mathAsinArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathAtan
// $group: Math
// $doc: Compute the arctangent, in radians, of a number
// $arg x: The number
// $return: The arctangent, in radians, of the number
function mathAtan(args) {
    const [x] = valueArgsValidate(mathAtanArgs, args);
    return Math.atan(x);
}

const mathAtanArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathAtan2
// $group: Math
// $doc: Compute the angle, in radians, between (0, 0) and a point
// $arg y: The Y-coordinate of the point
// $arg x: The X-coordinate of the point
// $return: The angle, in radians
function mathAtan2(args) {
    const [y, x] = valueArgsValidate(mathAtan2Args, args);
    return Math.atan2(y, x);
}

const mathAtan2Args = valueArgsModel([
    {'name': 'y', 'type': 'number'},
    {'name': 'x', 'type': 'number'}
]);


// $function: mathCeil
// $group: Math
// $doc: Compute the ceiling of a number (round up to the next highest integer)
// $arg x: The number
// $return: The ceiling of the number
function mathCeil(args) {
    const [x] = valueArgsValidate(mathCeilArgs, args);
    return Math.ceil(x);
}

const mathCeilArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathCos
// $group: Math
// $doc: Compute the cosine of an angle, in radians
// $arg x: The angle, in radians
// $return: The cosine of the angle
function mathCos(args) {
    const [x] = valueArgsValidate(mathCosArgs, args);
    return Math.cos(x);
}

const mathCosArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathFloor
// $group: Math
// $doc: Compute the floor of a number (round down to the next lowest integer)
// $arg x: The number
// $return: The floor of the number
function mathFloor(args) {
    const [x] = valueArgsValidate(mathFloorArgs, args);
    return Math.floor(x);
}

const mathFloorArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathLn
// $group: Math
// $doc: Compute the natural logarithm (base e) of a number
// $arg x: The number
// $return: The natural logarithm of the number
function mathLn(args) {
    const [x] = valueArgsValidate(mathLnArgs, args);
    return Math.log(x);
}

const mathLnArgs = valueArgsModel([
    {'name': 'x', 'type': 'number', 'gt': 0}
]);


// $function: mathLog
// $group: Math
// $doc: Compute the logarithm (base 10) of a number
// $arg x: The number
// $arg base: Optional (default is 10). The logarithm base.
// $return: The logarithm of the number
function mathLog(args) {
    const [x, base] = valueArgsValidate(mathLogArgs, args);
    if (base === 1) {
        throw new ValueArgsError('base', base);
    }

    return Math.log(x) / Math.log(base);
}

const mathLogArgs = valueArgsModel([
    {'name': 'x', 'type': 'number', 'gt': 0},
    {'name': 'base', 'type': 'number', 'default': 10, 'gt': 0}
]);


// $function: mathMax
// $group: Math
// $doc: Compute the maximum value
// $arg values...: The values
// $return: The maximum value
function mathMax(values) {
    let result;
    for (const value of values) {
        if (typeof result === 'undefined' || valueCompare(value, result) > 0) {
            result = value;
        }
    }
    return result ?? null;
}


// $function: mathMin
// $group: Math
// $doc: Compute the minimum value
// $arg values...: The values
// $return: The minimum value
function mathMin(values) {
    let result;
    for (const value of values) {
        if (typeof result === 'undefined' || valueCompare(value, result) < 0) {
            result = value;
        }
    }
    return result ?? null;
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
function mathRound(args) {
    const [x, digits] = valueArgsValidate(mathRoundArgs, args);
    return valueRoundNumber(x, digits);
}

const mathRoundArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'digits', 'type': 'number', 'default': 0, 'integer': true, 'gte': 0}
]);


// $function: mathSign
// $group: Math
// $doc: Compute the sign of a number
// $arg x: The number
// $return: -1 for a negative number, 1 for a positive number, and 0 for zero
function mathSign(args) {
    const [x] = valueArgsValidate(mathSignArgs, args);
    return Math.sign(x);
}

const mathSignArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathSin
// $group: Math
// $doc: Compute the sine of an angle, in radians
// $arg x: The angle, in radians
// $return: The sine of the angle
function mathSin(args) {
    const [x] = valueArgsValidate(mathSinArgs, args);
    return Math.sin(x);
}

const mathSinArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: mathSqrt
// $group: Math
// $doc: Compute the square root of a number
// $arg x: The number
// $return: The square root of the number
function mathSqrt(args) {
    const [x] = valueArgsValidate(mathSqrtArgs, args);
    return Math.sqrt(x);
}

const mathSqrtArgs = valueArgsModel([
    {'name': 'x', 'type': 'number', 'gte': 0}
]);


// $function: mathTan
// $group: Math
// $doc: Compute the tangent of an angle, in radians
// $arg x: The angle, in radians
// $return: The tangent of the angle
function mathTan(args) {
    const [x] = valueArgsValidate(mathTanArgs, args);
    return Math.tan(x);
}

const mathTanArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


//
// Number functions
//


// $function: numberParseFloat
// $group: Number
// $doc: Parse a string as a floating point number
// $arg string: The string
// $return: The number
function numberParseFloat(args) {
    const [string] = valueArgsValidate(numberParseFloatArgs, args);
    return valueParseNumber(string);
}

const numberParseFloatArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


// $function: numberParseInt
// $group: Number
// $doc: Parse a string as an integer
// $arg string: The string
// $arg radix: Optional (default is 10). The number base.
// $return: The integer
function numberParseInt(args) {
    const [string, radix] = valueArgsValidate(numberParseIntArgs, args);
    return valueParseInteger(string, radix);
}

const numberParseIntArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'radix', 'type': 'number', 'default': 10, 'integer': true, 'gte': 2, 'lte': 36}
]);


// $function: numberToFixed
// $group: Number
// $doc: Format a number using fixed-point notation
// $arg x: The number
// $arg digits: Optional (default is 2). The number of digits to appear after the decimal point.
// $arg trim: Optional (default is false). If true, trim trailing zeroes and decimal point.
// $return: The fixed-point notation string
function numberToFixed(args) {
    const [x, digits, trim] = valueArgsValidate(numberToFixedArgs, args);
    let result = x.toFixed(digits);
    if (trim) {
        result = result.replace(rNumberCleanup, '');
    }
    return result;
}

const numberToFixedArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'digits', 'type': 'number', 'default': 2, 'integer': true, 'gte': 0},
    {'name': 'trim', 'type': 'boolean', 'default': false}
]);

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
function objectAssign(args) {
    const [object, object2] = valueArgsValidate(objectAssignArgs, args);
    Object.assign(object, object2);
    return object;
}

const objectAssignArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'},
    {'name': 'object2', 'type': 'object'}
]);


// $function: objectCopy
// $group: Object
// $doc: Create a copy of an object
// $arg object: The object to copy
// $return: The object copy
function objectCopy(args) {
    const [object] = valueArgsValidate(objectCopyArgs, args);
    return {...object};
}

const objectCopyArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'}
]);


// $function: objectDelete
// $group: Object
// $doc: Delete an object key
// $arg object: The object
// $arg key: The key to delete
function objectDelete(args) {
    const [object, key] = valueArgsValidate(objectDeleteArgs, args);
    delete object[key];
}

const objectDeleteArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'},
    {'name': 'key', 'type': 'string'}
]);


// $function: objectGet
// $group: Object
// $doc: Get an object key's value
// $arg object: The object
// $arg key: The key
// $arg defaultValue: The default value (optional)
// $return: The value or null if the key does not exist
function objectGet(args) {
    const [,,defaultValueArg = null] = args;
    const [object, key, defaultValue] = valueArgsValidate(objectGetArgs, args, defaultValueArg);
    return object[key] ?? defaultValue;
}

const objectGetArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'},
    {'name': 'key', 'type': 'string'},
    {'name': 'defaultValue'}
]);


// $function: objectHas
// $group: Object
// $doc: Test if an object contains a key
// $arg object: The object
// $arg key: The key
// $return: true if the object contains the key, false otherwise
function objectHas(args) {
    const [object, key] = valueArgsValidate(objectHasArgs, args, false);
    return key in object;
}

const objectHasArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'},
    {'name': 'key', 'type': 'string'}
]);


// $function: objectKeys
// $group: Object
// $doc: Get an object's keys
// $arg object: The object
// $return: The array of keys
function objectKeys(args) {
    const [object] = valueArgsValidate(objectKeysArgs, args);
    return Object.keys(object);
}

const objectKeysArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'}
]);


// $function: objectNew
// $group: Object
// $doc: Create a new object
// $arg keyValues...: The object's initial key and value pairs
// $return: The new object
function objectNew(keyValues) {
    const object = {};
    for (let ix = 0; ix < keyValues.length; ix += 2) {
        const key = keyValues[ix];
        const value = ix + 1 < keyValues.length ? keyValues[ix + 1] : null;
        if (valueType(key) !== 'string') {
            throw new ValueArgsError('keyValues', key);
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
function objectSet(args) {
    const [object, key, value] = valueArgsValidate(objectSetArgs, args);
    object[key] = value;
    return value;
}

const objectSetArgs = valueArgsModel([
    {'name': 'object', 'type': 'object'},
    {'name': 'key', 'type': 'string'},
    {'name': 'value'}
]);


//
// Regex functions
//


// $function: regexEscape
// $group: Regex
// $doc: Escape a string for use in a regular expression
// $arg string: The string to escape
// $return: The escaped string
function regexEscape(args) {
    const [string] = valueArgsValidate(regexEscapeArgs, args);
    return string.replace(rRegexEscape, '\\$&');
}

const regexEscapeArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);

const rRegexEscape = /[.*+?^${}()|[\]\\]/g;


// $function: regexMatch
// $group: Regex
// $doc: Find the first match of a regular expression in a string
// $arg regex: The regular expression
// $arg string: The string
// $return: The [match object](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='RegexMatch'),
// $return: or null if no matches are found
function regexMatch(args) {
    const [regex, string] = valueArgsValidate(regexMatchArgs, args);
    const match = string.match(regex);
    return match !== null ? regexMatchGroups(match) : null;
}

const regexMatchArgs = valueArgsModel([
    {'name': 'regex', 'type': 'regex'},
    {'name': 'string', 'type': 'string'}
]);


// $function: regexMatchAll
// $group: Regex
// $doc: Find all matches of regular expression in a string
// $arg regex: The regular expression
// $arg string: The string
// $return: The array of [match objects](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='RegexMatch')
function regexMatchAll(args) {
    const [regex, string] = valueArgsValidate(regexMatchAllArgs, args);
    const regexGlobal = regexEnsureGlobal(regex);
    return Array.from(string.matchAll(regexGlobal)).map((match) => regexMatchGroups(match));
}

const regexMatchAllArgs = valueArgsModel([
    {'name': 'regex', 'type': 'regex'},
    {'name': 'string', 'type': 'string'}
]);


// Helper te re-compile regex with the global flag and cache
function regexEnsureGlobal(regex) {
    let regexGlobal = regex;
    const {source, flags} = regex;
    if (flags.indexOf('g') === -1) {
        let sourceCache = regexGlobalCache[source] ?? null;
        if (sourceCache === null) {
            sourceCache = {};
            regexGlobalCache[source] = sourceCache;
        }
        let flagsCache = sourceCache[flags] ?? null;
        if (flagsCache === null) {
            flagsCache = {};
            sourceCache[flags] = flagsCache;
        }
        regexGlobal = flagsCache[flags] ?? null;
        if (regexGlobal === null) {
            regexGlobal = new RegExp(source, `${flags}g`);
            flagsCache[flags] = regexGlobal;
        }
    }
    return regexGlobal;
}

const regexGlobalCache = {};


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
function regexNew(args) {
    const [pattern, flags] = valueArgsValidate(regexNewArgs, args);

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

const regexNewArgs = valueArgsModel([
    {'name': 'pattern', 'type': 'string'},
    {'name': 'flags', 'type': 'string', 'nullable': true}
]);


// $function: regexReplace
// $group: Regex
// $doc: Replace regular expression matches with a string
// $arg regex: The replacement regular expression
// $arg string: The string
// $arg substr: The replacement string
// $return: The updated string
function regexReplace(args) {
    const [regex, string, substr] = valueArgsValidate(regexReplaceArgs, args);
    const regexGlobal = regexEnsureGlobal(regex);
    return string.replaceAll(regexGlobal, substr);
}

const regexReplaceArgs = valueArgsModel([
    {'name': 'regex', 'type': 'regex'},
    {'name': 'string', 'type': 'string'},
    {'name': 'substr', 'type': 'string'}
]);


// $function: regexSplit
// $group: Regex
// $doc: Split a string with a regular expression
// $arg regex: The regular expression
// $arg string: The string
// $return: The array of split parts
function regexSplit(args) {
    const [regex, string] = valueArgsValidate(regexSplitArgs, args);
    return string.split(regex);
}

const regexSplitArgs = valueArgsModel([
    {'name': 'regex', 'type': 'regex'},
    {'name': 'string', 'type': 'string'}
]);


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
function schemaParseEx(args) {
    const [lines, typesArg, filename] = valueArgsValidate(schemaParseExArgs, args);
    const linesType = valueType(lines);
    const types = typesArg !== null ? typesArg : {};
    if (linesType !== 'array' && linesType !== 'string') {
        throw new ValueArgsError('lines', lines);
    }

    return parseSchemaMarkdown(lines, {types, filename});
}

const schemaParseExArgs = valueArgsModel([
    {'name': 'lines'},
    {'name': 'types', 'type': 'object', 'nullable': true},
    {'name': 'filename', 'type': 'string', 'default': ''}
]);


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
function schemaValidate(args) {
    const [types, typeName, value] = valueArgsValidate(schemaValidateArgs, args);
    validateTypeModel(types);
    return validateType(types, typeName, value);
}

const schemaValidateArgs = valueArgsModel([
    {'name': 'types', 'type': 'object'},
    {'name': 'typeName', 'type': 'string'},
    {'name': 'value'}
]);


// $function: schemaValidateTypeModel
// $group: Schema
// $doc: Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
// $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types') to validate
// $return: The validated [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
function schemaValidateTypeModel(args) {
    const [types] = valueArgsValidate(schemaValidateTypeModelArgs, args);
    return validateTypeModel(types);
}

const schemaValidateTypeModelArgs = valueArgsModel([
    {'name': 'types', 'type': 'object'}
]);


//
// String functions
//


// $function: stringCharCodeAt
// $group: String
// $doc: Get a string index's character code
// $arg string: The string
// $arg index: The character index
// $return: The character code
function stringCharCodeAt(args) {
    const [string, index] = valueArgsValidate(stringCharCodeAtArgs, args);
    if (index >= string.length) {
        throw new ValueArgsError('index', index);
    }

    return string.charCodeAt(index);
}

const stringCharCodeAtArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'index', 'type': 'number', 'integer': true, 'gte': 0}
]);


// $function: stringEndsWith
// $group: String
// $doc: Determine if a string ends with a search string
// $arg string: The string
// $arg search: The search string
// $return: true if the string ends with the search string, false otherwise
function stringEndsWith(args) {
    const [string, search] = valueArgsValidate(stringEndsWithArgs, args);
    return string.endsWith(search);
}

const stringEndsWithArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'search', 'type': 'string'}
]);


// $function: stringFromCharCode
// $group: String
// $doc: Create a string of characters from character codes
// $arg charCodes...: The character codes
// $return: The string of characters
function stringFromCharCode(charCodes) {
    for (const code of charCodes) {
        if (valueType(code) !== 'number' || Math.floor(code) !== code || code < 0) {
            throw new ValueArgsError('charCodes', code);
        }
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
function stringIndexOf(args) {
    const [string, search, index] = valueArgsValidate(stringIndexOfArgs, args, -1);
    if (index >= string.length) {
        throw new ValueArgsError('index', index, -1);
    }

    return string.indexOf(search, index);
}

const stringIndexOfArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'search', 'type': 'string'},
    {'name': 'index', 'type': 'number', 'default': 0, 'integer': true, 'gte': 0}
]);


// $function: stringLastIndexOf
// $group: String
// $doc: Find the last index of a search string in a string
// $arg string: The string
// $arg search: The search string
// $arg index: Optional (default is the end of the string). The index at which to start the search.
// $return: The last index of the search string; -1 if not found.
function stringLastIndexOf(args) {
    const [string, search, indexArg] = valueArgsValidate(stringLastIndexOfArgs, args, -1);
    const index = indexArg !== null ? indexArg : string.length - 1;
    if (index >= string.length) {
        throw new ValueArgsError('index', index, -1);
    }

    return string.lastIndexOf(search, index);
}

const stringLastIndexOfArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'search', 'type': 'string'},
    {'name': 'index', 'type': 'number', 'nullable': true, 'integer': true, 'gte': 0}
]);


// $function: stringLength
// $group: String
// $doc: Get the length of a string
// $arg string: The string
// $return: The string's length; zero if not a string
function stringLength(args) {
    const [string] = valueArgsValidate(stringLengthArgs, args, 0);
    return string.length;
}

const stringLengthArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


// $function: stringLower
// $group: String
// $doc: Convert a string to lower-case
// $arg string: The string
// $return: The lower-case string
function stringLower(args) {
    const [string] = valueArgsValidate(stringLowerArgs, args);
    return string.toLowerCase();
}

const stringLowerArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


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
function stringRepeat(args) {
    const [string, count] = valueArgsValidate(stringRepeatArgs, args);
    return string.repeat(count);
}

const stringRepeatArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'count', 'type': 'number', 'integer': true, 'gte': 0}
]);


// $function: stringReplace
// $group: String
// $doc: Replace all instances of a string with another string
// $arg string: The string to update
// $arg substr: The string to replace
// $arg newSubstr: The replacement string
// $return: The updated string
function stringReplace(args) {
    const [string, substr, newSubstr] = valueArgsValidate(stringReplaceArgs, args);
    return string.replaceAll(substr, newSubstr);
}

const stringReplaceArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'substr', 'type': 'string'},
    {'name': 'newSubstr', 'type': 'string'}
]);


// $function: stringSlice
// $group: String
// $doc: Copy a portion of a string
// $arg string: The string
// $arg start: The start index of the slice
// $arg end: Optional (default is the end of the string). The end index of the slice.
// $return: The new string slice
function stringSlice(args) {
    const [string, start, endArg] = valueArgsValidate(stringSliceArgs, args);
    const end = endArg !== null ? endArg : string.length;
    if (start > string.length) {
        throw new ValueArgsError('start', start);
    }
    if (end > string.length) {
        throw new ValueArgsError('end', end);
    }

    return string.slice(start, end);
}

const stringSliceArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'start', 'type': 'number', 'integer': true, 'gte': 0},
    {'name': 'end', 'type': 'number', 'nullable': true, 'integer': true, 'gte': 0}
]);


// $function: stringSplit
// $group: String
// $doc: Split a string
// $arg string: The string to split
// $arg separator: The separator string
// $return: The array of split-out strings
function stringSplit(args) {
    const [string, separator] = valueArgsValidate(stringSplitArgs, args);
    return string.split(separator);
}

const stringSplitArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'separator', 'type': 'string'}
]);


// $function: stringStartsWith
// $group: String
// $doc: Determine if a string starts with a search string
// $arg string: The string
// $arg search: The search string
// $return: true if the string starts with the search string, false otherwise
function stringStartsWith(args) {
    const [string, search] = valueArgsValidate(stringStartsWithArgs, args);
    return string.startsWith(search);
}

const stringStartsWithArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'},
    {'name': 'search', 'type': 'string'}
]);


// $function: stringTrim
// $group: String
// $doc: Trim the whitespace from the beginning and end of a string
// $arg string: The string
// $return: The trimmed string
function stringTrim(args) {
    const [string] = valueArgsValidate(stringTrimArgs, args);
    return string.trim();
}

const stringTrimArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


// $function: stringUpper
// $group: String
// $doc: Convert a string to upper-case
// $arg string: The string
// $return: The upper-case string
function stringUpper(args) {
    const [string] = valueArgsValidate(stringUpperArgs, args);
    return string.toUpperCase();
}

const stringUpperArgs = valueArgsModel([
    {'name': 'string', 'type': 'string'}
]);


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
// $arg url: The resource URL,
// $arg url: [request model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest'),
// $arg url: or array of URL and
// $arg url: [request model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest')
// $return: The response string or array of strings; null if an error occurred
async function systemFetch([url = null], options) {
    // Options
    const fetchFn = options !== null ? (options.fetchFn ?? null) : null;
    const logFn = options !== null && options.debug ? (options.logFn ?? null) : null;
    const urlFn = options !== null ? (options.urlFn ?? null) : null;

    // Validate the URL argument
    const requests = [];
    let isResponseArray = false;
    const urlType = valueType(url);
    if (urlType === 'string') {
        requests.push({'url': url});
    } else if (urlType === 'object') {
        requests.push(validateType(systemFetchTypes, 'SystemFetchRequest', url));
    } else if (urlType === 'array') {
        isResponseArray = true;
        for (const urlItem of url) {
            if (valueType(urlItem) === 'string') {
                requests.push({'url': urlItem});
            } else {
                requests.push(validateType(systemFetchTypes, 'SystemFetchRequest', urlItem));
            }
        }
    } else {
        throw new ValueArgsError('url', url);
    }

    // Fetch in parallel
    const fetchResponses = await Promise.all(requests.map(async (request) => {
        try {
            const fetchURL = urlFn !== null ? urlFn(request.url) : request.url;
            const fetchOptions = {};
            if ((request.body ?? null) !== null) {
                fetchOptions.method = 'POST';
                fetchOptions.body = request.body;
            }
            if ((request.headers ?? null) !== null) {
                fetchOptions.headers = request.headers;
            }
            return fetchFn !== null ? await fetchFn(fetchURL, fetchOptions) : null;
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
function systemGlobalGet(args, options) {
    const [name, defaultValue] = valueArgsValidate(systemGlobalGetArgs, args);
    const globals = (options !== null ? (options.globals ?? null) : null);
    return globals !== null ? (globals[name] ?? defaultValue) : defaultValue;
}

const systemGlobalGetArgs = valueArgsModel([
    {'name': 'name', 'type': 'string'},
    {'name': 'defaultValue'}
]);


// $function: systemGlobalSet
// $group: System
// $doc: Set a global variable value
// $arg name: The global variable name
// $arg value: The global variable's value
// $return: The global variable's value
function systemGlobalSet(args, options) {
    const [name, value] = valueArgsValidate(systemGlobalSetArgs, args);
    const globals = (options !== null ? (options.globals ?? null) : null);
    if (globals !== null) {
        globals[name] = value;
    }
    return value;
}

const systemGlobalSetArgs = valueArgsModel([
    {'name': 'name', 'type': 'string'},
    {'name': 'value'}
]);


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
function systemPartial(args) {
    const [func, funcArgs] = valueArgsValidate(systemPartialArgs, args);
    if (funcArgs.length < 1) {
        throw new ValueArgsError('args', funcArgs);
    }

    if (func.constructor.name === 'AsyncFunction') {
        // eslint-disable-next-line require-await
        return async (argsExtra, options) => func([...funcArgs, ...argsExtra], options);
    }
    return (argsExtra, options) => func([...funcArgs, ...argsExtra], options);
}

const systemPartialArgs = valueArgsModel([
    {'name': 'func', 'type': 'function'},
    {'name': 'args', 'lastArgArray': true}
]);


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
// $return: The encoded URL string
function urlEncode(args) {
    const [url] = valueArgsValidate(urlEncodeArgs, args);
    let urlEncoded = encodeURI(url);

    // Encode '(' and ')' (for Markdown links)
    urlEncoded = urlEncoded.replaceAll('(', '%28');
    urlEncoded = urlEncoded.replaceAll(')', '%29');

    return urlEncoded;
}

const urlEncodeArgs = valueArgsModel([
    {'name': 'url', 'type': 'string'}
]);


// $function: urlEncodeComponent
// $group: URL
// $doc: Encode a URL component
// $arg url: The URL component string
// $return: The encoded URL component string
function urlEncodeComponent(args) {
    const [url] = valueArgsValidate(urlEncodeComponentArgs, args);
    let urlEncoded = encodeURIComponent(url);

    // Encode '(' and ')' (for Markdown links)
    urlEncoded = urlEncoded.replaceAll('(', '%28');
    urlEncoded = urlEncoded.replaceAll(')', '%29');

    return urlEncoded;
}

const urlEncodeComponentArgs = valueArgsModel([
    {'name': 'url', 'type': 'string'}
]);


// The built-in script functions
export const scriptFunctions = {
    arrayCopy,
    arrayDelete,
    arrayExtend,
    arrayFlat,
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
    coverageGlobalGet,
    'coverageGlobalName': coverageGlobalNameFn,
    coverageStart,
    coverageStop,
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
    'arrayNew': 'arrayNew',
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
    'objectNew': 'objectNew',
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
