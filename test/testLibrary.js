// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/* eslint-disable id-length */

import {coverageGlobalName, expressionFunctions, scriptFunctions, systemGlobalIncludesName} from '../lib/library.js';
import {valueJSON, valueParseDatetime, valueString} from '../lib/value.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


// Check the built-in expression functions
test('library, built-in expression functions', () => {
    assert.deepEqual(
        Object.entries(expressionFunctions).map(([fnName, fn]) => [fnName, typeof fn === 'function']),
        [
            ['abs', true],
            ['acos', true],
            ['arrayNew', true],
            ['asin', true],
            ['atan', true],
            ['atan2', true],
            ['ceil', true],
            ['charCodeAt', true],
            ['cos', true],
            ['date', true],
            ['day', true],
            ['endsWith', true],
            ['indexOf', true],
            ['fixed', true],
            ['floor', true],
            ['fromCharCode', true],
            ['hour', true],
            ['lastIndexOf', true],
            ['len', true],
            ['lower', true],
            ['ln', true],
            ['log', true],
            ['max', true],
            ['min', true],
            ['minute', true],
            ['month', true],
            ['now', true],
            ['objectNew', true],
            ['parseInt', true],
            ['parseFloat', true],
            ['pi', true],
            ['rand', true],
            ['replace', true],
            ['rept', true],
            ['round', true],
            ['second', true],
            ['sign', true],
            ['sin', true],
            ['slice', true],
            ['sqrt', true],
            ['startsWith', true],
            ['text', true],
            ['tan', true],
            ['today', true],
            ['trim', true],
            ['upper', true],
            ['year', true]
        ]
    );
});


//
// Array functions
//


test('library, arrayCopy', () => {
    const array = [1, 2, 3];
    const result = scriptFunctions.arrayCopy([array], null);
    assert.deepEqual(result, [1, 2, 3]);
    assert.notEqual(result, array);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayCopy([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );
});


test('library, arrayDelete', () => {
    const array = [1, 2, 2, 3];
    assert.equal(scriptFunctions.arrayDelete([array, 1], null), undefined);
    assert.equal(scriptFunctions.arrayDelete([array, 1.0], null), undefined);
    assert.deepEqual(array, [1, 3]);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayDelete([null, 0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arrayDelete([array, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arrayDelete([array, 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 3'
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.arrayDelete([array, '1'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, "1"'
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.arrayDelete([array, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5'
        }
    );
});


test('library, arrayExtend', () => {
    const array = [1, 2, 3];
    const array2 = [4, 5, 6];
    const result = scriptFunctions.arrayExtend([array, array2], null);
    assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);
    assert.equal(result, array);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayExtend([null, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Second non-array
    assert.throws(
        () => {
            scriptFunctions.arrayExtend([array, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array2" argument value, null'
        }
    );
});


test('library, arrayFlat', () => {
    const array = [1, [2, [3, 4], 5], 6];
    assert.deepEqual(scriptFunctions.arrayFlat([array], null), [1, 2, 3, 4, 5, 6]);

    // Cycle
    const arrayDeep = [1];
    let arrayLast = arrayDeep;
    for (let ix = 2; ix <= 12; ix++) {
        const arrayLastNew = [ix];
        arrayLast.push(arrayLastNew);
        arrayLast = arrayLastNew;
    }
    assert.deepEqual(scriptFunctions.arrayFlat([arrayDeep], null), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, [12]]);

    // Depth
    assert.deepEqual(scriptFunctions.arrayFlat([arrayDeep, 3], null), [1, 2, 3, 4, [5, [6, [7, [8, [9, [10, [11, [12]]]]]]]]]);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayFlat([null, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );
});


test('library, arrayGet', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayGet([array, 0], null), 1);
    assert.equal(scriptFunctions.arrayGet([array, 0.], null), 1);
    assert.equal(scriptFunctions.arrayGet([array, 1], null), 2);
    assert.equal(scriptFunctions.arrayGet([array, 2], null), 3);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayGet([null, 0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arrayGet([array, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arrayGet([array, 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 3'
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.arrayGet([array, '1'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, "1"'
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.arrayGet([array, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5'
        }
    );
});


test('library, arrayIndexOf', () => {
    const array = [1, 2, 3, 2];
    assert.equal(scriptFunctions.arrayIndexOf([array, 1], null), 0);
    assert.equal(scriptFunctions.arrayIndexOf([array, 2], null), 1);
    assert.equal(scriptFunctions.arrayIndexOf([array, 3], null), 2);

    // Not found
    assert.equal(scriptFunctions.arrayIndexOf([array, 4], null), -1);

    // Index provided
    assert.equal(scriptFunctions.arrayIndexOf([array, 2, 2], null), 3);
    assert.equal(scriptFunctions.arrayIndexOf([array, 2, 2.], null), 3);

    // Match function
    function valueFn(args, valueOptions) {
        assert.equal(args.length, 1);
        assert.equal(valueOptions, options);
        return args[0] === valueFnValue;
    }
    let valueFnValue = 2;
    const options = {};
    assert.equal(scriptFunctions.arrayIndexOf([array, valueFn], options), 1);

    // Match function, not found
    valueFnValue = 4;
    assert.equal(scriptFunctions.arrayIndexOf([array, valueFn], options), -1);

    // Match function, index provided
    valueFnValue = 2;
    assert.equal(scriptFunctions.arrayIndexOf([array, valueFn, 2], options), 3);
    assert.equal(scriptFunctions.arrayIndexOf([array, valueFn, 2.], options), 3);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayIndexOf([null, 2], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null',
            'returnValue': -1
        }
    );

    // Index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arrayIndexOf([array, 2, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1',
            'returnValue': -1
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arrayIndexOf([array, 2, 4], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 4',
            'returnValue': -1
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.arrayIndexOf([array, 2, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, "abc"',
            'returnValue': -1
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.arrayIndexOf([array, 2, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5',
            'returnValue': -1
        }
    );
});


test('library, arrayJoin', () => {
    const array = ['a', 2, null];
    assert.equal(scriptFunctions.arrayJoin([array, ', '], null), 'a, 2, null');

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayJoin([null, ', '], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Non-string separator
    assert.throws(
        () => {
            scriptFunctions.arrayJoin([array, 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "separator" argument value, 1'
        }
    );
});


test('library, arrayLastIndexOf', () => {
    const array = [1, 2, 3, 2];
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 1], null), 0);
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 2], null), 3);
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 3], null), 2);

    // Not found
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 4], null), -1);

    // Index provided
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 2, 2], null), 1);
    assert.equal(scriptFunctions.arrayLastIndexOf([array, 2, 2.], null), 1);

    // Match function
    function valueFn(args, valueOptions) {
        assert.equal(args.length, 1);
        assert.equal(valueOptions, options);
        return args[0] === valueFnValue;
    }
    let valueFnValue = 2;
    const options = {};
    assert.equal(scriptFunctions.arrayLastIndexOf([array, valueFn], options), 3);

    // Match function, not found
    valueFnValue = 4;
    assert.equal(scriptFunctions.arrayLastIndexOf([array, valueFn], options), -1);

    // Match function, index provided
    valueFnValue = 2;
    assert.equal(scriptFunctions.arrayLastIndexOf([array, valueFn, 2], options), 1);
    assert.equal(scriptFunctions.arrayLastIndexOf([array, valueFn, 2.], options), 1);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayLastIndexOf([null, 2], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null',
            'returnValue': -1
        }
    );

    // Index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arrayLastIndexOf([array, 2, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1',
            'returnValue': -1
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arrayLastIndexOf([array, 2, 4], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 4',
            'returnValue': -1
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.arrayLastIndexOf([array, 2, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, "abc"',
            'returnValue': -1
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.arrayLastIndexOf([array, 2, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5',
            'returnValue': -1
        }
    );
});


test('library, arrayLength', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayLength([array], null), 3);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayLength([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null',
            'returnValue': 0
        }
    );
});


test('library, arrayNew', () => {
    assert.deepEqual(scriptFunctions.arrayNew([], null), []);
    assert.deepEqual(scriptFunctions.arrayNew([1, 2, 3], null), [1, 2, 3]);
});


test('library, arrayNewSize', () => {
    assert.deepEqual(scriptFunctions.arrayNewSize([3], null), [0, 0, 0]);
    assert.deepEqual(scriptFunctions.arrayNewSize([3.], null), [0, 0, 0]);

    // Value provided
    assert.deepEqual(scriptFunctions.arrayNewSize([3, 1], null), [1, 1, 1]);

    // No args
    assert.deepEqual(scriptFunctions.arrayNewSize([], null), []);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayNewSize([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "size" argument value, null'
        }
    );

    // Negative size
    assert.throws(
        () => {
            scriptFunctions.arrayNewSize([-1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "size" argument value, -1'
        }
    );

    // Non-number size
    assert.throws(
        () => {
            scriptFunctions.arrayNewSize(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "size" argument value, "abc"'
        }
    );

    // Non-integer size
    assert.throws(
        () => {
            scriptFunctions.arrayNewSize([1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "size" argument value, 1.5'
        }
    );
});


test('library, arrayPop', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayPop([array], null), 3);
    assert.deepEqual(array, [1, 2]);

    // Empty array
    assert.throws(
        () => {
            scriptFunctions.arrayPop([[]], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, []'
        }
    );

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayPop([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );
});


test('library, arrayPush', () => {
    const array = [1, 2, 3];
    assert.deepEqual(scriptFunctions.arrayPush([array, 5], null), [1, 2, 3, 5]);
    assert.deepEqual(array, [1, 2, 3, 5]);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayPush([null, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );
});


test('library, arraySet', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arraySet([array, 1, 5], null), 5);
    assert.deepEqual(array, [1, 5, 3]);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arraySet([null, 1, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.arraySet([array, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, "abc"'
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.arraySet([array, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5'
        }
    );

    // Index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arraySet([array, -1, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arraySet([array, 3, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 3'
        }
    );
});


test('library, arrayShift', () => {
    const array = [1, 2, 3];
    assert.equal(scriptFunctions.arrayShift([array], null), 1);
    assert.deepEqual(array, [2, 3]);

    // Empty array
    assert.throws(
        () => {
            scriptFunctions.arrayShift([[]], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, []'
        }
    );

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arrayShift([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );
});


test('library, arraySlice', () => {
    const array = [1, 2, 3, 4];
    assert.deepEqual(scriptFunctions.arraySlice([array, 0, 2], null), [1, 2]);
    assert.deepEqual(scriptFunctions.arraySlice([array, 0., 2.], null), [1, 2]);
    assert.deepEqual(scriptFunctions.arraySlice([array, 1, 3], null), [2, 3]);
    assert.deepEqual(scriptFunctions.arraySlice([array, 1, 4], null), [2, 3, 4]);
    assert.deepEqual(scriptFunctions.arraySlice([array, 1], null), [2, 3, 4]);

    // Empty slice
    assert.deepEqual(scriptFunctions.arraySlice([array, 4], null), []);
    assert.deepEqual(scriptFunctions.arraySlice([array, 1, 1], null), []);

    // End index less than start index
    assert.deepEqual(scriptFunctions.arraySlice([array, 2, 1], null), []);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arraySlice([null, 1, 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Start index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, -1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, 5'
        }
    );

    // Non-number start index
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, "abc"'
        }
    );

    // Non-integer start index
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, 1.5'
        }
    );

    // End index outside valid range
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 0, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, -1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 0, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, 5'
        }
    );

    // Non-number end index
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 0, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, "abc"'
        }
    );

    // Non-integer end index
    assert.throws(
        () => {
            scriptFunctions.arraySlice([array, 0, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, 1.5'
        }
    );
});


test('library, arraySort', () => {
    const array = [3, 2, 1];
    assert.deepEqual(scriptFunctions.arraySort([array], null), [1, 2, 3]);
    assert.deepEqual(array, [1, 2, 3]);

    // Compare function
    function compareFn(args, compareOptions) {
        const [a, b] = args;
        assert.equal(compareOptions, options);
        /* c8 ignore next */
        return a < b ? 1 : (a === b ? 0 : -1);
    }
    const options = {};
    assert.deepEqual(scriptFunctions.arraySort([array, compareFn], options), [3, 2, 1]);
    assert.deepEqual(array, [3, 2, 1]);

    // Non-array
    assert.throws(
        () => {
            scriptFunctions.arraySort([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "array" argument value, null'
        }
    );

    // Non-function cmopare function
    assert.throws(
        () => {
            scriptFunctions.arraySort([array, 'asdf'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "compareFn" argument value, "asdf"'
        }
    );
});


//
// Coverage functions
//


test('library, coverageGlobalGet', () => {
    assert.equal(scriptFunctions.coverageGlobalGet([], null), null);

    const options = {};
    assert.equal(scriptFunctions.coverageGlobalGet([], options), null);

    options.globals = {};
    assert.equal(scriptFunctions.coverageGlobalGet([], options), null);

    options.globals[coverageGlobalName] = {'enabled': true};
    assert.equal(scriptFunctions.coverageGlobalGet([], options), options.globals[coverageGlobalName]);
});


test('library, coverageGlobalName', () => {
    assert.equal(scriptFunctions.coverageGlobalName([], null), '__bareScriptCoverage');
});


test('library, coverageStart', () => {
    assert.equal(scriptFunctions.coverageStart([], null), undefined);

    const options = {};
    assert.equal(scriptFunctions.coverageStart([], options), undefined);

    options.globals = {};
    assert.equal(scriptFunctions.coverageStart([], options), undefined);
    assert.deepEqual(options.globals[coverageGlobalName], {'enabled': true});

    options.globals = {[coverageGlobalName]: {'enabled': false}};
    assert.equal(scriptFunctions.coverageStart([], options), undefined);
    assert.deepEqual(options.globals[coverageGlobalName], {'enabled': true});
});


test('library, coverageStop', () => {
    assert.equal(scriptFunctions.coverageStop([], null), undefined);

    const options = {};
    assert.equal(scriptFunctions.coverageStop([], options), undefined);

    options.globals = {};
    assert.equal(scriptFunctions.coverageStop([], options), undefined);
    assert.deepEqual(options.globals[coverageGlobalName], undefined);

    options.globals[coverageGlobalName] = {'enabled': true};
    assert.equal(scriptFunctions.coverageStop([], options), undefined);
    assert.deepEqual(options.globals[coverageGlobalName], {'enabled': false});
});


//
// Data functions
//


test('script library, dataAggregate', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const aggregation = {
        'categories': ['a'],
        'measures': [
            {'field': 'b', 'function': 'sum', 'name': 'sum_b'}
        ]
    };
    assert.deepEqual(scriptFunctions.dataAggregate([data, aggregation], null), [
        {'a': 1, 'sum_b': 7},
        {'a': 2, 'sum_b': 5}
    ]);

    // Non-array data
    assert.throws(
        () => {
            scriptFunctions.dataAggregate([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "data" argument value, null'
        }
    );

    // Non-object aggregation model
    assert.throws(
        () => {
            scriptFunctions.dataAggregate([data, 'invalid'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "aggregation" argument value, "invalid"'
        }
    );

    // Invalid aggregation model
    assert.throws(
        () => {
            scriptFunctions.dataAggregate([data, {}], null);
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'measures' missing"
        }
    );
});


test('script library, dataCalculatedField', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'a * b'], {}), [
        {'a': 1, 'b': 3, 'c': 3},
        {'a': 1, 'b': 4, 'c': 4},
        {'a': 2, 'b': 5, 'c': 10}
    ]);

    // Variables
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'a * b * X', {'X': 2}], {}), [
        {'a': 1, 'b': 3, 'c': 6},
        {'a': 1, 'b': 4, 'c': 8},
        {'a': 2, 'b': 5, 'c': 20}
    ]);

    // Globals
    let options = {'globals': {'X': 2}};
    assert.deepEqual(scriptFunctions.dataCalculatedField([data, 'c', 'a * b * X'], options), [
        {'a': 1, 'b': 3, 'c': 6},
        {'a': 1, 'b': 4, 'c': 8},
        {'a': 2, 'b': 5, 'c': 20}
    ]);

    // Runtime integration
    const dataRuntime = [
        {'a': '/foo'},
        {'a': 'bar'}
    ];
    options = {
        'globals': {
            'documentURL': ([url], funcOptions) => funcOptions.urlFn(url)
        },
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`)
    };
    assert.deepEqual(scriptFunctions.dataCalculatedField([dataRuntime, 'b', 'documentURL(a)'], options), [
        {'a': '/foo', 'b': '/foo'},
        {'a': 'bar', 'b': '/foo/bar'}
    ]);

    // Non-array data
    assert.throws(
        () => {
            scriptFunctions.dataCalculatedField([null, 'c', 'a * b'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "data" argument value, null'
        }
    );

    // Non-string field name
    assert.throws(
        () => {
            scriptFunctions.dataCalculatedField([data, null, 'a * b'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "fieldName" argument value, null'
        }
    );

    // Non-string expression
    assert.throws(
        () => {
            scriptFunctions.dataCalculatedField([data, 'c', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "expr" argument value, null'
        }
    );

    // Non-object variables
    assert.throws(
        () => {
            scriptFunctions.dataCalculatedField([data, 'c', 'a * b', 'invalid'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "variables" argument value, "invalid"'
        }
    );
});


test('script library, dataFilter', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    assert.deepEqual(scriptFunctions.dataFilter([data, 'b > 3'], {}), [
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);

    // Variables
    assert.deepEqual(scriptFunctions.dataFilter([data, 'b > d', {'d': 3}], {}), [
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);

    // Globals
    let options = {'globals': {'c': 2}};
    assert.deepEqual(scriptFunctions.dataFilter([data, 'a == c'], options), [
        {'a': 2, 'b': 5}
    ]);

    // Runtime integration
    const dataRuntime = [
        {'a': '/foo'},
        {'a': 'bar'}
    ];
    options = {
        'globals': {
            'documentURL': ([url], funcOptions) => funcOptions.urlFn(url)
        },
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`)
    };
    assert.deepEqual(scriptFunctions.dataFilter([dataRuntime, 'documentURL(a) == "/foo/bar"'], options), [
        {'a': 'bar'}
    ]);

    // Non-array data
    assert.throws(
        () => {
            scriptFunctions.dataFilter([null, 'a * b'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "data" argument value, null'
        }
    );

    // Non-string expression
    assert.throws(
        () => {
            scriptFunctions.dataFilter([data, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "expr" argument value, null'
        }
    );

    // Non-object variables
    assert.throws(
        () => {
            scriptFunctions.dataFilter([data, 'a * b', 'invalid'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "variables" argument value, "invalid"'
        }
    );
});


test('script library, dataJoin', () => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 1, 'c': 10},
        {'a': 2, 'c': 11},
        {'a': 2, 'c': 12}
    ];
    assert.deepEqual(scriptFunctions.dataJoin([leftData, rightData, 'a'], {}), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 12},
        {'a': 3, 'b': 8}
    ]);

    // Left join
    assert.deepEqual(scriptFunctions.dataJoin([leftData, rightData, 'a', null, true], {}), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 12}
    ]);

    // Right expression and variables - left join
    assert.deepEqual(
        scriptFunctions.dataJoin([leftData, rightData, 'a', 'a / denominator', true, {'denominator': 2}], {}),
        [
            {'a': 1, 'a2': 2, 'b': 5, 'c': 11},
            {'a': 1, 'a2': 2, 'b': 5, 'c': 12},
            {'a': 1, 'a2': 2, 'b': 6, 'c': 11},
            {'a': 1, 'a2': 2, 'b': 6, 'c': 12}
        ]
    );

    // Right expression and globals
    let options = {'globals': {'denominator': 2}};
    assert.deepEqual(
        scriptFunctions.dataJoin([leftData, rightData, 'a', 'a / denominator'], options),
        [
            {'a': 1, 'a2': 2, 'b': 5, 'c': 11},
            {'a': 1, 'a2': 2, 'b': 5, 'c': 12},
            {'a': 1, 'a2': 2, 'b': 6, 'c': 11},
            {'a': 1, 'a2': 2, 'b': 6, 'c': 12},
            {'a': 2, 'b': 7},
            {'a': 3, 'b': 8}
        ]
    );

    // Runtime integration
    options = {
        'globals': {
            'documentURL': ([url], funcOptions) => funcOptions.urlFn(url)
        },
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`)
    };
    const leftDataRuntime = [
        {'a': '/foo', 'c': 5},
        {'a': 'bar', 'c': 6}
    ];
    const rightDataRuntime = [
        {'b': '/foo', 'd': 10},
        {'b': '/foo/bar', 'd': 11}
    ];
    assert.deepEqual(scriptFunctions.dataJoin([leftDataRuntime, rightDataRuntime, 'documentURL(a)', 'b'], options), [
        {'a': '/foo', 'b': '/foo', 'c': 5, 'd': 10},
        {'a': 'bar', 'b': '/foo/bar', 'c': 6, 'd': 11}
    ]);

    // Non-array left data
    assert.throws(
        () => {
            scriptFunctions.dataJoin([null, rightData, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "leftData" argument value, null'
        }
    );

    // Non-array right data
    assert.throws(
        () => {
            scriptFunctions.dataJoin([leftData, null, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "rightData" argument value, null'
        }
    );

    // Non-string expression
    assert.throws(
        () => {
            scriptFunctions.dataJoin([leftData, rightData, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "joinExpr" argument value, null'
        }
    );

    // Non-string right expression
    assert.throws(
        () => {
            scriptFunctions.dataJoin([leftData, rightData, 'a', 7], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "rightExpr" argument value, 7'
        }
    );

    // Non-object variables
    assert.throws(
        () => {
            scriptFunctions.dataJoin([leftData, rightData, 'a', null, false, 'invalid'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "variables" argument value, "invalid"'
        }
    );
});


test('script library, dataParseCSV', () => {
    const text = `\
a,b, c
1,3,abc
`;
    const text2 = `\
1,4,
2,5
`;
    assert.deepEqual(scriptFunctions.dataParseCSV([text, text2], null), [
        {'a': 1, 'b': 3, 'c': 'abc'},
        {'a': 1, 'b': 4, 'c': ''},
        {'a': 2, 'b': 5, 'c': null}
    ]);

    // null arg
    assert.deepEqual(scriptFunctions.dataParseCSV([text, null, text2], null), [
        {'a': 1, 'b': 3, 'c': 'abc'},
        {'a': 1, 'b': 4, 'c': ''},
        {'a': 2, 'b': 5, 'c': null}
    ]);

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.dataParseCSV([text, 7, text2], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "text" argument value, 7'
        }
    );
});


test('script library, dataSort', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ];
    assert.deepEqual(scriptFunctions.dataSort([data, [['a', true], ['b']]], null), [
        {'a': 4, 'b': 7},
        {'a': 3, 'b': 6},
        {'a': 2, 'b': 5},
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4}
    ]);

    // Non-array data
    assert.throws(
        () => {
            scriptFunctions.dataSort([null, [['a', true], ['b']]], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "data" argument value, null'
        }
    );

    // Non-array sorts
    assert.throws(
        () => {
            scriptFunctions.dataSort([data, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "sorts" argument value, null'
        }
    );
});


test('script library, dataTop', () => {
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ];
    assert.deepEqual(scriptFunctions.dataTop([data, 3], null), [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
    assert.deepEqual(scriptFunctions.dataTop([data, 1, ['a']], null), [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ]);

    // Non-array data
    assert.throws(
        () => {
            scriptFunctions.dataTop([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "data" argument value, null'
        }
    );

    // Non-number count
    assert.throws(
        () => {
            scriptFunctions.dataTop([data, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "count" argument value, null'
        }
    );

    // Non-integer count
    assert.throws(
        () => {
            scriptFunctions.dataTop([data, 3.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "count" argument value, 3.5'
        }
    );

    // Negative count
    assert.throws(
        () => {
            scriptFunctions.dataTop([data, -3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "count" argument value, -3'
        }
    );

    // Non-array category fields
    assert.throws(
        () => {
            scriptFunctions.dataTop([data, 3, 'invalid'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "categoryFields" argument value, "invalid"'
        }
    );
});


test('script library, dataValidate', () => {
    const data = [
        {'a': '1', 'b': 3},
        {'a': '1', 'b': 4},
        {'a': '2', 'b': 5}
    ];
    assert.deepEqual(scriptFunctions.dataValidate([data], null), [
        {'a': '1', 'b': 3},
        {'a': '1', 'b': 4},
        {'a': '2', 'b': 5}
    ]);

    // CSV
    assert.deepEqual(scriptFunctions.dataValidate([data, true], null), [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);

    // Non-array data
    assert.throws(
        () => {
            scriptFunctions.dataValidate([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "data" argument value, null'
        }
    );
});


//
// Datetime functions
//


test('library, datetimeDay', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeDay([dt], null), 21);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeDay([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeHour', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeHour([dt], null), 7);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeHour([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeISOFormat', () => {
    const d1 = valueParseDatetime('2022-06-21T07:15:30+00:00');
    const d2 = valueParseDatetime('2022-06-21T07:15:30.123567+00:00');
    assert.equal(scriptFunctions.datetimeISOFormat([d1], null), valueString(d1));
    assert.equal(scriptFunctions.datetimeISOFormat([d2], null), valueString(d2));

    // isDate
    assert.equal(
        scriptFunctions.datetimeISOFormat([new Date(2022, 5, 21), true], null),
        '2022-06-21'
    );
    assert.equal(
        scriptFunctions.datetimeISOFormat([new Date(2022, 9, 7), true], null),
        '2022-10-07'
    );
    assert.equal(
        scriptFunctions.datetimeISOFormat([new Date(900, 9, 7), true], null),
        '0900-10-07'
    );

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeISOFormat([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeISOParse', () => {
    assert.deepEqual(
        scriptFunctions.datetimeISOParse(['2022-08-29T15:08:00+00:00'], null),
        new Date('2022-08-29T15:08:00+00:00')
    );
    assert.deepEqual(
        scriptFunctions.datetimeISOParse(['2022-08-29T15:08:00Z'], null),
        new Date('2022-08-29T15:08:00+00:00')
    );
    assert.deepEqual(
        scriptFunctions.datetimeISOParse(['2022-08-29T15:08:00-08:00'], null),
        new Date('2022-08-29T15:08:00-08:00')
    );

    // Invalid datetime string
    assert.equal(scriptFunctions.datetimeISOParse(['invalid'], null), null);

    // Non-string datetime string
    assert.throws(
        () => {
            scriptFunctions.datetimeISOParse([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null'
        }
    );
});


test('library, datetimeMillisecond', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeMillisecond([dt], null), 100);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeMillisecond([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeMinute', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeMinute([dt], null), 15);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeMinute([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeMonth', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeMonth([dt], null), 6);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeMonth([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeNew', () => {
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, 100], null),
        new Date(2022, 5, 21, 12, 30, 15, 100)
    );

    // Required arguments only
    assert.deepEqual(scriptFunctions.datetimeNew([2022, 6, 21], null), new Date(2022, 5, 21));

    // Extra months
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 26, 21, 12, 30, 15, 100], null),
        new Date(2024, 1, 21, 12, 30, 15, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, -14, 21, 12, 30, 15, 100], null),
        new Date(2020, 9, 21, 12, 30, 15, 100)
    );

    // Extra days
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 50, 12, 30, 15, 100], null),
        new Date(2022, 6, 20, 12, 30, 15, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 250, 12, 30, 15, 100], null),
        new Date(2023, 1, 5, 12, 30, 15, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, -50, 12, 30, 15, 100], null),
        new Date(2022, 3, 11, 12, 30, 15, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, -250, 12, 30, 15, 100], null),
        new Date(2021, 8, 23, 12, 30, 15, 100)
    );

    // Extra hours
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 50, 30, 15, 100], null),
        new Date(2022, 5, 23, 2, 30, 15, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, -50, 30, 15, 100], null),
        new Date(2022, 5, 18, 22, 30, 15, 100)
    );

    // Extra minutes
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, 200, 15, 100], null),
        new Date(2022, 5, 21, 15, 20, 15, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, -200, 15, 100], null),
        new Date(2022, 5, 21, 8, 40, 15, 100)
    );

    // Extra seconds
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 200, 100], null),
        new Date(2022, 5, 21, 12, 33, 20, 100)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, -200, 100], null),
        new Date(2022, 5, 21, 12, 26, 40, 100)
    );

    // Extra milliseconds
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, 2200], null),
        new Date(2022, 5, 21, 12, 30, 17, 200)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, -2200], null),
        new Date(2022, 5, 21, 12, 30, 12, 800)
    );

    // Extra everything
    assert.deepEqual(
        scriptFunctions.datetimeNew([2022, 12, 31, 23, 59, 59, 1000], null),
        new Date(2023, 0, 1, 0, 0, 0, 0)
    );
    assert.deepEqual(
        scriptFunctions.datetimeNew([2023, 1, 1, 0, 0, 0, -1000], null),
        new Date(2022, 11, 31, 23, 59, 59, 0)
    );

    // Invalid year
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([90, 6, 21, 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "year" argument value, 90'
        }
    );

    // Non-number arguments
    assert.throws(
        () => {
            scriptFunctions.datetimeNew(['2022', 6, 21, 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "year" argument value, "2022"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, '6', 21, 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "month" argument value, "6"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, '21', 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "day" argument value, "21"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, '12', 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "hour" argument value, "12"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12, '30', 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "minute" argument value, "30"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, '15', 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "second" argument value, "15"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, '100'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "millisecond" argument value, "100"'
        }
    );

    // Non-integer arguments
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022.5, 6, 21, 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "year" argument value, 2022.5'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6.5, 21, 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "month" argument value, 6.5'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21.5, 12, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "day" argument value, 21.5'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12.5, 30, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "hour" argument value, 12.5'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12, 30.5, 15, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "minute" argument value, 30.5'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15.5, 100], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "second" argument value, 15.5'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.datetimeNew([2022, 6, 21, 12, 30, 15, 100.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "millisecond" argument value, 100.5'
        }
    );
});


test('library, datetimeNow', () => {
    assert.equal(scriptFunctions.datetimeNow([], null) instanceof Date, true);
});


test('library, datetimeSecond', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeSecond([dt], null), 30);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeSecond([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


test('library, datetimeToday', () => {
    const today = scriptFunctions.datetimeToday([], null);
    assert.equal(today instanceof Date, true);
    assert.equal(today.getHours(), 0);
    assert.equal(today.getMinutes(), 0);
    assert.equal(today.getSeconds(), 0);
    assert.equal(today.getMilliseconds(), 0);
});


test('library, datetimeYear', () => {
    const dt = new Date(2022, 5, 21, 7, 15, 30, 100);
    assert.equal(scriptFunctions.datetimeYear([dt], null), 2022);

    // Non-datetime
    assert.throws(
        () => {
            scriptFunctions.datetimeYear([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "datetime" argument value, null'
        }
    );
});


//
// JSON functions
//


test('library, jsonParse', () => {
    assert.deepEqual(scriptFunctions.jsonParse(['{"a": 1, "b": 2}'], null), {'a': 1, 'b': 2});

    // Invalid JSON
    assert.throws(
        () => {
            scriptFunctions.jsonParse(['asdf'], null);
        },
        {
            'name': 'SyntaxError',
        }
    );

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.jsonParse([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null'
        }
    );
});


test('library, jsonStringify', () => {
    assert.equal(scriptFunctions.jsonStringify([{'b': 2, 'a': 1}], null), '{"a":1,"b":2}');
    assert.equal(scriptFunctions.jsonStringify([{'b': 2, 'a': {'d': 4, 'c': 3}}], null), '{"a":{"c":3,"d":4},"b":2}');
    assert.equal(scriptFunctions.jsonStringify([[{'b': 2, 'a': 1}]], null), '[{"a":1,"b":2}]');
    assert.equal(scriptFunctions.jsonStringify([[3, 2, 1]], null), '[3,2,1]');
    assert.equal(scriptFunctions.jsonStringify([123], null), '123');
    assert.equal(scriptFunctions.jsonStringify(['abc'], null), '"abc"');
    assert.equal(scriptFunctions.jsonStringify([null], null), 'null');

    // Non-zero indent
    assert.equal(
        scriptFunctions.jsonStringify([{'a': 1, 'b': 2}, 4], null),
        `\
{
    "a": 1,
    "b": 2
}`
    );
    assert.equal(
        scriptFunctions.jsonStringify([{'a': 1, 'b': 2}, 4.], null),
        `\
{
    "a": 1,
    "b": 2
}`
    );

    // Non-number indent
    assert.throws(
        () => {
            scriptFunctions.jsonStringify([null, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "indent" argument value, "abc"'
        }
    );

    // Non-integer indent
    assert.throws(
        () => {
            scriptFunctions.jsonStringify([null, 4.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "indent" argument value, 4.5'
        }
    );

    // Zero indent
    assert.throws(
        () => {
            scriptFunctions.jsonStringify([{'a': 1, 'b': 2}, 0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "indent" argument value, 0'
        }
    );

    // Negative indent
    assert.throws(
        () => {
            scriptFunctions.jsonStringify([null, -4], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "indent" argument value, -4'
        }
    );
});


//
// Math functions
//


test('library, mathAbs', () => {
    assert.equal(scriptFunctions.mathAbs([-3], null), 3);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathAbs(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathAcos', () => {
    assert.equal(scriptFunctions.mathAcos([1], null), 0);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathAcos(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathAsin', () => {
    assert.equal(scriptFunctions.mathAsin([0], null), 0);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathAsin(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathAtan', () => {
    assert.equal(scriptFunctions.mathAtan([0], null), 0);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathAtan(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathAtan2', () => {
    assert.equal(scriptFunctions.mathAtan2([0, 1], null), 0);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathAtan2(['abc', 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "y" argument value, "abc"'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.mathAtan2([0, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathCeil', () => {
    assert.equal(scriptFunctions.mathCeil([0.25], null), 1);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathCeil(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathCos', () => {
    assert.equal(scriptFunctions.mathCos([0], null), 1);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathCos(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathFloor', () => {
    assert.equal(scriptFunctions.mathFloor([1.125], null), 1);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathFloor(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathLn', () => {
    assert.equal(scriptFunctions.mathLn([Math.E], null), 1);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathLn(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );

    // Invalid value
    assert.throws(
        () => {
            scriptFunctions.mathLn([0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, 0'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.mathLn([-10], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, -10'
        }
    );
});


test('library, mathLog', () => {
    assert.equal(scriptFunctions.mathLog([10], null), 1);

    // Base
    assert.equal(scriptFunctions.mathLog([8, 2], null), 3);
    assert.equal(scriptFunctions.mathLog([8, 0.5], null), -3);

    // Non-number value
    assert.throws(
        () => {
            scriptFunctions.mathLog(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );

    // Non-number base
    assert.throws(
        () => {
            scriptFunctions.mathLog([10, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "base" argument value, "abc"'
        }
    );

    // Invalid value
    assert.throws(
        () => {
            scriptFunctions.mathLog([0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, 0'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.mathLog([-10], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, -10'
        }
    );

    // Invalid base
    assert.throws(
        () => {
            scriptFunctions.mathLog([10, 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "base" argument value, 1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.mathLog([10, 0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "base" argument value, 0'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.mathLog([10, -10], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "base" argument value, -10'
        }
    );
});


test('library, mathMax', () => {
    assert.equal(scriptFunctions.mathMax([1, 2, 3], null), 3);

    // Empty values
    assert.equal(scriptFunctions.mathMax([], null), null);

    // Non-number
    assert.equal(scriptFunctions.mathMax(['abc', 2, 3], null), 'abc');
    assert.equal(scriptFunctions.mathMax([1, 'abc', 3], null), 'abc');
    assert.equal(scriptFunctions.mathMax([1, 2, 'abc'], null), 'abc');
});


test('library, mathMin', () => {
    assert.equal(scriptFunctions.mathMin([1, 2, 3], null), 1);

    // Empty values
    assert.equal(scriptFunctions.mathMin([], null), null);

    // Non-number
    assert.equal(scriptFunctions.mathMin(['abc', 2, 3], null), 2);
    assert.equal(scriptFunctions.mathMin([1, 'abc', 3], null), 1);
    assert.equal(scriptFunctions.mathMin([1, 2, 'abc'], null), 1);
});


test('library, mathPi', () => {
    assert.equal(scriptFunctions.mathPi([], null), Math.PI);
});


test('library, mathRandom', () => {
    const value = scriptFunctions.mathRandom([], null);
    assert.equal(typeof value, 'number');
    assert.equal(value >= 0, true);
    assert.equal(value <= 1, true);
});


test('library, mathRound', () => {
    assert.equal(scriptFunctions.mathRound([5.125], null), 5);

    // Digits
    assert.equal(scriptFunctions.mathRound([5.25, 1], null), 5.3);
    assert.equal(scriptFunctions.mathRound([5.25, 1.], null), 5.3);
    assert.equal(scriptFunctions.mathRound([5.15, 1], null), 5.2);

    // Non-number value
    assert.throws(
        () => {
            scriptFunctions.mathRound(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );

    // Non-number digits
    assert.throws(
        () => {
            scriptFunctions.mathRound([5.125, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "digits" argument value, "abc"'
        }
    );

    // Non-integer digits
    assert.throws(
        () => {
            scriptFunctions.mathRound([5.125, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "digits" argument value, 1.5'
        }
    );

    // Negative digits
    assert.throws(
        () => {
            scriptFunctions.mathRound([5.125, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "digits" argument value, -1'
        }
    );
});


test('library, mathSign', () => {
    assert.equal(scriptFunctions.mathSign([5.125], null), 1);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathSign(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathSin', () => {
    assert.equal(scriptFunctions.mathSin([0], null), 0);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathSin(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


test('library, mathSqrt', () => {
    assert.equal(scriptFunctions.mathSqrt([4], null), 2);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathSqrt(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );

    // Negative value
    assert.throws(
        () => {
            scriptFunctions.mathSqrt([-4], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, -4'
        }
    );
});


test('library, mathTan', () => {
    assert.equal(scriptFunctions.mathTan([0], null), 0);

    // Non-number
    assert.throws(
        () => {
            scriptFunctions.mathTan(['abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, "abc"'
        }
    );
});


//
// Number functions
//


test('library, numberToFixed', () => {
    assert.equal(scriptFunctions.numberParseFloat(['123.45'], null), 123.45);

    // Parse failure
    assert.equal(scriptFunctions.numberParseFloat(['invalid'], null), null);
    assert.equal(scriptFunctions.numberParseFloat(['1234.45asdf'], null), null);
    assert.equal(scriptFunctions.numberParseFloat(['1234.45 asdf'], null), null);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.numberParseFloat([10], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, 10'
        }
    );
});


test('library, numberParseInt', () => {
    assert.equal(scriptFunctions.numberParseInt(['123'], null), 123);

    // Radix
    assert.equal(scriptFunctions.numberParseInt(['10', 2], null), 2);
    assert.equal(scriptFunctions.numberParseInt(['10', 2.], null), 2);

    // Parse failure
    assert.equal(scriptFunctions.numberParseInt(['1234.45'], null), null);
    assert.equal(scriptFunctions.numberParseInt(['asdf'], null), null);
    assert.equal(scriptFunctions.numberParseInt(['1234asdf'], null), null);
    assert.equal(scriptFunctions.numberParseInt(['1234.45 asdf'], null), null);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.numberParseInt([10], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, 10'
        }
    );

    // Non-number radix
    assert.throws(
        () => {
            scriptFunctions.numberParseInt(['10', 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "radix" argument value, "abc"'
        }
    );

    // Non-integer radix
    assert.throws(
        () => {
            scriptFunctions.numberParseInt(['10', 2.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "radix" argument value, 2.5'
        }
    );

    // Invalid radix
    assert.throws(
        () => {
            scriptFunctions.numberParseInt(['10', 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "radix" argument value, 1'
        }
    );
    assert.throws(
        () => {
            scriptFunctions.numberParseInt(['10', 37], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "radix" argument value, 37'
        }
    );
});


test('library, numberParseFloat', () => {
    assert.equal(scriptFunctions.numberToFixed([1.125], null), '1.13');

    // Digits
    assert.equal(scriptFunctions.numberToFixed([1.125, 0], null), '1');
    assert.equal(scriptFunctions.numberToFixed([1.125, 0.], null), '1');
    assert.equal(scriptFunctions.numberToFixed([1.125, 1], null), '1.1');
    assert.equal(scriptFunctions.numberToFixed([1, 1], null), '1.0');

    // Trim
    assert.equal(scriptFunctions.numberToFixed([1.125, 1, true], null), '1.1');
    assert.equal(scriptFunctions.numberToFixed([1, 1, true], null), '1');

    // Non-number value
    assert.throws(
        () => {
            scriptFunctions.numberToFixed([null, 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "x" argument value, null'
        }
    );

    // Non-number digits
    assert.throws(
        () => {
            scriptFunctions.numberToFixed([1.125, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "digits" argument value, null'
        }
    );

    // Non-integer digits
    assert.throws(
        () => {
            scriptFunctions.numberToFixed([1.125, 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "digits" argument value, 1.5'
        }
    );

    // Negative digits
    assert.throws(
        () => {
            scriptFunctions.numberToFixed([1.125, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "digits" argument value, -1'
        }
    );
});


//
// Object functions
//


test('library, objectAssign', () => {
    let obj = {'a': 1, 'b': 2};
    const obj2 = {'b': 3, 'c': 4};
    assert.deepEqual(scriptFunctions.objectAssign([obj, obj2], null), {'a': 1, 'b': 3, 'c': 4});
    assert.deepEqual(obj, {'a': 1, 'b': 3, 'c': 4});

    // Null inputs
    obj = {'a': 1, 'b': 2};
    assert.throws(
        () => {
            scriptFunctions.objectAssign([null, obj], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectAssign([obj, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object2" argument value, null',
            'returnValue': null
        }
    );
    assert.deepEqual(obj, {'a': 1, 'b': 2});

    // Number inputs
    obj = {'a': 1, 'b': 2};
    assert.throws(
        () => {
            scriptFunctions.objectAssign([0, obj], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectAssign([obj, 0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object2" argument value, 0',
            'returnValue': null
        }
    );
    assert.deepEqual(obj, {'a': 1, 'b': 2});

    // Array inputs
    obj = {'a': 1, 'b': 2};
    const array = ['c', 'd'];
    assert.throws(
        () => {
            scriptFunctions.objectAssign([obj, array], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object2" argument value, ["c","d"]',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectAssign([array, obj], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["c","d"]',
            'returnValue': null
        }
    );
    assert.deepEqual(obj, {'a': 1, 'b': 2});
    assert.deepEqual(array, ['c', 'd']);
});


test('library, objectCopy', () => {
    const obj = {'a': 1, 'b': 2};
    const objCopy = scriptFunctions.objectCopy([obj], null);
    assert.deepEqual(objCopy, obj);
    assert.notEqual(objCopy, obj);

    // Null input
    assert.throws(
        () => {
            scriptFunctions.objectCopy([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null',
            'returnValue': null
        }
    );

    // Number input
    assert.throws(
        () => {
            scriptFunctions.objectCopy([0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0',
            'returnValue': null
        }
    );

    // Array input
    assert.throws(
        () => {
            scriptFunctions.objectCopy([['a', 'b']], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]',
            'returnValue': null
        }
    );
});


test('library, objectDelete', () => {
    let obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectDelete([obj, 'a'], null), undefined);
    assert.deepEqual(obj, {'b': 2});

    // Missing key
    obj = {'b': 2};
    assert.equal(scriptFunctions.objectDelete([obj, 'a'], null), undefined);
    assert.deepEqual(obj, {'b': 2});

    // Null input
    assert.throws(
        () => {
            scriptFunctions.objectDelete([null, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null',
            'returnValue': null
        }
    );

    // Number input
    assert.throws(
        () => {
            scriptFunctions.objectDelete([0, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0',
            'returnValue': null
        }
    );

    // Array input
    assert.throws(
        () => {
            scriptFunctions.objectDelete([['a', 'b'], 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]',
            'returnValue': null
        }
    );

    // Non-string key
    assert.throws(
        () => {
            scriptFunctions.objectDelete([obj, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "key" argument value, null',
            'returnValue': null
        }
    );
});


test('library, objectGet', () => {
    let obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectGet([obj, 'a'], null), 1);

    // Missing key with/without default
    obj = {};
    assert.equal(scriptFunctions.objectGet([obj, 'a'], null), null);
    assert.equal(scriptFunctions.objectGet([obj, 'a', 1], null), 1);

    // Null input
    assert.throws(
        () => {
            scriptFunctions.objectGet([null, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectGet([null, 'a', 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null',
            'returnValue': 1
        }
    );

    // Number input
    assert.throws(
        () => {
            scriptFunctions.objectGet([0, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectGet([0, 'a', 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0',
            'returnValue': 1
        }
    );

    // Array input
    assert.throws(
        () => {
            scriptFunctions.objectGet([['a', 'b'], 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectGet([['a', 'b'], 'a', 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]',
            'returnValue': 1
        }
    );

    // Non-string key
    obj = {'a': 1, 'b': 2};
    assert.throws(
        () => {
            scriptFunctions.objectGet([obj, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "key" argument value, null',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.objectGet([obj, null, 1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "key" argument value, null',
            'returnValue': 1
        }
    );
});


test('library, objectHas', () => {
    const obj = {'a': 1, 'b': null};
    assert.equal(scriptFunctions.objectHas([obj, 'a'], null), true);
    assert.equal(scriptFunctions.objectHas([obj, 'b'], null), true);
    assert.equal(scriptFunctions.objectHas([obj, 'c'], null), false);
    assert.equal(scriptFunctions.objectHas([obj, 'd'], null), false);

    // Null input
    assert.throws(
        () => {
            scriptFunctions.objectHas([null, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null',
            'returnValue': false
        }
    );

    // Number input
    assert.throws(
        () => {
            scriptFunctions.objectHas([0, 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0',
            'returnValue': false
        }
    );

    // Array input
    assert.throws(
        () => {
            scriptFunctions.objectHas([['a', 'b'], 'a'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]',
            'returnValue': false
        }
    );

    // Non-string key
    assert.throws(
        () => {
            scriptFunctions.objectHas([obj, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "key" argument value, null',
            'returnValue': false
        }
    );
});


test('library, objectKeys', () => {
    const obj = {'a': 1, 'b': 2};
    assert.deepEqual(scriptFunctions.objectKeys([obj], null), ['a', 'b']);

    // Null input
    assert.throws(
        () => {
            scriptFunctions.objectKeys([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null'
        }
    );

    // Number input
    assert.throws(
        () => {
            scriptFunctions.objectKeys([0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0'
        }
    );

    // Array input
    assert.throws(
        () => {
            scriptFunctions.objectKeys([['a', 'b']], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]'
        }
    );
});


test('library, objectNew', () => {
    assert.deepEqual(scriptFunctions.objectNew([], null), {});

    // Key/values
    assert.deepEqual(scriptFunctions.objectNew(['a', 1, 'b', 2], null), {'a': 1, 'b': 2});

    // Missing final value
    assert.deepEqual(scriptFunctions.objectNew(['a', 1, 'b'], null), {'a': 1, 'b': null});

    // Non-string key
    assert.throws(
        () => {
            scriptFunctions.objectNew([0, 1, 'b'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "keyValues" argument value, 0'
        }
    );
});


test('library, objectSet', () => {
    let obj = {'a': 1, 'b': 2};
    assert.equal(scriptFunctions.objectSet([obj, 'c', 3], null), 3);
    assert.deepEqual(obj, {'a': 1, 'b': 2, 'c': 3});

    // Null input
    assert.throws(
        () => {
            scriptFunctions.objectSet([null, 'c', 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, null'
        }
    );

    // Number input
    assert.throws(
        () => {
            scriptFunctions.objectSet([0, 'c', 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, 0'
        }
    );

    // Array input
    obj = ['a', 'b'];
    assert.throws(
        () => {
            scriptFunctions.objectSet([obj, 'c', 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "object" argument value, ["a","b"]'
        }
    );
    assert.deepEqual(obj, ['a', 'b']);

    // Non-string key
    obj = {'a': 1, 'b': 2};
    assert.throws(
        () => {
            scriptFunctions.objectSet([obj, null, 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "key" argument value, null'
        }
    );
    assert.deepEqual(obj, {'a': 1, 'b': 2});
});


//
// Regex functions
//


test('library, regexEscape', () => {
    assert.equal(scriptFunctions.regexEscape(['a*b'], null), 'a\\*b');

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.regexEscape([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


test('library, regexMatch', () => {
    assert.deepEqual(
        scriptFunctions.regexMatch([/foo/, 'foo bar'], null),
        {
            'index': 0,
            'input': 'foo bar',
            'groups': {'0': 'foo'},
        }
    );

    // Named groups
    assert.deepEqual(
        scriptFunctions.regexMatch([/(?<first>\w+)(\s+)(?<last>\w+)/, 'foo bar thud'], null),
        {
            'index': 0,
            'input': 'foo bar thud',
            'groups': {'0': 'foo bar', '1': 'foo', '2': ' ', '3': 'bar', 'first': 'foo', 'last': 'bar'}
        }
    );

    // No match
    assert.equal(scriptFunctions.regexMatch([/foo/, 'boo bar'], null), null);

    // Non-regex
    assert.throws(
        () => {
            scriptFunctions.regexMatch([null, 'foo bar'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "regex" argument value, null',
            'returnValue': null
        }
    );

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.regexMatch([/foo/, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


test('library, regexMatchAll', () => {
    assert.deepEqual(
        scriptFunctions.regexMatchAll([/(?<name>([fb])o+)/, 'foo boooo bar'], null),
        [
            {
                'index': 0,
                'input': 'foo boooo bar',
                'groups': {'0': 'foo', '1': 'foo', '2': 'f', 'name': 'foo'}
            },
            {
                'index': 4,
                'input': 'foo boooo bar',
                'groups': {'0': 'boooo', '1': 'boooo', '2': 'b', 'name': 'boooo'}
            }
        ]
    );

    // Global flag (shouldn't ever happen)
    assert.deepEqual(
        scriptFunctions.regexMatchAll([/(?<name>([fb])o+)/g, 'foo boooo bar'], null),
        [
            {
                'index': 0,
                'input': 'foo boooo bar',
                'groups': {'0': 'foo', '1': 'foo', '2': 'f', 'name': 'foo'}
            },
            {
                'index': 4,
                'input': 'foo boooo bar',
                'groups': {'0': 'boooo', '1': 'boooo', '2': 'b', 'name': 'boooo'}
            }
        ]
    );

    // No matches
    assert.deepEqual(
        scriptFunctions.regexMatchAll([/foo/, 'boo boo bar'], null),
        []
    );

    // Non-regex
    assert.throws(
        () => {
            scriptFunctions.regexMatchAll([null, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "regex" argument value, null',
            'returnValue': null
        }
    );

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.regexMatchAll([/foo/, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


test('library, regexNew', () => {
    let regex = scriptFunctions.regexNew(['a*b'], null);
    assert.equal(regex instanceof RegExp, true);
    assert.equal(regex.source, 'a*b');
    assert.equal(regex.flags, '');

    // Named groups
    regex = scriptFunctions.regexNew(['(?<first>\\w+)(\\s+)(?<last>\\w+)'], null);
    assert.equal(regex instanceof RegExp, true);
    assert.equal(regex.source, '(?<first>\\w+)(\\s+)(?<last>\\w+)');
    assert.equal(regex.flags, '');

    // Flag - "i"
    regex = scriptFunctions.regexNew(['a*b', 'i'], null);
    assert.equal(regex instanceof RegExp, true);
    assert.equal(regex.source, 'a*b');
    assert.equal(regex.flags, 'i');

    // Flag - "m"
    regex = scriptFunctions.regexNew(['a*b', 'm'], null);
    assert.equal(regex instanceof RegExp, true);
    assert.equal(regex.source, 'a*b');
    assert.equal(regex.flags, 'm');

    // Flag - "s"
    regex = scriptFunctions.regexNew(['a*b', 's'], null);
    assert.equal(regex instanceof RegExp, true);
    assert.equal(regex.source, 'a*b');
    assert.equal(regex.flags, 's');

    // Flag - unknown
    assert.equal(scriptFunctions.regexNew(['a*b', 'iz'], null), null);

    // Non-string pattern
    assert.throws(
        () => {
            scriptFunctions.regexNew([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "pattern" argument value, null',
            'returnValue': null
        }
    );

    // Non-string flags
    assert.throws(
        () => {
            scriptFunctions.regexNew(['a*b', 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "flags" argument value, 5',
            'returnValue': null
        }
    );
});


test('library, regexReplace', () => {
    assert.equal(scriptFunctions.regexReplace([/^(\w)(\w)$/, 'ab', '$2$1'], null), 'ba');

    // Named groups
    assert.equal(
        scriptFunctions.regexReplace([/^(?<first>\w+)\s+(?<last>\w+)/, 'foo bar', '$2, $1'], null),
        'bar, foo'
    );

    // Multiple replacements
    assert.equal(
        scriptFunctions.regexReplace([/(fo+)/, 'foo bar fooooo', '$1d'], null),
        'food bar foooood'
    );

    // Global flag (shouldn't ever happen)
    assert.equal(
        scriptFunctions.regexReplace([/(fo+)/g, 'foo bar fooooo', '$1d'], null),
        'food bar foooood'
    );

    // JavaScript escape
    assert.equal(scriptFunctions.regexReplace([/^(\w)(\w)$/, 'ab', '$2$$$1'], null), 'b$a');

    // Python escape
    assert.equal(scriptFunctions.regexReplace([/^(\w)(\w)$/, 'ab', '$2\\$1'], null), 'b\\a');

    // Non-regex
    assert.throws(
        () => {
            scriptFunctions.regexReplace([null, 'ab', '$2$1'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "regex" argument value, null',
            'returnValue': null
        }
    );

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.regexReplace([/(a*)(b)/, null, '$2$1'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-string substr
    assert.throws(
        () => {
            scriptFunctions.regexReplace([/(a*)(b)/, 'ab', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "substr" argument value, null',
            'returnValue': null
        }
    );
});


test('library, regexSplit', () => {
    assert.deepEqual(scriptFunctions.regexSplit([/\s*,\s*/, '1,2, 3 , 4'], null), ['1', '2', '3', '4']);

    // Non-regex
    assert.throws(
        () => {
            scriptFunctions.regexSplit([null, '1,2'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "regex" argument value, null',
            'returnValue': null
        }
    );

    // Non-string
    assert.throws(
        () => {
            scriptFunctions.regexSplit([/\s*,\s*/, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


//
// Schema functions
//


test('script library, schemaParse', () => {
    const types = scriptFunctions.schemaParse(['typedef int MyType', 'typedef MyType MyType2'], null);
    assert.deepEqual(types, {
        'MyType': {'typedef': {'name': 'MyType', 'type': {'builtin': 'int'}}},
        'MyType2': {'typedef': {'name': 'MyType2','type': {'user': 'MyType'}}}
    });

    // Syntax error
    assert.throws(
        () => {
            scriptFunctions.schemaParse(['asdf'], null);
        },
        {
            'name': 'SchemaMarkdownParserError',
            'message': ':1: error: Syntax error'
        }
    );
});


test('script library, schemaParseEx', () => {
    // Array input
    let types = scriptFunctions.schemaParseEx([['typedef int MyType', 'typedef MyType MyType2']], null);
    assert.deepEqual(types, {
        'MyType': {'typedef': {'name': 'MyType', 'type': {'builtin': 'int'}}},
        'MyType2': {'typedef': {'name': 'MyType2','type': {'user': 'MyType'}}}
    });

    // String input
    types = scriptFunctions.schemaParseEx(['typedef int MyType'], null);
    assert.deepEqual(types, {
        'MyType': {'typedef': {'name': 'MyType','type': {'builtin': 'int'}}}
    });

    // Types provided
    types = scriptFunctions.schemaParseEx(['typedef int MyType'], null);
    const types2 = scriptFunctions.schemaParseEx(['typedef MyType MyType2', types], null);
    assert.deepEqual(types, {
        'MyType': {'typedef': {'name': 'MyType','type': {'builtin': 'int'}}},
        'MyType2': {'typedef': {'name': 'MyType2','type': {'user': 'MyType'}}}
    });
    assert.equal(types, types2);

    // Filename provided
    types = scriptFunctions.schemaParseEx(['typedef int MyType', {}, 'test.smd'], null);
    assert.deepEqual(types, {
        'MyType': {'typedef': {'name': 'MyType','type': {'builtin': 'int'}}}
    });

    // Syntax error
    assert.throws(
        () => {
            scriptFunctions.schemaParseEx(['asdf'], null);
        },
        {
            'name': 'SchemaMarkdownParserError',
            'message': ':1: error: Syntax error'
        }
    );

    // Syntax error with filename
    assert.throws(
        () => {
            scriptFunctions.schemaParseEx(['asdf', {}, 'test.smd'], null);
        },
        {
            'name': 'SchemaMarkdownParserError',
            'message': 'test.smd:1: error: Syntax error'
        }
    );

    // Non-array/string input
    assert.throws(
        () => {
            scriptFunctions.schemaParseEx([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "lines" argument value, null',
            'returnValue': null
        }
    );

    // Non-object types
    assert.throws(
        () => {
            scriptFunctions.schemaParseEx(['', 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "types" argument value, "abc"',
            'returnValue': null
        }
    );

    // Non-string filename
    assert.throws(
        () => {
            scriptFunctions.schemaParseEx(['', {}, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "filename" argument value, null',
            'returnValue': null
        }
    );
});


test('script library, schemaTypeModel', () => {
    const typeModel = scriptFunctions.schemaTypeModel([], null);
    assert.equal('Types' in typeModel, true);
    assert.deepEqual(scriptFunctions.schemaValidateTypeModel([typeModel], null), typeModel);
});


test('script library, schemaValidate', () => {
    const types = scriptFunctions.schemaParse(['# My struct', 'struct MyStruct', '', '  # An integer\n  int a'], null);
    assert.deepEqual(scriptFunctions.schemaValidate([types, 'MyStruct', {'a': 5}], null), {'a': 5});

    // Invalid types
    assert.throws(
        () => {
            scriptFunctions.schemaValidate([{}, 'MyStruct', {}], null);
        },
        {
            'name': 'ValidationError',
            'message': "Invalid value {} (type 'object'), expected type 'Types' [len > 0]"
        }
    );

    // Invalid value
    assert.throws(
        () => {
            scriptFunctions.schemaValidate([types, 'MyStruct', {}], null);
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'a' missing"
        }
    );

    // Non-object types
    assert.throws(
        () => {
            scriptFunctions.schemaValidate([null, 'MyStruct', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "types" argument value, null',
            'returnValue': null
        }
    );

    // Non-string type
    assert.throws(
        () => {
            scriptFunctions.schemaValidate([{}, null, null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "typeName" argument value, null',
            'returnValue': null
        }
    );
});


test('script library, schemaValidateTypeModel', () => {
    const types = {'MyType': {'typedef': {'name': 'MyType','type': {'builtin': 'int'}}}};
    assert.deepEqual(scriptFunctions.schemaValidateTypeModel([types], null), types);

    // Invalid types
    assert.throws(
        () => {
            scriptFunctions.schemaValidateTypeModel([{}], null);
        },
        {
            'name': 'ValidationError',
            'message': "Invalid value {} (type 'object'), expected type 'Types' [len > 0]"
        }
    );

    // Non-object types
    assert.throws(
        () => {
            scriptFunctions.schemaValidateTypeModel([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "types" argument value, null',
            'returnValue': null
        }
    );
});


//
// String functions
//


test('library, stringCharCodeAt', () => {
    assert.equal(scriptFunctions.stringCharCodeAt(['abc', 0], null), 97);
    assert.equal(scriptFunctions.stringCharCodeAt(['abc', 0.], null), 97);
    assert.equal(scriptFunctions.stringCharCodeAt(['abc', 1], null), 98);
    assert.equal(scriptFunctions.stringCharCodeAt(['abc', 2], null), 99);

    // Invalid index
    assert.throws(
        () => {
            scriptFunctions.stringCharCodeAt(['abc', -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringCharCodeAt(['abc', 4], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 4',
            'returnValue': null
        }
    );

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringCharCodeAt([null, 0], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.stringCharCodeAt(['abc', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, null',
            'returnValue': null
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.stringCharCodeAt(['abc', 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5',
            'returnValue': null
        }
    );
});


test('library, stringEndsWith', () => {
    assert.equal(scriptFunctions.stringEndsWith(['foo bar', 'bar'], null), true);
    assert.equal(scriptFunctions.stringEndsWith(['foo bar', 'foo'], null), false);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringEndsWith([null, 'bar'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-string search
    assert.throws(
        () => {
            scriptFunctions.stringEndsWith(['foo bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "search" argument value, null',
            'returnValue': null
        }
    );
});


test('library, stringFromCharCode', () => {
    assert.equal(scriptFunctions.stringFromCharCode([97, 98, 99], null), 'abc');
    assert.equal(scriptFunctions.stringFromCharCode([97., 98., 99.], null), 'abc');

    // Non-number code
    assert.throws(
        () => {
            scriptFunctions.stringFromCharCode([97, 'b', 99], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "charCodes" argument value, "b"',
            'returnValue': null
        }
    );

    // Non-integer code
    assert.throws(
        () => {
            scriptFunctions.stringFromCharCode([97, 98.5, 99], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "charCodes" argument value, 98.5',
            'returnValue': null
        }
    );

    // Negative code
    assert.throws(
        () => {
            scriptFunctions.stringFromCharCode([97, -98, 99], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "charCodes" argument value, -98',
            'returnValue': null
        }
    );
});


test('library, stringIndexOf', () => {
    assert.equal(scriptFunctions.stringIndexOf(['foo bar', 'bar'], null), 4);

    // Index provided
    assert.equal(scriptFunctions.stringIndexOf(['foo bar bar', 'bar', 5], null), 8);
    assert.equal(scriptFunctions.stringIndexOf(['foo bar bar', 'bar', 5.], null), 8);
    assert.equal(scriptFunctions.stringIndexOf(['foo bar bar', 'bar', 4], null), 4);
    assert.equal(scriptFunctions.stringIndexOf(['foo bar bar', 'bar', 0], null), 4);

    // Not Found
    assert.equal(scriptFunctions.stringIndexOf(['foo bar', 'bonk'], null), -1);

    // Not Found with index
    assert.equal(scriptFunctions.stringIndexOf(['foo bar', 'bar', 5], null), -1);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringIndexOf([null, 'bar'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': -1
        }
    );

    // Non-string search
    assert.throws(
        () => {
            scriptFunctions.stringIndexOf(['foo bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "search" argument value, null',
            'returnValue': -1
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.stringIndexOf(['foo bar', 'bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, null',
            'returnValue': -1
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.stringIndexOf(['foo bar', 'bar', 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 1.5',
            'returnValue': -1
        }
    );

    // Out-of-range index
    assert.throws(
        () => {
            scriptFunctions.stringIndexOf(['foo bar', 'bar', -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1',
            'returnValue': -1
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringIndexOf(['foo bar', 'bar', 7], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 7',
            'returnValue': -1
        }
    );
});


test('library, stringLastIndexOf', () => {
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar'], null), 8);

    // Index provided
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar', 10], null), 8);
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar', 10.0], null), 8);
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar', 9], null), 8);
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar', 8], null), 8);
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar bar', 'bar', 7], null), 4);

    // Not Found
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar', 'bonk'], null), -1);

    // Not Found with index
    assert.equal(scriptFunctions.stringLastIndexOf(['foo bar', 'bar', 3], null), -1);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringLastIndexOf([null, 'bar'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': -1
        }
    );

    // Non-string search
    assert.throws(
        () => {
            scriptFunctions.stringLastIndexOf(['foo bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "search" argument value, null',
            'returnValue': -1
        }
    );

    // Non-number index
    assert.throws(
        () => {
            scriptFunctions.stringLastIndexOf(['foo bar', 'bar', 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, "abc"',
            'returnValue': -1
        }
    );

    // Non-integer index
    assert.throws(
        () => {
            scriptFunctions.stringLastIndexOf(['foo bar', 'bar', 5.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 5.5',
            'returnValue': -1
        }
    );

    // Out-of-range index
    assert.throws(
        () => {
            scriptFunctions.stringLastIndexOf(['foo bar', 'bar', -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, -1',
            'returnValue': -1
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringLastIndexOf(['foo bar', 'bar', 7], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "index" argument value, 7',
            'returnValue': -1
        }
    );
});


test('library, stringLength', () => {
    assert.equal(scriptFunctions.stringLength(['foo'], null), 3);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringLength([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': 0
        }
    );
});


test('library, stringLower', () => {
    assert.equal(scriptFunctions.stringLower(['Foo'], null), 'foo');

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringLower([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


test('library, stringNew', () => {
    assert.equal(scriptFunctions.stringNew([123], null), '123');

    // Non-string value
    assert.equal(scriptFunctions.stringNew([null], null), 'null');
    assert.equal(scriptFunctions.stringNew([true], null), 'true');
    assert.equal(scriptFunctions.stringNew([false], null), 'false');
    assert.equal(scriptFunctions.stringNew([0], null), '0');
    assert.equal(scriptFunctions.stringNew([0.], null), '0');
    const dt = valueParseDatetime('2022-06-21T12:30:15.100+00:00');
    assert.equal(scriptFunctions.stringNew([dt], null), valueString(dt));
    assert.equal(scriptFunctions.stringNew([{'b': 2, 'a': 1}], null), '{"a":1,"b":2}');
    assert.equal(scriptFunctions.stringNew([[1, 2, 3]], null), '[1,2,3]');
    assert.equal(scriptFunctions.stringNew([scriptFunctions.stringNew], null), '<function>');
    assert.equal(scriptFunctions.stringNew([/^test/], null), '<regex>');
});


test('library, stringRepeat', () => {
    assert.equal(scriptFunctions.stringRepeat(['abc', 2], null), 'abcabc');
    assert.equal(scriptFunctions.stringRepeat(['abc', 2.], null), 'abcabc');
    assert.equal(scriptFunctions.stringRepeat(['abc', 1], null), 'abc');
    assert.equal(scriptFunctions.stringRepeat(['abc', 0], null), '');

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringRepeat([null, 3], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-number count
    assert.throws(
        () => {
            scriptFunctions.stringRepeat(['abc', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "count" argument value, null',
            'returnValue': null
        }
    );

    // Non-integer count
    assert.throws(
        () => {
            scriptFunctions.stringRepeat(['abc', 1.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "count" argument value, 1.5',
            'returnValue': null
        }
    );

    // Negative count
    assert.throws(
        () => {
            scriptFunctions.stringRepeat(['abc', -2], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "count" argument value, -2',
            'returnValue': null
        }
    );
});


test('library, stringReplace', () => {
    assert.equal(scriptFunctions.stringReplace(['foo bar', 'bar', 'bonk'], null), 'foo bonk');
    assert.equal(scriptFunctions.stringReplace(['foo bar bar', 'bar', 'bonk'], null), 'foo bonk bonk');

    // Not found
    assert.equal(scriptFunctions.stringReplace(['foo bar', 'abc', 'bonk'], null), 'foo bar');

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringReplace([null, 'bar', 'bonk'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-string search
    assert.throws(
        () => {
            scriptFunctions.stringReplace(['foo bar', null, 'bonk'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "substr" argument value, null',
            'returnValue': null
        }
    );

    // Non-string replacement
    assert.throws(
        () => {
            scriptFunctions.stringReplace(['foo bar', 'bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "newSubstr" argument value, null',
            'returnValue': null
        }
    );
});


test('library, stringSlice', () => {
    assert.equal(scriptFunctions.stringSlice(['foo bar', 1, 5], null), 'oo b');
    assert.equal(scriptFunctions.stringSlice(['foo bar', 1., 5.], null), 'oo b');
    assert.equal(scriptFunctions.stringSlice(['foo bar', 0, 7], null), 'foo bar');
    assert.equal(scriptFunctions.stringSlice(['foo bar', 1, 6], null), 'oo ba');

    // Empty slice
    assert.equal(scriptFunctions.stringSlice(['foo bar', 7], null), '');
    assert.equal(scriptFunctions.stringSlice(['foo bar', 1, 1], null), '');

    // No end index
    assert.equal(scriptFunctions.stringSlice(['foo bar', 1], null), 'oo bar');

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringSlice([null, 1, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-number begin/end
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', null, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, null',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', 1, 'abc'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, "abc"',
            'returnValue': null
        }
    );

    // Non-integer begin/end
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', 1.5, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, 1.5',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', 1, 5.5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, 5.5',
            'returnValue': null
        }
    );

    // Out-of-range begin/end
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', -1, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, -1',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', 8, 5], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "start" argument value, 8',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', 1, -1], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, -1',
            'returnValue': null
        }
    );
    assert.throws(
        () => {
            scriptFunctions.stringSlice(['foo bar', 1, 8], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "end" argument value, 8',
            'returnValue': null
        }
    );
});


test('library, stringSplit', () => {
    assert.deepEqual(scriptFunctions.stringSplit(['foo, bar', ', '], null), ['foo', 'bar']);
    assert.deepEqual(scriptFunctions.stringSplit(['foo, bar, bonk', ', '], null), ['foo', 'bar', 'bonk']);

    // Not found
    assert.deepEqual(scriptFunctions.stringSplit(['foo', ', '], null), ['foo']);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringSplit([null, ', '], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-string separator
    assert.throws(
        () => {
            scriptFunctions.stringSplit(['foo, bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "separator" argument value, null',
            'returnValue': null
        }
    );
});


test('library, stringStartsWith', () => {
    assert.equal(scriptFunctions.stringStartsWith(['foo bar', 'foo'], null), true);
    assert.equal(scriptFunctions.stringStartsWith(['foo bar', 'bar'], null), false);

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringStartsWith([null, 'foo'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );

    // Non-string search
    assert.throws(
        () => {
            scriptFunctions.stringStartsWith(['foo bar', null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "search" argument value, null',
            'returnValue': null
        }
    );
});


test('library, stringTrim', () => {
    assert.equal(scriptFunctions.stringTrim([' abc  '], null), 'abc');
    assert.equal(scriptFunctions.stringTrim(['\tabc\n'], null), 'abc');
    assert.equal(scriptFunctions.stringTrim(['abc'], null), 'abc');

    //  Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringTrim([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


test('library, stringUpper', () => {
    assert.equal(scriptFunctions.stringUpper(['Foo'], null), 'FOO');

    // Non-string value
    assert.throws(
        () => {
            scriptFunctions.stringUpper([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "string" argument value, null',
            'returnValue': null
        }
    );
});


//
// System functions
//


test('library, systemBoolean', () => {
    assert.equal(scriptFunctions.systemBoolean([[1, 2, 3]], null), true);
    assert.equal(scriptFunctions.systemBoolean([[]], null), false);
    assert.equal(scriptFunctions.systemBoolean([true], null), true);
    assert.equal(scriptFunctions.systemBoolean([false], null), false);
    assert.equal(scriptFunctions.systemBoolean([new Date()], null), true);
    assert.equal(scriptFunctions.systemBoolean([scriptFunctions.systemBoolean], null), true);
    assert.equal(scriptFunctions.systemBoolean([null], null), false);
    assert.equal(scriptFunctions.systemBoolean([0], null), false);
    assert.equal(scriptFunctions.systemBoolean([1], null), true);
    assert.equal(scriptFunctions.systemBoolean([0.], null), false);
    assert.equal(scriptFunctions.systemBoolean([1.], null), true);
    assert.equal(scriptFunctions.systemBoolean([{}], null), true);
    assert.equal(scriptFunctions.systemBoolean([/^abc$/], null), true);
    assert.equal(scriptFunctions.systemBoolean(['abc'], null), true);
    assert.equal(scriptFunctions.systemBoolean([''], null), false);
    assert.equal(scriptFunctions.systemBoolean([new Set()], null), true);
});


test('library, systemCompare', () => {
    // null
    assert.equal(scriptFunctions.systemCompare([null, null], null), 0);
    assert.equal(scriptFunctions.systemCompare([null, 0], null), -1);
    assert.equal(scriptFunctions.systemCompare([0, null], null), 1);

    // number
    assert.equal(scriptFunctions.systemCompare([5, 5], null), 0);
    assert.equal(scriptFunctions.systemCompare([5, 5.], null), 0);
    assert.equal(scriptFunctions.systemCompare([5., 5.], null), 0);
    assert.equal(scriptFunctions.systemCompare([5, 6], null), -1);
    assert.equal(scriptFunctions.systemCompare([5, 6.], null), -1);
    assert.equal(scriptFunctions.systemCompare([5., 6], null), -1);
    assert.equal(scriptFunctions.systemCompare([6, 5], null), 1);
    assert.equal(scriptFunctions.systemCompare([6, 5.], null), 1);
    assert.equal(scriptFunctions.systemCompare([6., 5], null), 1);

    // object
    const o1 = {'a': 1};
    const o2 = {'a': 1};
    assert.equal(scriptFunctions.systemCompare([o1, o1], null), 0);
    assert.equal(scriptFunctions.systemCompare([o1, o2], null), 0);
});


test('library, systemFetch', async () => {
    const fetchFn = (fetchURL, fetchOptions) => {
        if (fetchURL.startsWith('fail')) {
            return {'ok': false};
        }
        if (fetchURL.startsWith('raise')) {
            throw Error(fetchURL);
        }

        const body = fetchOptions.body ?? null;
        const headers = fetchOptions.headers ?? null;
        const method = fetchOptions.method ?? 'GET';
        const bodyMsg = body !== null ? ` - ${body}` : '';
        const headersMsg = headers !== null ? ` - ${valueJSON(headers)}` : '';
        return {
            'ok': true,
            'text': () => {
                if (fetchURL.startsWith('textRaise')) {
                    throw Error(fetchURL);
                }
                return `${method} ${fetchURL}${bodyMsg}${headersMsg}`;
            }
        };
    };

    let logs;
    const logFn = (message) => {
        logs.push(message);
    };

    const urlFn = (url) => `dir/${url}`;

    const options = {'debug': true, fetchFn, logFn};

    // URL
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['test.txt'], options), 'GET test.txt');
    assert.deepEqual(logs, []);

    // Request model
    logs = [];
    assert.equal(await scriptFunctions.systemFetch([{'url': 'test.txt'}], options), 'GET test.txt');
    assert.deepEqual(logs, []);

    // Array
    logs = [];
    assert.deepEqual(
        await scriptFunctions.systemFetch([['test.txt', {'url': 'test2.txt', 'body': 'abc'}]], options),
        ['GET test.txt', 'POST test2.txt - abc']
    );
    assert.deepEqual(logs, []);

    // Headers
    logs = [];
    assert.equal(
        await scriptFunctions.systemFetch([{'url': 'test.txt', 'headers': {'HEADER': 'VALUE'}}], options),
        'GET test.txt - {"HEADER":"VALUE"}'
    );
    assert.deepEqual(logs, []);

    // Empty array
    logs = [];
    assert.deepEqual(await scriptFunctions.systemFetch([[]], options), []);
    assert.deepEqual(logs, []);

    // URL function
    logs = [];
    const optionsURLFn = {'debug': true, fetchFn, logFn, urlFn};
    assert.equal(await scriptFunctions.systemFetch(['test.txt'], optionsURLFn), 'GET dir/test.txt');
    assert.deepEqual(logs, []);

    // Failure
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['fail.txt'], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for resource "fail.txt"']);

    // Exception failure
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['raise.txt'], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for resource "raise.txt"']);

    // Text exception failure
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['textRaise.txt'], options), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for resource "textRaise.txt"']);

    // Null options failure
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['test.txt'], null), null);
    assert.deepEqual(logs, []);

    // Null fetch function failure
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['test.txt'], {'debug': true, logFn}), null);
    assert.deepEqual(logs, ['BareScript: Function "systemFetch" failed for resource "test.txt"']);

    // Failure with null log function
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['test.txt'], {'debug': true}), null);
    assert.deepEqual(logs, []);

    // Failure with debug off
    logs = [];
    assert.equal(await scriptFunctions.systemFetch(['test.txt'], {logFn}), null);
    assert.deepEqual(logs, []);

    // Invalid request model
    logs = [];
    assert.rejects(
        async () => {
            await scriptFunctions.systemFetch([{}], options);
            /* c8 ignore next */
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'url' missing"
        }
    );
    assert.deepEqual(logs, []);

    // Invalid array of request models
    logs = [];
    assert.rejects(
        async () => {
            await scriptFunctions.systemFetch([[{}]], options);
            /* c8 ignore next */
        },
        {
            'name': 'ValidationError',
            'message': "Required member 'url' missing"
        }
    );
    assert.deepEqual(logs, []);

    // Unexpected input type
    logs = [];
    assert.rejects(
        async () => {
            await scriptFunctions.systemFetch([null], {logFn});
            /* c8 ignore next */
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "url" argument value, null',
            'returnValue': null
        }
    );
    assert.deepEqual(logs, []);
});


test('library, systemGlobalGet', () => {
    let options = {'globals': {'a': 1}};
    assert.equal(scriptFunctions.systemGlobalGet(['a'], options), 1);

    // Unknown
    options = {'globals': {}};
    assert.equal(scriptFunctions.systemGlobalGet(['a'], options), null);

    // Default value
    options = {'globals': {'a': 1}};
    assert.equal(scriptFunctions.systemGlobalGet(['a', 2], options), 1);
    assert.equal(scriptFunctions.systemGlobalGet(['b', 2], options), 2);

    // No globals
    options = {};
    assert.equal(scriptFunctions.systemGlobalGet(['a'], options), null);
    assert.equal(scriptFunctions.systemGlobalGet(['a', 2], options), 2);

    // Null options
    assert.equal(scriptFunctions.systemGlobalGet(['a'], null), null);
    assert.equal(scriptFunctions.systemGlobalGet(['a', 2], null), 2);

    // Non-string name
    options = {'globals': {'a': 1}};
    assert.throws(
        () => {
            scriptFunctions.systemGlobalGet([null], options);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "name" argument value, null',
            'returnValue': null
        }
    );
});


test('library, systemGlobalIncludesGet', () => {
    let options = {'globals': {}};
    assert.equal(scriptFunctions.systemGlobalIncludesGet([], options), null);

    options = {'globals': {[systemGlobalIncludesName]: {'test.bare': true}}};
    assert.deepEqual(scriptFunctions.systemGlobalIncludesGet([], options), {'test.bare': true});

    options = {};
    assert.equal(scriptFunctions.systemGlobalIncludesGet([], options), null);

    assert.equal(scriptFunctions.systemGlobalIncludesGet([], null), null);
});


test('library, systemGlobalIncludesName', () => {
    assert.equal(scriptFunctions.systemGlobalIncludesName([], null), systemGlobalIncludesName);
});


test('library, systemGlobalSet', () => {
    let options = {'globals': {}};
    assert.equal(scriptFunctions.systemGlobalSet(['a', 1], options), 1);
    assert.deepEqual(options.globals, {'a': 1});
    assert.equal(scriptFunctions.systemGlobalSet(['a', 2], options), 2);
    assert.deepEqual(options.globals, {'a': 2});

    // No globals
    options = {};
    assert.equal(scriptFunctions.systemGlobalSet(['a', 1], options), 1);

    // Null options
    assert.equal(scriptFunctions.systemGlobalSet(['a', 1], null), 1);

    // Non-string name
    options = {'globals': {}};
    assert.throws(
        () => {
            scriptFunctions.systemGlobalSet([null], options);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "name" argument value, null',
            'returnValue': null
        }
    );
});


test('library, systemIs', () => {
    // null
    assert.equal(scriptFunctions.systemIs([null, null], null), true);
    assert.equal(scriptFunctions.systemIs([null, 0], null), false);

    // number
    assert.equal(scriptFunctions.systemIs([5, 5], null), true);
    assert.equal(scriptFunctions.systemIs([5, 5.], null), true);
    assert.equal(scriptFunctions.systemIs([5, 6], null), false);

    // object
    const o1 = {'a': 1};
    const o2 = {'a': 1};
    assert.equal(scriptFunctions.systemIs([o1, o1], null), true);
    assert.equal(scriptFunctions.systemIs([o1, o2], null), false);
});


test('library, systemLog', () => {
    let logs = [];
    function logFn(string) {
        logs.push(string);
    }

    let options = {'logFn': logFn};
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);

    // Debug
    logs = [];
    options = {'logFn': logFn, 'debug': true};
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);

    // No-debug
    logs = [];
    options = {'logFn': logFn, 'debug': false};
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);

    // Null options
    logs = [];
    options = null;
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, []);

    // No log function
    logs = [];
    options = {};
    assert.equal(scriptFunctions.systemLog(['Hello'], options), undefined);
    assert.deepEqual(logs, []);

    // Non-string message
    logs = [];
    options = {'logFn': logFn};
    assert.equal(scriptFunctions.systemLog([null], options), undefined);
    assert.deepEqual(logs, ['null']);
});


test('library, systemLogDebug', () => {
    let logs = [];
    function logFn(string) {
        logs.push(string);
    }

    let options = {'logFn': logFn};
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, []);

    // Debug
    logs = [];
    options = {'logFn': logFn, 'debug': true};
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, ['Hello']);

    // No-debug
    logs = [];
    options = {'logFn': logFn, 'debug': false};
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, []);

    // Null options
    logs = [];
    options = null;
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, []);

    // No log function
    logs = [];
    options = {'debug': true};
    assert.equal(scriptFunctions.systemLogDebug(['Hello'], options), undefined);
    assert.deepEqual(logs, []);

    // Non-string message
    logs = [];
    options = {'logFn': logFn, 'debug': true};
    assert.equal(scriptFunctions.systemLogDebug([null], options), undefined);
    assert.deepEqual(logs, ['null']);
});


test('library, systemPartial', async () => {
    function testFn(args, options) {
        const [name, number] = args;
        assert.equal(name, 'test');
        assert.equal(number, 1);
        assert.deepEqual(options, {'debug': false});
        return `${name}-${number}`;
    }
    const partialFn = scriptFunctions.systemPartial([testFn, 'test'], null);
    assert.equal(typeof partialFn, 'function');
    assert.equal(partialFn.constructor.name, 'Function');
    assert.equal(partialFn([1], {'debug': false}), 'test-1');

    // Async function
    // eslint-disable-next-line require-await
    async function asyncTestFn(args, options) {
        const [name, number] = args;
        assert.equal(name, 'test');
        assert.equal(number, 1);
        assert.deepEqual(options, {'debug': false});
        return `${name}-${number}`;
    }
    const asyncPartialFn = scriptFunctions.systemPartial([asyncTestFn, 'test'], null);
    assert.equal(typeof asyncPartialFn, 'function');
    assert.equal(asyncPartialFn.constructor.name, 'AsyncFunction');
    assert.equal(await asyncPartialFn([1], {'debug': false}), 'test-1');


    // Non-function
    assert.throws(
        () => {
            scriptFunctions.systemPartial([null, 'test'], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "func" argument value, null',
            'returnValue': null
        }
    );

    // No args
    assert.throws(
        () => {
            scriptFunctions.systemPartial([testFn], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "args" argument value, []',
            'returnValue': null
        }
    );
});


test('library, systemType', () => {
    assert.equal(scriptFunctions.systemType([[1, 2, 3]], null), 'array');
    assert.equal(scriptFunctions.systemType([true], null), 'boolean');
    assert.equal(scriptFunctions.systemType([false], null), 'boolean');
    assert.equal(scriptFunctions.systemType([new Date()], null), 'datetime');
    assert.equal(scriptFunctions.systemType([scriptFunctions.systemType], null), 'function');
    assert.equal(scriptFunctions.systemType([null], null), 'null');
    assert.equal(scriptFunctions.systemType([0], null), 'number');
    assert.equal(scriptFunctions.systemType([0.], null), 'number');
    assert.equal(scriptFunctions.systemType([{}], null), 'object');
    assert.equal(scriptFunctions.systemType([/^abc$/], null), 'regex');
    assert.equal(scriptFunctions.systemType(['abc'], null), 'string');
    assert.equal(scriptFunctions.systemType([new Set()], null), null);
});


//
// URL functions
//


test('script library, urlEncode', () => {
    assert.equal(
        scriptFunctions.urlEncode(["https://foo.com/this & 'that' + 2!"], null),
        "https://foo.com/this%20&%20'that'%20+%202!"
    );
    assert.equal(
        scriptFunctions.urlEncode(['https://foo.com/this (& that) + 2'], null),
        'https://foo.com/this%20%28&%20that%29%20+%202'
    );

    // Hash param URL
    assert.equal(
        scriptFunctions.urlEncode(['#url=other.md'], null),
        '#url=other.md'
    );

    // Non-string URL
    assert.throws(
        () => {
            scriptFunctions.urlEncode([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "url" argument value, null',
            'returnValue': null
        }
    );
});


test('script library, urlEncodeComponent', () => {
    assert.equal(
        scriptFunctions.urlEncodeComponent(["https://foo.com/this & 'that' + 2"], null),
        "https%3A%2F%2Ffoo.com%2Fthis%20%26%20'that'%20%2B%202"
    );
    assert.equal(
        scriptFunctions.urlEncodeComponent(['https://foo.com/this (& that) + 2'], null),
        'https%3A%2F%2Ffoo.com%2Fthis%20%28%26%20that%29%20%2B%202'
    );

    // Non-string URL
    assert.throws(
        () => {
            scriptFunctions.urlEncodeComponent([null], null);
        },
        {
            'name': 'ValueArgsError',
            'message': 'Invalid "url" argument value, null',
            'returnValue': null
        }
    );
});
